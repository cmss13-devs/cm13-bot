import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { EmbedBuilder, userMention } from 'discord.js';
import { removeAllRoles } from '../../lib/discord/removeAllRoles';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { failQuery } from '../../lib/byond/failQuery';
import { addRoles } from '../../lib/discord/addRoles';

@ApplyOptions<Command.Options>({
	description: 'Decertify a User.'
})
export class UserCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			name: 'decertify',
			subcommands: [
				{ name: 'ckey', chatInputRun: 'ckeyDecertifyRun' },
				{ name: 'user', chatInputRun: 'userDecertifyRun' }
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
						.setDescription('Decertify a player by CKEY.')
						.addStringOption((option) => option.setName('ckey').setDescription('The CKEY to decertify').setRequired(true))
				)
				.addSubcommand((command) =>
					command
						.setName('user')
						.setDescription('Decertify a player by Discord User')
						.addUserOption((option) => option.setName('user').setDescription('The Discord User to decertify.').setRequired(true))
				)
		);
	}

	// slash command
	public async userDecertifyRun(interaction: Command.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.GUILD) return

		await interaction.deferReply();

		const user = interaction.options.getUser('user', true);

		const data = await queryDatabase('decertify_discord_id', { discord_id: user.id });

		return await this.completeDecertification(interaction, data, user.id, data.data.ckey);
	}

	public async ckeyDecertifyRun(interaction: Command.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.GUILD) return

		await interaction.deferReply();

		const ckey = interaction.options.getString('ckey', true);

		const data = await queryDatabase('decertify_ckey', { ckey: ckey });

		return await this.completeDecertification(interaction, data, data.data.discord_id, ckey);
	}

	public async completeDecertification(interaction: Subcommand.ChatInputCommandInteraction, data: any, user_id: string, ckey: string) {
		if (data.statuscode !== 200) {
			return await failQuery(interaction, data.response);
		}

		const embed = new EmbedBuilder()
			.setColor('Green')
			.setTitle('Decertification Successful')
			.setDescription(`${userMention(user_id)} (${ckey}) de-certified.`);

		await interaction.editReply({ embeds: [embed] });

		const user = interaction.client.users.cache.get(data.data.discord_id);
		if (!user) return;

		if (process.env.WAITING_ROLE) await addRoles(user, [process.env.WAITING_ROLE]);
		return await removeAllRoles(user);
	}
}
