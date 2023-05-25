import { container } from '@sapphire/framework';
import { TextChannel } from 'discord.js';

export const logCertify = async (message: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD || !process.env.CM13_BOT_DISCORD_GUILD_CERT_CHANNEL) return;

	const channel = container.client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD)?.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_CERT_CHANNEL);

	if (!(channel instanceof TextChannel)) return;

	channel.send(message);
};
