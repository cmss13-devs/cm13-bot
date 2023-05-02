import type { User } from 'discord.js';
import { removeRole } from './removeRole';

export const removeRoles = async (user: User, roles: Array<string> | null) => {
	if (!process.env.GUILD || !roles) return;

	for (let role of roles) {
		removeRole(user, role);
	}
};
