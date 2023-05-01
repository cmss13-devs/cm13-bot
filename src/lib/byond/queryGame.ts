import { sendTopic } from 'http2byond';

export interface ByondQuery {
	query: string;
}

export const queryDatabase = async (query: string, additional: object) => {
	if (!process.env.AUTH_TOKEN || !process.env.SOURCE || !process.env.SERVER_HOST || !process.env.SERVER_PORT || !query) return;

	const data = await sendTopic({
		host: process.env.SERVER_HOST,
		port: parseInt(process.env.SERVER_PORT),
		topic: JSON.stringify({ auth: process.env.AUTH_TOKEN, query: query, source: process.env.SOURCE, ...additional })
	});

	if (!data) return;

	const parser = data.toString().match(/{.*}/);
	if (!parser) return;

	return JSON.parse(parser[0]);
};
