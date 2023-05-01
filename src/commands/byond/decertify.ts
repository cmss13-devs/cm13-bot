import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';

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
		await interaction.reply('Contacting database...');

		const user = interaction.options.getUser('user', true);

		const data = await queryDatabase('decertify_by_discord_id', { discord_id: user.id });

		return await interaction.editReply({
			content: data['response']
		});
	}
}
