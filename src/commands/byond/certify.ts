import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { logCertify } from '../../lib/discord/logCertify';
import { setupRoles } from '../../lib/byond/setupRoles';
import { Message, User, userMention } from 'discord.js';
import { messageOrInteractionReply } from '../../lib/discord/interactionHelpers';

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

	public async messageRun(message: Message, args: Args) {
		if (!process.env.CERT_CHANNEL || !process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		const reply = await message.reply('Processing certification...');
		await message.delete();
		let token;
		try {
			token = await args.pick('string');
		} catch {
			token = null;
		}

		return await this.runCertify(reply, message.author, token);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!process.env.CERT_CHANNEL || !process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		await interaction.deferReply({ ephemeral: true });

		const token = interaction.options.getString('token', false)?.trim();

		return await this.runCertify(interaction, interaction.user, token);
	}

	public async runCertify(intOrMsg: Command.ChatInputCommandInteraction | Message, user: User, token?: string | null) {
		if (!process.env.CERT_CHANNEL || !process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		if (!token) {
			const data = await queryDatabase('lookup_discord_id', { discord_id: user.id });

			if (data.statuscode === 200) {
				await setupRoles(user, data.data.roles);
				await logCertify(
					`Re-certification for ${userMention(user.id)} (${data.data.ckey}) complete. ${
						data.data.roles ? `Whitelists: ${data.data.roles}` : ''
					}`
				);
				return await messageOrInteractionReply(intOrMsg, `You are already certified, ${data.data.ckey}.`);
			}

			return await messageOrInteractionReply(intOrMsg, `Please supply a valid token - you are not already certified.`);
		}

		const data = await queryDatabase('certify', { identifier: token, discord_id: user.id });

		if (data.statuscode === 503) {
			await setupRoles(user, data.data.roles);
			await logCertify(
				`Re-certification for ${userMention(user.id)} (${data.data.ckey}) complete. ${
					data.data.related_ckeys ? `Associated CKEYs: ${data.data.related_ckeys}` : ''
				} ${data.data.roles ? `Whitelists: ${data.data.roles}` : ''}`
			);
			return await messageOrInteractionReply(intOrMsg, `You are already certified, ${data.data.ckey}.`);
		}

		if (data.statuscode !== 200) {
			return await messageOrInteractionReply(intOrMsg, `There was an issue with your certification. Please try again, or use a valid token.`);
		}

		await messageOrInteractionReply(intOrMsg, `Your certification was successful.`);

		await logCertify(
			`Certification for ${userMention(user.id)} (${data.data.ckey}) complete. ${
				data.data.related_ckeys ? `Associated CKEYs: ${data.data.related_ckeys}` : ''
			} ${data.data.roles ? `Whitelists: ${data.data.roles}` : ''}`
		);
		await setupRoles(user, data.data.roles);
		return await intOrMsg.guild?.members.cache.get(user.id)?.roles.add(process.env.VERIFIED_ROLE);
	}
}
