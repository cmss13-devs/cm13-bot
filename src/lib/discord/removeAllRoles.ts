import type { User } from 'discord.js';
import { removeRole } from './removeRole';

export const removeAllRoles = async (user: User) => {
	if (!process.env.GUILD) return;

	if (process.env.CERTIFIED_ROLE) removeRole(user, process.env.CERTIFIED_ROLE);
	if (process.env.VERIFIED_ROLE) removeRole(user, process.env.VERIFIED_ROLE);
	if (process.env.SYNTHETIC_ROLE) removeRole(user, process.env.SYNTHETIC_ROLE);
	if (process.env.COMMANDER_ROLE) removeRole(user, process.env.COMMANDER_ROLE);
	if (process.env.YAUTJA_ROLE) removeRole(user, process.env.YAUTJA_ROLE);

	return;
};
