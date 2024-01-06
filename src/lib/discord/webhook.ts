import { TextChannel } from "discord.js";

export const fetchOrCreateHook = async (channel: TextChannel) => {
    const hooks = await channel.fetchWebhooks()
    const firstHook = hooks.first()
    if(firstHook) return firstHook

    const newHook = await channel.createWebhook({name: "Webhook"})
    return newHook

}