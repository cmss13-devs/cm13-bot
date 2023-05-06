import type { User } from 'discord.js';
import { removeRole } from './removeRole';

export const removeAllRoles = async (user: User, reason?: string) => {
	if (!process.env.GUILD) return;

	if (process.env.CERTIFIED_ROLE) removeRole(user, process.env.CERTIFIED_ROLE, reason);
	if (process.env.VERIFIED_ROLE) removeRole(user, process.env.VERIFIED_ROLE, reason);
	if (process.env.SYNTHETIC_ROLE) removeRole(user, process.env.SYNTHETIC_ROLE, reason);
	if (process.env.COMMANDER_ROLE) removeRole(user, process.env.COMMANDER_ROLE, reason);
	if (process.env.YAUTJA_ROLE) removeRole(user, process.env.YAUTJA_ROLE, reason);

	return;
};
