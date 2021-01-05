const Discord = require("discord.js");
const fetch = require("node-fetch");
const client = new Discord.Client();
const fs = require("fs");
var history = {};
const languages = fs.readFileSync("./language_codes.txt", "utf-8").split("\n");

const help = "```Wikibot ver 1.0.2\nTo change the command character, message the bot '@Wikibot config new_char'.\n\
By default it is set to '!'\n\nCommands:\n\
  !wiki query        searches Wikipedia for the article that is the closest match for 'query' (defaults to English)\n\
  !wiki-lang query   searches Wikipedia for the article in the specified language for the closest match to 'query'\n\
  !wikiNext          selects the next closest match for the last searched 'query'\n\
  !random            selects a random English Wikipedia article\n\
  !random lang       selects a random Wikipedia in the specified language```";

var command = "!";

function searchWiki(msg, query, number, lang) {
  console.log("Wiki request: " + query);
  console.log(lang);

  var url = "https://" + lang + ".wikipedia.org/w/api.php?origin=*";
  var params = {
      action: "opensearch",
      search: query,
      limit: String(number),
      namespace: "0",
      format: "json"
  };

  Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});
  fetch(url)
      .then(function(response){return response.json();})
      .then(function(response){console.log(response);
        if(response[1].length === number) {
          msg.reply("Top result: " + response[1][number-1] + "\n" + response[3][number-1] +
          "\nNot what you're looking for? Try the the next result with command '" + command + "wikiNext'");
        } else {
          if (number == 1) {
            msg.reply("No results found for '" + query + "'. Try refining your search terms.");
          } else {
              msg.reply("No other results found for '" + query + "'. Try refining your search terms.");
          }
        }})
      .catch(function(error){console.log(error);});
}

function randomArticle(msg, lang) {
  var url = "https://" + lang + ".wikipedia.org/wiki/Special:Random";
  fetch(url)
    .then(function(response){msg.reply("Here's your random article: " + response.url + "\nEnjoy!");})
    .catch(function(error){console.log(error);});
}

client.on("ready", () => {
  console.log("Ready");
});

client.on("message", msg => {
  if (msg.mentions.has(client.user) && msg.content.toLowerCase().includes("config")) {
    command = msg.content.split("config")[1][1];

  } else if (msg.content === command + "help") {
    msg.reply(help);

  } else if (msg.content === command + "wikiNext") {
    var number = history[msg.author["id"]][1] + 1;
    history[msg.author["id"]][1] = number;
    searchWiki(msg, history[msg.author["id"]][0], number, history[msg.author["id"]][2]);
    var query;

  } else if (msg.content.startsWith(command + "wiki")) {
    if (msg.content[5] == "-") {
      var lang = msg.content.split(" ")[0].split("-")[1];
      if (!languages.includes(lang)) {
        msg.reply("Not a valid wikipedia language.\n\
See 'https://en.wikipedia.org/wiki/List_of_Wikipedias' for a complete list of supported languages.");

        history[msg.author["id"]] = [];
        return;
      }

      query = msg.content.slice(6 + lang.length);
      history[msg.author["id"]] = [query, 1, lang];

    } else if (msg.content[5] == " ") {
      query = msg.content.slice(6);
      history[msg.author["id"]] = [query, 1, "en"];
      lang = "en";
    }
    searchWiki(msg, query, 1, lang);

  } else if (msg.content.startsWith(command + "random")) {
    if (msg.content === command + "random") {
      lang = "en";
    } else {
      lang = msg.content.slice(8);
    }

    if (!languages.includes(lang)) {
      msg.reply("Not a valid wikipedia language.\n\
See 'https://meta.wikimedia.org/wiki/Template:List_of_language_names_ordered_by_code' for a complete list of languages.");
    } else {
      randomArticle(msg, lang);
    }
  }
});

client.login(process.env.BOT_TOKEN);
