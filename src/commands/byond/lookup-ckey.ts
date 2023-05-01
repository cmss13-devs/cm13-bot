import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { userMention } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Lookup a CKEY.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('ckey').setDescription('The CKEY to lookup.').setRequired(true))
				.setDefaultMemberPermissions(0)
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		await interaction.reply('Contacting database...');

		const ckey = interaction.options.getString('ckey', true);

		const data = await queryDatabase('lookup_ckey', { ckey: ckey });

		if (data.statuscode !== 200) {
			return await interaction.editReply({ content: `Lookup unsuccessful: ${data.response}` });
		}

		return await interaction.editReply({
			content: `${data.response} User: ${userMention(data.data.discord_id)}`
		});
	}
}
