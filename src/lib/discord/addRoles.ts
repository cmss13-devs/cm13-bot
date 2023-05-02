import { container } from '@sapphire/framework';
import type { User } from 'discord.js';

export const addRoles = async (user: User, roles: Array<string> | null) => {
	if (!process.env.GUILD || !roles) return;

	for (let role of roles) {
		container.client.guilds.cache.get(process.env.GUILD)?.members.cache.get(user.id)?.roles.add(role);
	}
};
