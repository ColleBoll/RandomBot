const { SlashCommandBuilder, ActionRowBuilder, ModalBuilder } = require('@discordjs/builders');
const { ButtonStyle, ChannelType, ComponentType, TextInputStyle } = require('discord.js');
const Discord = require('discord.js');
const cheerio = require('cheerio');
const request = require('request');

module.exports = {

    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Random image from internet!')
        .addStringOption((option1) => option1.setName('word').setDescription('Add a word to search on! (not required)')),

    async execute(client, interaction) {

        var word = interaction.options.getString('word');

        image(interaction);

        function image(interaction){
        
            var options = {
                url: "https://results.dogpile.com/serp?qc=images&q=" + word,
                method: "GET"
            };
        
            request(options, function(error, response, responseBody) {
                if (error) {
                    return;
                }
          
         
                $ = cheerio.load(responseBody); 
         
         
                var links = $(".image a.link");
         
                var urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr("href"));
                
                console.log(urls);
         
                if (!urls.length) {
                   
                    return;
                }
         
                interaction.reply( urls[Math.floor(Math.random() * urls.length)]);
            });
        }

        
    }
}