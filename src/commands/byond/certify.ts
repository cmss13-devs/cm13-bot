import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { logCertify } from '../../lib/discord/logCertify';
import { setupRoles } from '../../lib/byond/setupRoles';
import { userMention } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Validate your CKEY.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption((option) => option.setName('token').setDescription('The token retrieved from the game.').setRequired(false))
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!process.env.CERT_CHANNEL || !process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		await interaction.reply({ content: 'Contacting database...', ephemeral: true });

		const token = interaction.options.getString('token', false)?.trim();

		if (!token) {
			const data = await queryDatabase('lookup_discord_id', { discord_id: interaction.user.id });

			if (data.statuscode === 200) {
				await setupRoles(interaction.user, data.data.roles);
				await logCertify(
					`Re-certification for ${userMention(interaction.user.id)} (${data.data.ckey}) complete. ${
						data.data.roles ? `Whitelists: ${data.data.roles}` : ''
					}`
				);
				return await interaction.editReply({ content: `You are already certified, ${data.data.ckey}.` });
			}

			return await interaction.editReply({ content: `Please supply a valid token - you are not already certified.` });
		}

		const data = await queryDatabase('certify', { identifier: token, discord_id: interaction.user.id });

		if (data.statuscode === 503) {
			await setupRoles(interaction.user, data.data.roles);
			await logCertify(
				`Re-certification for ${userMention(interaction.user.id)} (${data.data.ckey}) complete. ${
					data.data.related_ckeys ? `Associated CKEYs: ${data.data.related_ckeys}` : ''
				} ${data.data.roles ? `Whitelists: ${data.data.roles}` : ''}`
			);
			return await interaction.editReply({ content: `You are already certified, ${data.data.ckey}.` });
		}

		if (data.statuscode !== 200) {
			return await interaction.editReply({ content: `There was an issue with your certification. Please try again, or use a valid token.` });
		}

		await interaction.editReply({ content: `Your certification was successful.` });

		await logCertify(
			`Certification for ${userMention(interaction.user.id)} (${data.data.ckey}) complete. ${
				data.data.related_ckeys ? `Associated CKEYs: ${data.data.related_ckeys}` : ''
			} ${data.data.roles ? `Whitelists: ${data.data.roles}` : ''}`
		);
		await setupRoles(interaction.user, data.data.roles);
		return await interaction.guild?.members.cache.get(interaction.user.id)?.roles.add(process.env.VERIFIED_ROLE);
	}
}
