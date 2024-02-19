import { container } from '@sapphire/framework';
import type { User } from 'discord.js';

export const removeRole = async (user: User, roleOrRoles: string | Array<string>, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD || !roleOrRoles) return;

	await container.client.guilds.cache.get(process.env.CM13_BOT_DISCORD_GUILD)?.members.cache.get(user.id)?.roles.remove(roleOrRoles, reason);
};
