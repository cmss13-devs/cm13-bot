import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { TextChannel } from 'discord.js';

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
				.addStringOption((option) => option.setName('token').setDescription('The token retrieved from the game.').setRequired(true))
		);
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if (!process.env.CERT_CHANNEL || !process.env.GUILD || !process.env.VERIFIED_ROLE) return;

		await interaction.reply('Contacting database...');

		const token = interaction.options.getString('token', true);

		const data = await queryDatabase('certify', { identifier: token, discord_id: interaction.user.id });

		await interaction.editReply({
			content: data['response']
		});

		const guild = interaction.client.guilds.cache.get(process.env.GUILD);
		const channel = guild?.channels.cache.get(process.env.CERT_CHANNEL);

		if (!(channel instanceof TextChannel)) return;

		await channel.send(`Certification for <@${interaction.user.id}> complete. Associated CKEYs: ${data['data']['related_ckeys']}.`);
		return await interaction.guild?.members.cache.get(interaction.user.id)?.roles.add(process.env.VERIFIED_ROLE);
	}
}
