export const processWhitelist = (whitelists: Array<string>): Array<string> | null => {
	if (!process.env.YAUTJA_ROLE || !process.env.COMMANDER_ROLE || !process.env.SYNTHETIC_ROLE) return null;
	const roles = [];
	if (whitelists.includes('predator')) roles.push(process.env.YAUTJA_ROLE);
	if (whitelists.includes('commander')) roles.push(process.env.COMMANDER_ROLE);
	if (whitelists.includes('synthetic')) roles.push(process.env.SYNTHETIC_ROLE);
	return roles;
};
