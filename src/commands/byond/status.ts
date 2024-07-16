import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { queryDatabase } from '../../lib/byond/queryGame';
import { EmbedBuilder } from '@discordjs/builders';

const formatDuration = (ms: number) => {
	if (ms < 0) ms = -ms;
	const time = {
		day: Math.floor(ms / 86400000),
		hour: Math.floor(ms / 3600000) % 24,
		minute: Math.floor(ms / 60000) % 60,
		second: Math.floor(ms / 1000) % 60
	};
	return Object.entries(time)
		.filter((val) => val[1] !== 0)
		.map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
		.join(', ');
};

const formatGameState = (gameState: number) => {
	switch (gameState) {
		case 0:
			return 'Starting';
		case 1:
			return 'Lobby';
		case 2:
			return 'Setting Up';
		case 3:
			return 'Playing';
		case 4:
			return 'Finished';
	}
	return 'Unknown';
};

@ApplyOptions<Command.Options>({
	description: 'Checks the current server status.'
})
export class UserCommand extends Command {
	// Register slash and context menu command
	public override registerApplicationCommands(registry: Command.Registry) {
		registry.registerChatInputCommand((builder) => builder.setName(this.name).setDescription(this.description).setDefaultMemberPermissions(0));
	}

	// slash command
	public async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return

		await interaction.reply('Contacting database...');

		const data = await queryDatabase('status_authed');

		if (data.statuscode !== 200) {
			return await interaction.editReply({ content: `Lookup unsuccessful: ${data.response}` });
		}

		const embed = renderEmbed(data)

		return await interaction.editReply({ embeds: [embed], content: '' });
	}
}

export const renderEmbed = (data) => {
	return new EmbedBuilder().setAuthor({ name: `Round #${data.data.round_id}` }).addFields(
		{ name: 'Mode', value: `${data.data.mode}`, inline: true },
		{ name: 'Players', value: `${data.data.players}`, inline: true },
		{ name: 'Map', value: `${data.data.map_name}`, inline: true },
		{ name: 'Gamestate', value: `${formatGameState(data.data.gamestate)}`, inline: true },
		{ name: 'Round Duration', value: `${formatDuration(data.data.round_duration * 100)}`, inline: true },
		{ name: 'Revision', value: `${data.data.revision}`, inline: true },
		{ name: 'Revision Date', value: `${data.data.revision_date}`, inline: true },
		{ name: 'Admins', value: `${data.data.admins}`, inline: true },
		{ name: 'Time Dilation Current', value: `${data.data.time_dilation_current}`, inline: true },
		{
			name: 'Time Dilation AVG:AVG-S:AVG-F',
			value: `\`${data.data.time_dilation_avg}\`:\`${data.data.time_dilation_avg_slow}\`:\`${data.data.time_dilation_avg_fast}\``,
			inline: true
		},
		{ name: 'Map CPU', value: `${data.data.mcpu}`, inline: true },
		{ name: 'CPU', value: `${data.data.cpu}`, inline: true }
	);
}