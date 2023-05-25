import { container } from '@sapphire/framework';
import type { User } from 'discord.js';

export const removeRole = async (user: User, role: string, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD || !role) return;

	await container.client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD)?.members.cache.get(user.id)?.roles.remove(role, reason);
};
