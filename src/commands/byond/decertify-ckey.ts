import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { userMention } from 'discord.js';
import { removeAllRoles } from '../../lib/discord/removeAllRoles';

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
		await interaction.reply('Contacting database...');

		const ckey = interaction.options.getString('ckey', true);

		const data = await queryDatabase('decertify_ckey', { ckey: ckey });

		if (data.statuscode !== 200) {
			return await interaction.editReply({ content: `Decertification unsuccessful: ${data.response}` });
		}

		await interaction.editReply({
			content: `Decertification successful: ${userMention(data.data.discord_id)} (${ckey}) de-certified.`
		});

		const user = interaction.client.users.cache.get(data.data.discord_id);
		if (!user) return;

		return await removeAllRoles(user);
	}
}
