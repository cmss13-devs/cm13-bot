import { sendTopic } from 'http2byond';

export interface ByondQuery {
	query: string;
}

export const queryDatabase = async (query: string, additional?: object): Promise<any> => {
	if (!process.env.CM13_BOT_GAME_AUTH_TOKEN || !process.env.CM13_BOT_GAME_SOURCE || !process.env.CM13_BOT_GAME_SERVER_HOST || !process.env.CM13_BOT_GAME_SERVER_PORT || !query) return;

	const data = await sendTopic({
		host: process.env.CM13_BOT_GAME_SERVER_HOST,
		port: parseInt(process.env.CM13_BOT_GAME_SERVER_PORT),
		topic: JSON.stringify({ auth: process.env.CM13_BOT_GAME_AUTH_TOKEN, query: query, source: process.env.CM13_BOT_GAME_SOURCE, ...additional })
	});

	if (!data) return;

	const parser = data.toString().match(/{.*}/);
	if (!parser) return;

	return JSON.parse(parser[0]);
};
