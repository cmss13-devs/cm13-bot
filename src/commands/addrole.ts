import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Role } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Lookup a User.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addRoleOption((option) => option.setName('role').setDescription('Role to add.').setRequired(true))
				.setDefaultMemberPermissions(0)
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.reply('Contacting database...');

		const role = interaction.options.getRole('role', true);

		if (!(role instanceof Role)) return;

		return await interaction.guild?.members.cache.get(interaction.user.id)?.roles.add(role);
	}
}
