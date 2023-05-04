export const processWhitelist = (whitelists: Array<string>): Array<string> | null => {
	const roles = [];
	if (whitelists.includes('predator') && process.env.YAUTJA_ROLE) roles.push(process.env.YAUTJA_ROLE);
	if (whitelists.includes('commander') && process.env.COMMANDER_ROLE) roles.push(process.env.COMMANDER_ROLE);
	if (whitelists.includes('synthetic') && process.env.SYNTHETIC_ROLE) roles.push(process.env.SYNTHETIC_ROLE);
	return roles;
};
