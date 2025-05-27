import './lib/setup';
import { LogLevel, SapphireClient } from '@sapphire/framework';
import { EmbedBuilder, GatewayIntentBits, Partials, TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';
import type { RedisClientType } from 'redis';
import { createClient } from 'redis';
import { ingestTextChat } from './lib/redis/ingestTextChannel';
import { ingestAccess } from './lib/redis/ingestAccess';
import { ingestRoundUpdate } from './lib/redis/ingestRoundUpdate';
import { ingestConnection } from './lib/redis/ingestConnection';
import { ingestTicket } from './lib/redis/ingestTicket';
import { ingestLogs } from './lib/redis/ingestLogs';
import { sleep } from '@sapphire/utilities';
import { Time } from '@sapphire/time-utilities';
import { queryDatabase } from './lib/byond/queryGame';
import { renderEmbed } from './commands/byond/status';

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

container.threadChannels = process.env.CM13_BOT_THREAD_CHANNEL ? process.env.CM13_BOT_THREAD_CHANNEL.split(",") : undefined;

container.redisPub = createClient({
	url: process.env.CM13_BOT_REDIS_URL
});
container.redisSub = createClient({
	url: process.env.CM13_BOT_REDIS_URL
});

const main = async () => {
	try {
		client.logger.info('Logging in.');
		await client.login(process.env.CM13_BOT_DISCORD_TOKEN);
		client.logger.info('Logged in.');
	} catch (error) {
		client.logger.fatal(error);
		client.destroy();
		process.exit(1);
	}

	if (process.env.CM13_BOT_REDIS_URL) setupRedis();
	if (process.env.CM13_BOT_STATUS_CHANNEL) statusChannel();
};

main();

const statusChannel = () => {
	updateStatusChannel()
	setTimeout(() => statusChannel(), 1 * Time.Minute)
}

const updateStatusChannel = async () => {
	const channel = container.client.channels.cache.get(process.env.CM13_BOT_STATUS_CHANNEL) as TextChannel
	if(!channel) {
		return
	}

	const data = await queryDatabase('status_authed');

	if(data.statuscode !== 200) return

	const embeds = [renderEmbed(data)]

	if(data.data.testmerges) {
		let formattedTestmerges = "";
	
		for (const testmerge of data.data.testmerges) {
			formattedTestmerges += `- [${testmerge.title} (#${testmerge.number})](${testmerge.url})\n`
		}

		embeds.push(new EmbedBuilder().setTitle("Current Testmerges").setDescription(formattedTestmerges))
	}

	channel.messages.fetch({ limit: 1, cache: false }).then((collection) => {
		const message = collection.last()

		if(!message || !message.editable) {
			message?.delete()
			channel.send({content: "", embeds: embeds})
			return
		}

		message.edit({embeds: embeds, content: ""})
	})
}

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
		threadChannels: String[];
		processingEnquiry: boolean;
		cooldownPing: number;
	}
}
