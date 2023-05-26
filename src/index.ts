import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { GatewayIntentBits, Partials } from 'discord.js';
import { container } from '@sapphire/framework';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { ingestTextChat } from './lib/redis/ingestTextChannel';
import { ingestAccess } from './lib/redis/ingestAccess';
import { ingestRoundUpdate } from './lib/redis/ingestRoundUpdate';
import { ingestConnection } from './lib/redis/ingestConnection';
import { ingestTicket } from './lib/redis/ingestTicket';
import { ingestLogs } from './lib/redis/ingestLogs';

const client = new SapphireClient({
	defaultPrefix: '/',
	regexPrefix: /^(hey +)?bot[,! ]/i,
	caseInsensitiveCommands: true,
	logger: {
		level: LogLevel.Debug
	},
	shards: 'auto',
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildEmojisAndStickers,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent
	],
	partials: [Partials.Channel, Partials.GuildMember],
	loadMessageCommandListeners: true
});

container.redisPub = createClient({
	url: process.env.CM13_BOT_REDIS_URL
});
container.redisSub = createClient({
	url: process.env.CM13_BOT_REDIS_URL
});

const main = async () => {
	try {
		client.logger.info('Logging in.');
		await client.login(process.env.CM13_DISCORD_BOT_TOKEN);
		client.logger.info('Logged in.');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}

	if (process.env.CM13_BOT_REDIS_URL) setupRedis();
};

main();

const setupRedis = async () => {
	const { redisPub, redisSub } = container;

	redisPub.connect();
	redisSub.connect();

	redisSub.subscribe('byond.msay', ingestTextChat);
	redisSub.subscribe('byond.asay', ingestTextChat);
	redisSub.subscribe('byond.access', ingestAccess);
	redisSub.subscribe('byond.round', ingestRoundUpdate);
	redisSub.subscribe('byond.meta', ingestConnection);
	redisSub.subscribe('byond.ticket', ingestTicket);
	redisSub.subscribe('byond.log.cm13-live.admin', ingestLogs);
};

declare module '@sapphire/pieces' {
	interface Container {
		redisSub: RedisClientType;
		redisPub: RedisClientType;
		processingEnquiry: boolean;
	}
}
