import { Embed, Message, type Interaction } from 'discord.js';

export const messageOrInteractionReply = async (messageOrInteraction: Message | Interaction, message: string, embeds?: Array<Embed>) => {
	if (messageOrInteraction instanceof Message) {
		messageOrInteraction.edit({ content: message, embeds: embeds });
		return;
	}

	if (!messageOrInteraction.isRepliable()) return;
	messageOrInteraction.editReply({ content: message, embeds: embeds });
};
