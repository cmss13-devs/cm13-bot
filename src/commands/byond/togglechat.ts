import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { lockLrc, unlockLrc } from '../../lib/redis/ingestRoundUpdate';
import { EmbedBuilder } from 'discord.js';

@ApplyOptions<Command.Options>({
	description: 'Toggle LRC.'
})
export class UserCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			name: 'lock',
			subcommands: [
				{ name: 'open', chatInputRun: 'openTalkChannel' },
				{ name: 'close', chatInputRun: 'closeTalkChannel' }
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
				.addSubcommand((command) => command.setName('open').setDescription('Open LRC.'))
				.addSubcommand((command) => command.setName('close').setDescription('Close LRC.'))
		);
	}

	// slash command
	public async openTalkChannel(interaction: Subcommand.ChatInputCommandInteraction) {
		if (!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return;

		await interaction.deferReply();

		await unlockLrc();

		const embed = new EmbedBuilder().setColor('Green').setTitle('LRC Closed');
		interaction.editReply({ embeds: [embed] });
	}

	public async closeTalkChannel(interaction: Command.ChatInputCommandInteraction) {
		if (!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return;

		await interaction.deferReply();

		await lockLrc();

		const embed = new EmbedBuilder().setColor('Red').setTitle('LRC Closed');
		interaction.editReply({ embeds: [embed] });
	}
}
