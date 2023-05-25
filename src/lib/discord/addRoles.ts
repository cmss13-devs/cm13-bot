import { container } from '@sapphire/framework';
import type { User } from 'discord.js';

export const addRoles = async (user: User, roles: Array<string> | null, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD || !roles) return;

	await container.client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD)?.members.cache.get(user.id)?.roles.add(roles, reason);
};
