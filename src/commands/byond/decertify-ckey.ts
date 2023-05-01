import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';

@ApplyOptions<Command.Options>({
	description: 'Decertify a CKEY.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('ckey').setDescription("The user's CKEY.").setRequired(true))
				.setDefaultMemberPermissions(0)
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		await interaction.reply('Contacting database...');

		const ckey = interaction.options.getString('ckey', true);

		const data = await queryDatabase('decertify_by_ckey', { ckey: ckey });

		await interaction.editReply({
			content: data['response']
		});

		const guild = interaction.client.guilds.cache.get(process.env.GUILD);

		return await guild?.members.cache.get(data.data.discord_id)?.roles.remove(process.env.VERIFIED_ROLE);
	}
}
