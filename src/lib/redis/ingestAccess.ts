import { EmbedBuilder, TextChannel, roleMention } from 'discord.js';
import { container } from '@sapphire/framework';
import { days, Time } from '@sapphire/time-utilities';

export const ingestAccess = async (message: string, channel: string) => {
	if (!process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL) return;

	const { client } = container;

	const channelToUse = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_MOD_CHANNEL);

	if (!channelToUse || !channel) return;

	if (!(channelToUse instanceof TextChannel)) return;

	const data = JSON.parse(message);

	const embedToSend = new EmbedBuilder();
	embedToSend.setAuthor({ name: `${data['key']}` });
	embedToSend.setColor(data['type'] === 'login' ? 'Green' : 'Red');
	embedToSend.setDescription(`Logged ${data['type'] === 'login' ? 'in' : 'out'} with ${data['remaining']} staff online. (${data['afk']} AFK)`);
	embedToSend.setTimestamp();
	embedToSend.setFooter({ text: `@${data['source']}` });

	channelToUse.send({ embeds: [embedToSend] });

	if(!process.env.CM13_BOT_DISCORD_GUILD_ALERT_CHANNEL) return;

	if(data.type === "login" || data.remaining - data.afk >= 2) return;

	if((container.cooldownPing + (5 * Time.Minute)) < Date.now()) return;

	const emptyChannel = client.channels.cache.get(process.env.CM13_BOT_DISCORD_GUILD_ALERT_CHANNEL);

	if(!(emptyChannel instanceof TextChannel)) return;

	const toPing = process.env.CM13_BOT_DISCORD_GUILD_ALERT_PINGS.split(',')

	var pingString = "";
	toPing.forEach(element => {
		pingString = pingString + roleMention(element) + " ";
	});

	const serverEmpty = new EmbedBuilder();
	serverEmpty.setColor('DarkRed')
	serverEmpty.setDescription("Only 1 member of staff remaining on the server.")
	serverEmpty.setTimestamp();
	serverEmpty.setFooter({ text: `@${data.source}` });

	emptyChannel.send({ embeds: [serverEmpty], content: pingString })

	container.cooldownPing = Date.now()

};
