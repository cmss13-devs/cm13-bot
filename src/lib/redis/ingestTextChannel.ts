import { EmbedBuilder, TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export const ingestTextChat = async (message: string, channel: string) => {
	if (!process.env.MOD_CHANNEL || !process.env.ADMIN_CHANNEL) return;

	const { client } = container;

	let channelToUse;

	if (channel == 'byond.msay') channelToUse = client.channels.cache.get(process.env.MOD_CHANNEL);

	if (channel == 'byond.asay') channelToUse = client.channels.cache.get(process.env.ADMIN_CHANNEL);

	if (!channelToUse) return;

	if (!(channelToUse instanceof TextChannel)) return;

	const data = JSON.parse(message);

	if (data['source'] === 'discord') return;

	const embedtoSend = new EmbedBuilder();
	embedtoSend.setAuthor({ name: `${data['author']}` });
	embedtoSend.setDescription(`${data['message']}`);
	embedtoSend.setFooter({ text: `${data['rank']}@${data['source']}` });
	embedtoSend.setTimestamp();

	if (channel == 'byond.msay') embedtoSend.setColor(data['admin'] ? '#7c440c' : '#917455');

	if (channel == 'byond.asay') embedtoSend.setColor(data['host'] ? '#653d78' : '#9611d4');

	channelToUse.send({ embeds: [embedtoSend] });
};
