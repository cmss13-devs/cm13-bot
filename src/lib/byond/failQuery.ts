import { EmbedBuilder, type ChatInputCommandInteraction } from 'discord.js';

export const failQuery = async (interaction: ChatInputCommandInteraction, response: string) => {
	const failEmbed = new EmbedBuilder().setTitle(`Lookup unsuccessful`).setDescription(`${response}`).setColor('Red');
	return await interaction.editReply({ embeds: [failEmbed] });
};
