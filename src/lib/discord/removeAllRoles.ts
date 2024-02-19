import type { User } from 'discord.js';
import { removeRole } from './removeRole';

export const removeAllRoles = async (user: User, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD) return;

	const toRemove = []

	if (process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE) toRemove.push(process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE)
	if (process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE) toRemove.push(user, process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE)
	if (process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE) toRemove.push(user, process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE)
	if (process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE) toRemove.push(user, process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE)
	if (process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE) toRemove.push(user, process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE)

	await removeRole(user, toRemove)

	return;
};
