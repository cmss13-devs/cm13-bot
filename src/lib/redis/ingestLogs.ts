import { TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export const ingestLogs = async (message: string, channel: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_LOG_CHANNEL) return;

	if (!message || !channel) return;

	const { client } = container;

	const channelLogs = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_LOG_CHANNEL);

	if (!(channelLogs instanceof TextChannel)) return;

	const channels = channel.split('.');
	const channelName = channels[3].toUpperCase();

	const parsed = message.replaceAll(/([\<].*?[\>])/g, '').replaceAll(/\*/g, '\\*');

	channelLogs.send(`${channelName}: ${parsed}`);
};
