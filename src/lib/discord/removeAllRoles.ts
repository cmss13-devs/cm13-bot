import type { User } from 'discord.js';
import { removeRole } from './removeRole';

export const removeAllRoles = async (user: User, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD) return;

	if (process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE) removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE, reason);
	if (process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE) removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE, reason);
	if (process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE) removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE, reason);
	if (process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE) removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE, reason);
	if (process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE) removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE, reason);

	return;
};
