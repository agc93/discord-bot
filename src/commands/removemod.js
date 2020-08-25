const Discord = require('discord.js');
const { getUserByDiscordId, updateAllRoles, getModsbyUser, deleteMod } = require('../api/bot-db.js');
const modUrlRegex = /nexusmods.com\/([a-zA-Z0-9]+)\/mods\/([0-9]+)/i

module.exports.help = {
    name: "removemod",
    description: "Allows authors to remove mods on their profile cards in Discord.",
    usage: "[full mod title or url]",
    moderatorOnly: false,
    adminOnly: false,
    officialOnly: false 
}

exports.run = async (client, message, args, serverData) => {
    //Get reply channel from server settings.
    const replyChannel = serverData && serverData.channel_bot ? message.guild.channels.find(c => c.id === serverData.channel_bot) : message.channel;
    const discordId = message.author.id;

    let userData = await getUserByDiscordId(discordId);
    if (!userData) return replyChannel.send(`${replyChannel === message.channel ? message.author.tag : message.author} please link your Nexus Mods account to use this feature. See \`!nexus link\` for more information.`).catch(console.error);

    if (args.length === 0) return replyChannel.send(`${replyChannel === message.channel ? message.author.tag : message.author}, to remove a mod from your Discord account type \`!nexus removemod <mod title>\`.`).catch(console.error);

    const mods = await getModsbyUser(userData.id);
    if (!mods || !mods.length) return replyChannel.send(`${replyChannel === message.channel ? message.author.tag : message.author}, you don't have any mods linked to your at the moment.`).catch(console.error);

    let responseMessage = await replyChannel.send(`${replyChannel === message.channel ? "" : message.author +". "}Checking your mods...`).catch(console.error);

    try {
        if (args.join(" ").match(modUrlRegex)) {
            // Remove by URL possible for multiple matches.
            const matches = args.join(" ").split(",").map(
                (match) => {
                    const result = match.match(modUrlRegex);
                    if (match) return {domain: result[1], id: result[2], url: `https://www.nexusmods.com/${result[1]}/mods/${result[2]}`};
                }
            );
            let removedMods = [];
            for (const match of matches) {
                // console.log("match",match);
                const modToRemove = mods.find((mod) => mod.mod_id === parseInt(match.id) && mod.domain === match.domain);
                if (modToRemove) {
                    removedMods.push(modToRemove);
                    await deleteMod(modToRemove);
                }
            }
            console.log(`${new Date().toLocaleString()} - Removed mods ${removedMods.map(mod => mod.name || `Mod #${mod.mod_id} for ${mod.game}`).join(', ')} from ${userData.name} in ${message.guild || 'a DM'}.`);
            if (removedMods.length) return responseMessage.edit(`Removed the following mod(s) from ${message.author} (${userData.name}):\n${removedMods.map(mod => mod.name ? `- ${mod.name} ` : `- Mod #${mod.id} for ${mod.game}`).join("\n")}`);
            else return responseMessage.edit("Could not find any mods to remove for your search criteria.");
        }
        else if (mods.find((mod) => mod.name.toLowerCase() === args.join(" ").toLowerCase())) {
            // Remove by name
            const modToRemove = mods.find((mod) => mod.name.toLowerCase() === args.join(" ").toLowerCase());
            // Remove the mod
            await deleteMod(modToRemove);
            console.log(`${new Date().toLocaleString()} - Removed ${modToRemove.name} from ${userData.name} in ${message.guild || 'a DM'}.`);
            await updateAllRoles(userData, message.author, client);
            return responseMessage.edit(`Removed ${modToRemove.name} from ${message.author} (${userData.name}).`);
        }
        else {
            // None found.
            return responseMessage.edit(`${replyChannel === message.channel ? message.author.tag : message.author}, could not find any mods to remove for "${args.join(" ")}". Please ensure you use the exact URL or title of the mod.`).catch(console.error);
        }
    }
    catch(err) {
        console.log(err);
        return responseMessage.edit(`${replyChannel === message.channel ? message.author.tag : message.author}, an error occured with your request.\n\`\`\`${err}\`\`\``).catch(console.error);
    }
}