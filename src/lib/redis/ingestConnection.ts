import { EmbedBuilder, TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export const ingestConnection = async (message: string, channel: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL) return;

	if (!message || !channel) return;

	const { client } = container;

	const data = JSON.parse(message);

	const channel_msay = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL);

	if (!(channel_msay instanceof TextChannel)) return;

	const newEmbed = new EmbedBuilder();
	newEmbed.setDescription(
		`${data['type'] == 'connect' ? 'Gameserver Connected' : 'Gameserver Disconnected'}${data['reason'] ? ` - ${data['reason']}` : ''}`
	);
	newEmbed.setTitle('Redis Connection');
	newEmbed.setColor('DarkGold');
	newEmbed.setFooter({ text: `@${data['source']}` });
	newEmbed.setTimestamp();

	channel_msay.send({ embeds: [newEmbed] });
};
