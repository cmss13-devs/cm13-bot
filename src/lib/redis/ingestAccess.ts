import { EmbedBuilder, TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export const ingestAccess = async (message: string, channel: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL) return;

	const { client } = container;

	const channelToUse = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL);

	if (!channelToUse || !channel) return;

	if (!(channelToUse instanceof TextChannel)) return;

	const data = JSON.parse(message);

	const embedToSend = new EmbedBuilder();
	embedToSend.setAuthor({ name: `${data['key']}` });
	embedToSend.setColor(data['type'] === 'login' ? 'Green' : 'Red');
	embedToSend.setDescription(`Logged ${data['type'] === 'login' ? 'in' : 'out'} with ${data['remaining']} staff online. (${data['afk']} AFK)`);
	embedToSend.setTimestamp();
	embedToSend.setFooter({ text: `@${data['source']}` });

	channelToUse.send({ embeds: [embedToSend] });
};
