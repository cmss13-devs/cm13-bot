import type { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { TextChannel } from 'discord.js';
import { container } from '@sapphire/framework';

export class UserEvent extends Listener<typeof Events.MessageCreate> {
	public async run(message: Message) {
		if (!process.env.CM13_BOT_REDIS_URL) return;

		if (message.author.id == message.client.id) return;

		if (message.author.bot) return;

		if (!(message.channel instanceof TextChannel)) return;

		const guildmember = await message.guild?.members.fetch(message.author);

		if (!guildmember) return;

		const { redisPub } = container;

		if (message.channel.id === process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL)
			redisPub.publish(
				'byond.msay',
				JSON.stringify({
					author: message.author.username,
					source: 'discord',
					message: message.content,
					rank: guildmember.roles.highest.name.replaceAll(' ', '')
				})
			);

		if (message.channel.id === process.env.CM13_BOT_DISCORD_GUILD_ADMIN_CHANNEL)
			redisPub.publish(
				'byond.asay',
				JSON.stringify({
					author: message.author.username,
					source: 'discord',
					message: message.content,
					rank: guildmember.roles.highest.name.replaceAll(' ', '')
				})
			);
	}
}
