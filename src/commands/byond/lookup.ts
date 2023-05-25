import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { EmbedBuilder, roleMention, userMention } from 'discord.js';
import { processWhitelist } from '../../lib/byond/processWhitelist';
import { failQuery } from '../../lib/byond/failQuery';

@ApplyOptions<Command.Options>({
	description: 'Lookup a User.'
})
export class UserCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			name: 'lookup',
			subcommands: [
				{ name: 'ckey', chatInputRun: 'ckeyLookupRun' },
				{ name: 'user', chatInputRun: 'userLookupRun' }
			]
		});
	}

	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setDefaultMemberPermissions(0)
				.addSubcommand((command) =>
					command
						.setName('ckey')
						.setDescription('Lookup a player by CKEY.')
						.addStringOption((option) => option.setName('ckey').setDescription('The CKEY to look up').setRequired(true))
				)
				.addSubcommand((command) =>
					command
						.setName('user')
						.setDescription('Lookup a player by Discord User')
						.addUserOption((option) => option.setName('user').setDescription('The Discord User to look up.').setRequired(true))
				)
		);
	}

	// slash command
	public async userLookupRun(interaction: Subcommand.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return

		await interaction.deferReply();

		const user = interaction.options.getUser('user', true);

		const data = await queryDatabase('lookup_discord_id', { discord_id: user.id });

		return await this.lookupDataResponse(interaction, data, user.id, data.data.ckey);
	}

	public async ckeyLookupRun(interaction: Command.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return

		await interaction.deferReply();

		const ckey = interaction.options.getString('ckey', true);

		const data = await queryDatabase('lookup_ckey', { ckey: ckey });

		return await this.lookupDataResponse(interaction, data, data.data.discord_id, ckey);
	}

	public async lookupDataResponse(interaction: Subcommand.ChatInputCommandInteraction, data: any, discord_id: string | null, ckey: string) {
		if (data.statuscode !== 200) {
			return await failQuery(interaction, data.response);
		}

		const embed = new EmbedBuilder().setTitle(`Data for ${ckey}`).setColor('Green');

		if (discord_id && discord_id.length) {
			embed.addFields({ name: 'User:', value: `${userMention(discord_id)}` });
		}

		if (data.data.roles && data.data.roles.length) {
			const whitelistRoles = processWhitelist(data.data.roles);
			if (whitelistRoles) {
				let roleString = '';
				for (let role of whitelistRoles) {
					roleString += `${roleMention(role)}\n`;
				}
				embed.addFields({ name: 'Whitelists:', value: `${roleString}` });
			}
		}

		if (data.data.total_minutes && data.data.total_minutes > 0) {
			embed.addFields({ name: 'Total Playtime:', value: `${data.data.total_minutes} minutes` });
		}

		if (data.data.notes && data.data.notes.length) {
			let noteString = '**Notes:**\n';
			for (let note of data.data.notes) {
				noteString += `${note}\n\n`;
			}
			embed.setDescription(noteString);
		}

		return await interaction.editReply({
			embeds: [embed]
		});
	}
}
