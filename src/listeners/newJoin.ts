import { Events } from '@sapphire/framework';
import { Listener } from '@sapphire/framework';
import { TextChannel, type GuildMember, EmbedBuilder, userMention } from 'discord.js';

export class NewJoin extends Listener<typeof Events.GuildMemberAdd> {
	public constructor(context: Listener.Context, options: Listener.Options) {
		super(context, {
			...options,
			once: false,
			event: Events.GuildMemberAdd
		});
	}
	public async run(member: GuildMember) {
		if (!process.env.JOIN_CHANNEL || !process.env.GUILD || member.guild.id !== process.env.GUILD) {
			return;
		}

		const sendChannel = member.client.guilds.cache.get(process.env.GUILD)?.channels.cache.get(process.env.JOIN_CHANNEL);
		if (!(sendChannel instanceof TextChannel)) return;

		const embed = new EmbedBuilder();
		embed.setAuthor({ name: 'Welcome to CM-SS13' });
		embed.setDescription(
			`Hey ${userMention(
				member.id
			)}, we require you to verify in game before you are able to talk in this server. To follow this process, head to https://cm-ss13.com/wiki/Discord_Verification. This process requires a minimum of 160 minutes playtime total to complete.`
		);
		embed.setColor('Green');
		embed.setTimestamp();

		sendChannel.send({ embeds: [embed], content: userMention(member.id) });
	}
}
