import { container } from '@sapphire/framework';
import type { User } from 'discord.js';

export const removeRole = async (user: User, role: string, reason?: string) => {
	if (!process.env.GUILD || !role) return;

	container.client.guilds.cache.get(process.env.GUILD)?.members.cache.get(user.id)?.roles.remove(role, reason);
};
