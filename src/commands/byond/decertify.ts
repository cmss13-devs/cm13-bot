import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { userMention } from 'discord.js';
import { removeAllRoles } from '../../lib/discord/removeAllRoles';

@ApplyOptions<Command.Options>({
	description: 'Decertify a User.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption((option) => option.setName('user').setDescription('The user to decertify.').setRequired(true))
				.setDefaultMemberPermissions(0)
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		await interaction.reply('Contacting database...');

		const user = interaction.options.getUser('user', true);

		const data = await queryDatabase('decertify_discord_id', { discord_id: user.id });

		if (data.statuscode !== 200) {
			return await interaction.editReply({ content: `Decertification unsuccessful: ${data.response}` });
		}

		await interaction.editReply({ content: `Decertification successful: ${userMention(user.id)} (${data.data.ckey}) decertified.` });

		return await removeAllRoles(user);
	}
}
