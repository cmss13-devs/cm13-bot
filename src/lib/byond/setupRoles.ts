import type { User } from 'discord.js';
import { processWhitelist } from './processWhitelist';
import { addRoles } from '../discord/addRoles';

export const setupRoles = async (user: User, roles: Array<string>) => {
	if (!process.env.VERIFIED_ROLE) return;

	const rolesToAdd = [];
	if (process.env.CERTIFIED_ROLE) rolesToAdd.push(process.env.CERTIFIED_ROLE);
	if (roles) {
		const whitelists = processWhitelist(roles);
		if (whitelists) {
			for (const whitelist of whitelists) {
				rolesToAdd.push(whitelist);
			}
		}
	}
	rolesToAdd.push(process.env.VERIFIED_ROLE);
	await addRoles(user, rolesToAdd);
};
