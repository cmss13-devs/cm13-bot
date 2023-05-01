import { container } from '@sapphire/framework';

export interface ByondQuery {
	query: string;
}

export const queryDatabase = async (query: string, additional: object) => {
	if (!process.env.AUTH_TOKEN || !process.env.SOURCE || !query) return;

	const data = await container.byondConnection.send(
		JSON.stringify({
			auth: process.env.AUTH_TOKEN,
			query: query,
			source: process.env.SOURCE,
			...additional
		})
	);

	if (!data) return;

	const parser = data.toString().match(/{.*}/);
	if (!parser) return;

	return JSON.parse(parser[0]);
};
