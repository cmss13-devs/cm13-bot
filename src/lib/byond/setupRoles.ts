import type { User } from 'discord.js';
import { processWhitelist } from './processWhitelist';
import { addRoles } from '../discord/addRoles';
import { removeRole } from '../discord/removeRole';

export const setupRoles = async (user: User, roles: Array<string>, reason?: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE) return;

	const rolesToAdd = [];
	if (process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE) rolesToAdd.push(process.env.CM13_BOT_DISCORD_GUILD_CERTIFIED_ROLE);
	if (roles) {
		const whitelists = processWhitelist(roles);
		if (whitelists) {
			for (const whitelist of whitelists) {
				rolesToAdd.push(whitelist);
			}
		}
	}
	rolesToAdd.push(process.env.CM13_BOT_DISCORD_GUILD_VERIFIED_ROLE);
	await addRoles(user, rolesToAdd, reason);
	if (process.env.CM13_BOT_DISCORD_GUILD_WAITING_ROLE) await removeRole(user, process.env.CM13_BOT_DISCORD_GUILD_WAITING_ROLE, reason);
};
