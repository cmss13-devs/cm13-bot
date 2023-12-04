import { EmbedBuilder, TextChannel, formatEmoji } from 'discord.js';
import { container } from '@sapphire/framework';
import { Time } from '@sapphire/duration';

export const ingestRoundUpdate = async (message: string, channel: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL || !process.env.CM13_BOT_GAME_MAIN_INSTANCE || !message || !channel) return;

	const { client } = container;
	const data = JSON.parse(message);

	if (data['source'] === process.env.CM13_BOT_GAME_MAIN_INSTANCE) {
		if (data['type'] === 'round-start') newThread(data.round_id)
	}

	const channel_msay = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL);
	if (!channel_msay || !(channel_msay instanceof TextChannel)) return;

	if (process.env.CM13_BOT_DISCORD_EMOJI_BLUE) {
		channel_msay.send(
			`${formatEmoji(process.env.CM13_BOT_DISCORD_EMOJI_BLUE)} \`Round Update\`@\`${data.source}\`: ${
				data.type === 'round-complete' ? 'Round Completed' : 'Round Started'
			}`
		);
		return;
	}

	const newEmbed = new EmbedBuilder();
	newEmbed.setDescription(data['type'] === 'round-complete' ? 'Round Completed' : 'Round Started');
	newEmbed.setTitle('Game Update');
	newEmbed.setColor('Blue');
	newEmbed.setFooter({ text: `@${data['source']}` });
	newEmbed.setTimestamp();

	channel_msay.send({ embeds: [newEmbed] });
};

export const unlockLrc = async () => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_TALK_CHANNEL || !process.env.CM13_BOT_DISCORD_GUILD || !process.env.CM13_BOT_DISCORD_GUILD_TOGGLE_ROLE)
		return;

	const { client } = container;

	const lastRoundChat = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_TALK_CHANNEL);
	if (!(lastRoundChat instanceof TextChannel)) return;

	const server = client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD);
	if (!server) return;

	const roleToEdit = server.roles.cache.get(process.env.CM13_BOT_DISCORD_GUILD_TOGGLE_ROLE);
	if (!roleToEdit) return;

	lastRoundChat.permissionOverwrites.edit(roleToEdit, { SendMessages: true });

	const newEmbed = new EmbedBuilder();
	newEmbed.setDescription('This channel will be locked when the next round begins. :lock:');
	newEmbed.setTitle('Round Complete');
	newEmbed.setTimestamp();
	newEmbed.setColor('Green');

	const hooks = await lastRoundChat.fetchWebhooks();
	const webhook = hooks.first();
	if (!webhook) return;

	webhook.send({
		embeds: [newEmbed],
		username: process.env.CM13_BOT_DISCORD_WEBHOOK_NAME,
		avatarURL: process.env.CM13_BOT_DISCORD_WEBHOOK_PROFILE_PICTURE
	});
};

export const lockLrc = async () => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_TALK_CHANNEL || !process.env.CM13_BOT_DISCORD_GUILD || !process.env.CM13_BOT_DISCORD_GUILD_TOGGLE_ROLE)
		return;

	const { client } = container;

	const lastRoundChat = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_TALK_CHANNEL);
	if (!(lastRoundChat instanceof TextChannel)) return;

	const server = client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD);
	if (!server) return;

	const roleToEdit = server.roles.cache.get(process.env.CM13_BOT_DISCORD_GUILD_TOGGLE_ROLE);
	if (!roleToEdit) return;

	lastRoundChat.permissionOverwrites.edit(roleToEdit, { SendMessages: false });

	const newEmbed = new EmbedBuilder();
	newEmbed.setDescription('This channel will be locked until the current round finishes. :lock:');
	newEmbed.setTitle('Channel Locked');
	newEmbed.setTimestamp();
	newEmbed.setColor('Red');

	const hooks = await lastRoundChat.fetchWebhooks();
	const webhook = hooks.first();
	if (!webhook) return;

	webhook.send({
		embeds: [newEmbed],
		username: process.env.CM13_BOT_DISCORD_WEBHOOK_NAME,
		avatarURL: process.env.CM13_BOT_DISCORD_WEBHOOK_PROFILE_PICTURE
	});
};

const newThread = async (round_id: string) => {
	const { client } = container;
	
	const lastRoundChat = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_TALK_CHANNEL);
	if (!(lastRoundChat instanceof TextChannel)) return;

	const newThread = await lastRoundChat.threads.create({
		name: `${round_id}`,
		autoArchiveDuration: 60,
		reason: `${round_id} completed.`
	})

	const newEmbed = new EmbedBuilder();
	newEmbed.setDescription(`Round ${round_id} completed!`);
	newEmbed.setTitle('Round Completed');
	newEmbed.setTimestamp();
	newEmbed.setColor('Green');

	newThread.send({
		embeds: [newEmbed],
	});
}