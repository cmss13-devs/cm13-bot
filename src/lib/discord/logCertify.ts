import { container } from '@sapphire/framework';
import { TextChannel } from 'discord.js';

export const logCertify = async (message: string) => {
	if (!process.env.GUILD || !process.env.CERT_CHANNEL) return;

	const channel = container.client.guilds.cache.get(process.env.GUILD)?.channels.cache.get(process.env.CERT_CHANNEL);

	if (!(channel instanceof TextChannel)) return;

	channel.send(message);
};
