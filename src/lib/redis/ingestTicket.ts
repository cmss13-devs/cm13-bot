import { EmbedBuilder, TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export const ingestTicket = async (message: string, channel: string) => {
	if (!process.env.MOD_CHANNEL || !channel) return;

	const { client } = container;

	const channelToUse = client.channels.cache.get(process.env.MOD_CHANNEL);
	if (!channelToUse || !(channelToUse instanceof TextChannel)) return;

	const data = JSON.parse(message);

	let author;

	if (data['recipient']) {
		author = `${data['recipient']}`;
	}

	if (data['sender']) {
		author = `${data['sender']}`;
	}

	if (data['sender'] && data['recipient']) {
		author = `${data['sender']} -> ${data['recipient']}`;
	}

	const embedToSend = new EmbedBuilder();
	embedToSend.setAuthor({ name: `#${data['ticket-id']}: ${author}` });
	embedToSend.setDescription(`${data['message']}`);
	embedToSend.setColor('DarkAqua');
	embedToSend.setTimestamp();
	embedToSend.setFooter({ text: `@${data['source']}` });

	channelToUse.send({ embeds: [embedToSend] });
};
