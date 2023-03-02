const { Client, GatewayIntentBits, PresenceUpdateStatus, ActivityType, InteractionType, Partials } = require('discord.js');
const Discord = require('discord.js');
const client = new Client({
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildBans,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        ],
    partials: [Partials.Channel],
});
const botConfig = require("./botConfig.json");
const fs = require("fs");

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

client.commands = new Discord.Collection()
client.slashCommands = new Discord.Collection();
const slashCommands = [];

fs.readdir("./commands/", (err, files) => {

    if (err) console.log(err);

    var jsFiles = files.filter(f => f.split(".").pop() === "js");

    if (jsFiles.length <= 0) {
        console.log("Er zijn geen files gevonden!");
        return;
    }

    jsFiles.forEach((f, i) => {

        var fileGet = require(`./commands/${f}`);
        console.log(`De volgende file is geladen ${f}`);

        client.commands.set(fileGet.help.name, fileGet);

    })

});

fs.readdir("./slashCommands/", (err, files) => {

    if (err) console.log(err);

    var jsFilesCommand = files.filter(f => f.split(".").pop() === "js");

    if (jsFilesCommand.length <= 0) {
        console.log("Er zijn geen files gevonden!");
        return;
    }

    jsFilesCommand.forEach((f, i) => {

        var fileGet = require(`./slashCommands/${f}`);
        console.log(`De volgende file is geladen ${f}`);

        client.slashCommands.set(fileGet.data.name, fileGet);
        slashCommands.push(fileGet.data.toJSON());

    })

});

const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const stuff = ['embeds']; // Dit zijn de map namen!
stuff.forEach(c => {
    readdir(`./commands/${c}/`, (err, files) => {
        if (err) throw err;
        console.log(`Laad ${files.length} files in (${c})`);
        files.forEach(f => {
            if (!f.endsWith(".js")) return;
            let props = require(`./commands/${c}/${f}`);
            client.commands.set(props.help.name, props);
        });
    });
});

client.on("ready", async () => {

    console.log(`${client.user.username} is online`);

    function randomStatus() {

        client.user.setPresence({ type: PresenceUpdateStatus.Online });

        client.user.setActivity("search random image", {type: ActivityType.Playing});
    }; setInterval(randomStatus, 10000)

});

client.once("ready", () => {

    let guildId = "645666968447352832";
    let clientId = "1080977691538378772";

    const rest = new REST({ version: '9' }).setToken(botConfig.token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');
      
            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: slashCommands },
            );
      
            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

});

client.on("messageCreate", async message => {

    if (message.author.bot) return;

    if (message.channel.type == "dm") return;

    if (!message.content.startsWith(botConfig.prefix)) return;
    
    var prefix = botConfig.prefix;

    var messageArray = message.content.split(" ");

    var command = messageArray[0];

    var arguments = messageArray.slice(1);

    var commands = client.commands.get(command.slice(prefix.length));

    if (commands) commands.run(client, message, arguments);

});

client.on("interactionCreate", async interaction => {

    if (interaction.type === InteractionType.MessageComponent) {
    } else if (interaction.type === InteractionType.ApplicationCommand) {

        const slashCommand = client.slashCommands.get(interaction.commandName);
        if(!slashCommand) return;

        try {

            await slashCommand.execute(client, interaction);

        } catch (err) {
            console.log(err)
            await interaction.reply({ content: "Message error! Probeer het later nog eens!", ephemeral: true });
        }

    } else {
        return
    }
});

client.login(botConfig.token);

//npm i discord.js
//npm i nodemon --save-dev
//npm i fs
//npm i util
//npm i @discordjs/rest discord-api-types (https://discordjs.guide/interactions/slash-commands.html#guild-commands)