export const processWhitelist = (whitelists: Array<string>): Array<string> | null => {
	const roles = [];
	if (whitelists.includes('predator') && process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE) roles.push(process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE);
	if (whitelists.includes('commander') && process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE) roles.push(process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE);
	if (whitelists.includes('synthetic') && process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE) roles.push(process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE);
	if (whitelists.includes('responder') && process.env.CM13_BOT_DISCORD_GUILD_RESPONDER_ROLE) roles.push(process.env.CM13_BOT_DISCORD_GUILD_RESPONDER_ROLE);
	return roles;
};
