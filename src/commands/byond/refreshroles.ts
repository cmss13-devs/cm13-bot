import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { queryDatabase } from "../../lib/byond/queryGame";
import { failQuery } from "../../lib/byond/failQuery";
import { EmbedBuilder, userMention } from "discord.js";
import { setupRoles } from "../../lib/byond/setupRoles";
import { removeAllRoles } from "../../lib/discord/removeAllRoles";
import { removeRole } from "../../lib/discord/removeRole";
import { processWhitelist } from "../../lib/byond/processWhitelist";
import { addRoles } from "../../lib/discord/addRoles";

@ApplyOptions<Command.Options>({
	description: "Refresh a user's roles."
})
export class UserCommand extends Subcommand {
	public constructor(context: Subcommand.Context, options: Subcommand.Options) {
		super(context, {
			...options,
			name: 'refresh',
			subcommands: [
				{ name: 'ckey', chatInputRun: 'ckeyRefreshRun' },
				{ name: 'user', chatInputRun: 'userRefreshRun' }
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
				.addSubcommand((command) =>
					command
						.setName('ckey')
						.setDescription('Refresh user roles by by CKEY.')
						.addStringOption((option) => option.setName('ckey').setDescription('The CKEY to look up').setRequired(true))
				)
				.addSubcommand((command) =>
					command
						.setName('user')
						.setDescription('Refresh user roles by Discord User')
						.addUserOption((option) => option.setName('user').setDescription('The Discord User to look up.').setRequired(true))
				)
		);
	}

	// slash command
	public async userRefreshRun(interaction: Subcommand.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return

		await interaction.deferReply();

		const user = interaction.options.getUser('user', true);
		const data = await queryDatabase('lookup_discord_id', { discord_id: user.id });

		return await this.refreshDataResponse(interaction, data, user.id);
	}

	public async ckeyRefreshRun(interaction: Command.ChatInputCommandInteraction) {
		if(!interaction.guild || interaction.guild.id !== process.env.CM13_BOT_DISCORD_GUILD) return

		await interaction.deferReply();

		const ckey = interaction.options.getString('ckey', true);
		const data = await queryDatabase('lookup_ckey', { ckey: ckey });

		return await this.refreshDataResponse(interaction, data, data.data.discord_id);
	}

	public async refreshDataResponse(interaction: Subcommand.ChatInputCommandInteraction, data: any, discord_id: string | null) {
		if (data.statuscode !== 200 || !discord_id) return await failQuery(interaction, data.response);

        const user = this.container.client.users.cache.get(discord_id)
        if(!user) return await failQuery(interaction, "Could not find Discord user.")

        const toRemove = []
        if (process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE) toRemove.push(process.env.CM13_BOT_DISCORD_GUILD_SYNTHETIC_ROLE)
        if (process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE) toRemove.push(process.env.CM13_BOT_DISCORD_GUILD_COMMANDER_ROLE)
        if (process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE) toRemove.push(process.env.CM13_BOT_DISCORD_GUILD_YAUTJA_ROLE)
        await removeRole(user, toRemove, `Manually requested refresh by ${interaction.user.username}.`)

        const whitelists = processWhitelist(data.data.roles);
        await addRoles(user, whitelists, `Manually requested refresh by ${interaction.user.username}.`)

		return await interaction.editReply(`Manually refreshed roles for ${userMention(discord_id)}.`)
	}


}