//Invite link https://discordapp.com/oauth2/authorize?client_id=278362996349075456&scope=bot&permissions=37223488

var version = "Beta 2.5";
var website = "http://comixsyt.space";

var fs = require("fs");

const Discord = require("discord.js");
const client = new Discord.Client();

const Carina = require('carina').Carina;
const ws = require('ws');

Carina.WebSocket = ws;
const ca = new Carina({ isBot: true }).open();

var hookIDRaw = fs.readFileSync("./hook.txt", "utf-8");
var hookID = hookIDRaw.split(", ");

client.on("ready", () => {
  console.log(`Logged in as ${client.user.username}!`);
  console.log("Version " + version);
  serverCount = client.guilds.size;
  userCount = client.users.size
  client.user.setGame(version);
  console.log("Bot is on " + serverCount + " servers!");
  console.log("Those " + serverCount + " servers have a total of " + userCount + " members!");
});

var streamersRaw = fs.readFileSync("./streamers.txt", "utf-8");
var streamers = streamersRaw.split(", ");
var streamerCount = streamers.length;

for (i=0; i<streamerCount; i++){  //Run for the # of streamers
  var halfHour = 1800000; //time in milis that is 30min
  var bootTime = (new Date).getTime(); //get the time the bot booted up
  var halfHourAgo = bootTime - 1800000; //get the time 30min before the boot
  fs.writeFile("./user_time/" + streamers[i] + "_time.txt", halfHourAgo); //write a file with
  var request = require("request"); //the var to request details on the streamer
  request("https://beam.pro/api/v1/channels/" + streamers[i], function (error, response, body) { //ste info for the streamer in JSON
    if (!error && response.statusCode == 200) { //if there is no error checking
       var beamInfo = JSON.parse(body); //setting a var for the JSON info
       const beamID = beamInfo.id; //getting the ID of the streamer
       console.log("Now stalking " + beamInfo.token + " on beam!"); //logs that the bot is watching for the streamer to go live
       ca.subscribe(`channel:${beamID}:update`, data => { //subscribing to the streamer
         var beamStatus = data.online //checks if they are online (its a double check just incase the above line miss fires)
         if (beamStatus == true){ //if the bam info JSON says they are live
           var liveTime = (new Date).getTime(); //time the bot sees they went live
           var lastLiveTime = fs.readFileSync("./user_time/" + beamInfo.token + "_time.txt", "utf-8"); //checks the last live time
           var timeDiff = liveTime - lastLiveTime; //gets the diff of urrent and last live times
          //console.log(timeDiff);
           if (timeDiff >= halfHour){ //if its been 30min or more
             console.log(beamInfo.token + " went live, as its been more tha 30min!"); //log that they went live
             const hook = new Discord.WebhookClient(hookID[0], hookID[1]); //sets info about a webhook
             hook.sendMessage("live " + beamInfo.token); //tells the webhook to send a message to a private channel that M8Bot is listening to
           }
           if (timeDiff < halfHour){ //if its been less than 30min
             console.log(beamInfo.token + " attempted to go live, but its been under 30min!"); //log that its been under 30min
           }
           fs.writeFile("./user_time/" + beamInfo.token + "_time.txt", liveTime); //update last live time regardless if they went live or not
         }
       })
     }
   });
 }

client.on("message", msg => {
  if (msg.content === "ping") {
    msg.delete(1000);
    msg.reply("Pong!").then(msg => msg.delete(1500));
  }
  if (msg.content === "pong") {
    msg.delete(1000);
    msg.reply("Ping!").then(msg => msg.delete(1500));
  }
  if (msg.content == "!rawr"){
    msg.delete(1000);
    msg.channel.sendMessage("http://i.imgur.com/CVHyMXt.png");
  }
  if (msg.content == "!add-streamer"){
    msg.delete(1000);
    msg.reply("You need to specify a streamer's beam ID. For example '!add-streamer STREAMER_ID'.");
  }
  if (msg.content.startsWith("!add-streamer")){ //if an owner adds a streamer
    msg.delete(1000); //delete the message they sent
    let args = msg.content.split(" ").slice(1); //divide the message into args
    let streamer = args[0]; //arg 0 is the streamer's name
    var chatID = msg.channel.id; //gets the chat ID that they added the streamer to
      var owner = msg.guild.ownerID; //gets the server owner's id
      if (owner == msg.author.id || msg.author.id == "145367010489008128"){ //if the person who added the streamer is the owner or ComixsYT
        if (fs.existsSync("./users/" + streamer + ".txt")){ //if they are already in our database
          var currentServers = fs.readFileSync("./users/" + streamer + ".txt", "utf-8"); //get the current allowed servers from their file
          var registered = currentServers.includes(chatID); //checks if the server they are being added to already has them
          if (registered === true){ //if they are already registered on the server
            msg.reply("the streamer " + streamer + " is already registered!"); //tell the server owner they are alreayd on
          }
          if (registered === false && !currentServers.includes(chatID)){ //if they arent on the server alreayd
            fs.writeFile("./users/" + streamer + ".txt", currentServers + ", " + chatID); //adds the new server ID to their list
            msg.reply("you have added the streamer " + streamer + " to your server!"); //tells the server owner that the streamer was added
          }
        }
        if (!fs.existsSync("./users/" + streamer + ".txt")){ //if they are not in our database yet
          fs.writeFile("./users/" + streamer + ".txt", chatID); //makes a new file with the chat ID
          var currentStreamers = fs.readFileSync("./streamers.txt", "utf-8"); //gets the current total streamer list
          fs.writeFile("./streamers.txt", currentStreamers + ", " + streamer); //updates the total list with the new streamer added
          var halfHour = 1800000; //time in milis that is 30min
          var addedTime = (new Date).getTime(); //get the time the bot added the streamer
          var halfHourAgo = addedTime - 1800000; //get the time 30min before they were added
          fs.writeFile("./user_time/" + streamer + "_time.txt", halfHourAgo); //write a file with
          var request = require("request"); //the var to request details on the streamer
          request("https://beam.pro/api/v1/channels/" + streamer, function (error, response, body) { //ste info for the streamer in JSON
            if (!error && response.statusCode == 200) { //if there is no error checking
               var beamInfo = JSON.parse(body); //setting a var for the JSON info
               const beamID = beamInfo.id; //getting the ID of the streamer
               console.log("Now stalking " + beamInfo.token + " on beam!"); //logs that the bot is watching for the streamer to go live
               ca.subscribe(`channel:${beamID}:update`, data => { //subscribing to the streamer
                 var beamStatus = data.online //checks if they are online (its a double check just incase the above line miss fires)
                 if (beamStatus == true){ //if the bam info JSON says they are live
                   var liveTime = (new Date).getTime(); //time the bot sees they went live
                   var lastLiveTime = fs.readFileSync("./user_time/" + beamInfo.token + "_time.txt", "utf-8"); //checks the last live time
                   var timeDiff = liveTime - lastLiveTime; //gets the diff of urrent and last live times
                  //console.log(timeDiff);
                   if (timeDiff >= halfHour){ //if its been 30min or more
                     console.log(beamInfo.token + " went live, as its been more tha 30min!"); //log that they went live
                     const hook = new Discord.WebhookClient(hookID[0], hookID[1]); //sets info about a webhook
                     hook.sendMessage("live " + beamInfo.token); //tells the webhook to send a message to a private channel that M8Bot is listening to
                   }
                   if (timeDiff < halfHour){ //if its been less than 30min
                     console.log(beamInfo.token + " attempted to go live, but its been under 30min!"); //log that its been under 30min
                   }
                   fs.writeFile("./user_time/" + beamInfo.token + "_time.txt", liveTime); //update last live time regardless if they went live or not
                 }
               })
             }
           });
        }

      }
      else{ //if the person who added the streamer is not the server owner
        msg.reply("You do not own this server; please do not try to add a streamer!"); //tell them they cant add a streamer
      }
  }
  if (msg.content == "!m8status"){
    msg.delete(1000);
          const statusEmbed = new Discord.RichEmbed()
            .setTitle("M8 Bot Status")
            .setAuthor("M8 Bot")
            .setColor(0x9900FF)
            .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
            .setThumbnail("https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
            .setTimestamp()
            .addField("Version", version, true)
            .addField("Website", "http://comixsyt.space", true)
            .addField("Servers", serverCount, true)
            .addField("Users", userCount, true)
            .addField("Times Comixs Was Blamed", fs.readFileSync("./blameComixs.txt", "utf-8"));
            msg.channel.sendEmbed(statusEmbed);
  }
  if (msg.content == "!help m8bot"){
    msg.delete(1000);
    const helpEmbed = new Discord.RichEmbed()
      .setTitle("M8 Bot Help")
      .setColor(0x9900FF)
      .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setThumbnail("https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setTimestamp()
      .addField("!help m8bot", "Sends this Help Message")
      .addField("ping/pong", "Send ping or pong to test if the bot is listening")
      //.addField("!live", "Sends out a fancy live message if you are a registered streamer")
      .addField("!m8status", "Sends a status report of the bot")
      .addField("!me", "Sends user info about themself")
      .addField("!pun or !dadjoke", "Sends a funny pun courtesy of murfGUY's dadjoke database")
      .addField("!bill, !billme & !bill NAME", "Creates a be like bill meme. If you do !billme, your name will be in there. If you do !bill NAME, the name you put will be in there.")
      .addField("!avatar", "Generate a new profile avatar via the adorable.io api!")
      .addField("!cn or !chuck or !chucknorris", "Pulls a random Chun Norris fact!")
      .addField("!blamecomixs", "Used whenever ComixsYT does something supid and must be blamed!")
      .addField("!lenny", "( ͡° ͜ʖ ͡°)", true)
      .addField("!ascii", "Get your words in ASCII form!", true)
      .addField("!urban or !define", "Get the urban definition of a word!")
      .addField("!lmgtfy or !google", "Gets a Let Me Google That For You link for any term you want!")
      .addField("!mfinger", "Allows you to give the finger that is located in the middle of our appendages to others!")
      msg.channel.sendEmbed(helpEmbed);
  }
  if ((msg.content.startsWith("live") && msg.author.id == hookID[0]) || //if the bot sends the message
     (msg.author.id == "145367010489008128" && msg.channel.id == "278697660133801984")){ //if comixs sends the message (and in certian chat)
    let args = msg.content.split(" ").slice(1); //seperare command into args
    let beam = args[0]; //beam name is arg 0
    if (fs.existsSync("./users/" + beam + ".txt")){ //varifies that the streamer is on record
      var request = require("request"); //sets a var to request info
      request("https://beam.pro/api/v1/channels/" + beam, function (error, response, body) { //request streamer's in in JSON form
        if (!error && response.statusCode == 200) { //if there is no error
           var beamInfo = JSON.parse(body); //sets beamInfo to the JSON data
            if (beamInfo.type == null){ //if there is no game set to the stream
              var game = "[API ERROR]"; //set the game to the meme game
            }
            else{ //if there is a game set
              var game = beamInfo.type.name; //set the game var to the streamer's game
            }
             const liveEmbed = new Discord.RichEmbed() //start the embed message template
               .setTitle(beamInfo.token + "\'s Stream")
               .setAuthor(beamInfo.name)
               .setColor(0x9900FF)
               .setDescription("Hey guys, " + beam + " is live right now! Click above to watch!")
               .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
               .setThumbnail(beamInfo.user.avatarUrl)
               .setTimestamp()
               .setURL("http://beam.pro/" + beam)
               .addField("Streaming", game, true)
               .addField("Followers", beamInfo.numFollowers, true)
               .addField("Beam Level", beamInfo.user.level, true)
               .addField("Total Views", beamInfo.viewersTotal, true) //end the embed message template
             var serversAllowedRaw = fs.readFileSync("./users/" + beam + ".txt", "utf-8"); //get the list of servers they are allowed to ne announced on
             var serversAllowed = serversAllowedRaw.split(", "); //splits the servers into individual strings
             for (i=0; i < serversAllowed.length; i++){ //run for the total number of servers they are allowed on
               client.channels.get(serversAllowed[i]).sendEmbed(liveEmbed, "@here, " + beam + " is live!"); //send the live message to servers
             }
           }
       });
      }
    }
  if (msg.content == "!server"){
    msg.delete(1000);
    if (msg.guild.available){
      if (msg.guild.iconURL = null){
        var iconURL = "https://newagesoldier.com/wp-content/uploads/2016/12/masbot.png";
      }
      else{
        var iconURL = msg.guild.iconURL;
      }
    const serverEmbed = new Discord.RichEmbed()
        .setTitle(msg.guild.name)
        .setColor(0x9900FF)
        .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
        .setThumbnail(iconURL)
        .setTimestamp()
        .addField("Server ID", msg.guild.id, true)
        .addField("Region", msg.guild.region, true)
        .addField("Owner", msg.guild.owner, true)
        .addField("Members", msg.guild.memberCount, true)
        .addField("Roles", msg.guild.roles.size, true)
        .addField("Channels", msg.guild.channels.size, true)
        .addField("Created At", msg.guild.createdAt)
        .addField("Joined Server At", msg.guild.joinedAt)
        msg.channel.sendEmbed(serverEmbed);
        //msg.channel.sendMessage();
    }
  }
  if (msg.content == "!me"){
    msg.delete(1000);
    const meEmbed = new Discord.RichEmbed()
      .setTitle(msg.author.username)
      .setColor(0x9900FF)
      .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setThumbnail(msg.author.displayAvatarURL)
      .setTimestamp()
      .addField("ID", msg.author.id, true)
      .addField("Bot", msg.author.bot, true)
      .addField("Registered", msg.author.createdAt)
      msg.channel.sendEmbed(meEmbed);
  }
  if (msg.content == "!pun" || msg.content == "!dadjoke"){
    msg.delete(1000);
    var request = require("request");
    request("http://www.murfguy.com/puns.php", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var pun = body;
        msg.channel.sendMessage(pun);
      }
    });
  }
  if (msg.content == "!bill"){
      msg.delete(1000);
      const billEmbed = new Discord.RichEmbed()
      .setAuthor("Bill")
      .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setTimestamp()
      .setImage("http://belikebill.azurewebsites.net/billgen-API.php?default=1")
      msg.channel.sendEmbed(billEmbed);
  }
  if (msg.content == "!billme"){
    msg.delete(1000);
    const billMeEmbed = new Discord.RichEmbed()
    .setAuthor(msg.author.username)
    .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
    .setTimestamp()
    .setImage("http://belikebill.azurewebsites.net/billgen-API.php?default=1&name=" + msg.author.username + "&")
    msg.channel.sendEmbed(billMeEmbed);
  }
  if (msg.content.startsWith("!bill ") && msg.content != "!billme" && msg.content != "bill"){
    msg.delete(1000);
    var name = msg.content.replace("!bill ", "")
    var stringName = name.replace(" ", "%20")
    const billCustomEmbed = new Discord.RichEmbed()
    .setAuthor(stringName)
    .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
    .setTimestamp()
    .setColor(0x9900FF)
    .setImage("http://belikebill.azurewebsites.net/billgen-API.php?default=1&name=" + stringName + "&")
    msg.channel.sendEmbed(billCustomEmbed);
  }
  if (msg.content == "!avatar" || msg.content == "!icon"){
    msg.delete(1000);
    var rn = require('random-number');
    var random = rn(0,9999999999999999);
    const avatarEmbed = new Discord.RichEmbed()
      .setTitle(msg.author.username + "'s new avatar!")
      .setImage("https://api.adorable.io/avatars/" + random)
      .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setTimestamp()
      msg.channel.sendEmbed(avatarEmbed);
  }
  if (msg.content == "!cn" || msg.content == "!chuck" || msg.content == "!chucknorris"){
    msg.delete(1000);
    var request = require("request");
    request("https://api.chucknorris.io/jokes/random", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        msg.channel.sendMessage("**Chuck Norris Fact:** " + info.value);
      }
    });
  }
  if (msg.content == "!blamecomixs"){
    var comixsBlame = fs.readFileSync("./blameComixs.txt", "utf-8");
    var newBlameComixs = parseInt(comixsBlame) + 1;
    fs.writeFile("./blameComixs.txt", newBlameComixs);
    msg.channel.sendMessage("Wow, Comixs has been blamed **" + newBlameComixs + "** times! Thanks " + msg.author + "!");
    //console.log(newBlameComixs);
  }
  // if (msg.content == "!wow"){
  //   msg.channel.sendMessage("Wow").then(msg => msg.edit("No!"));
  // }
  if (msg.content == "!bday" && msg.author.id == "145367010489008128"){
    msg.delete(1000);
    const bDayEmbed = new Discord.RichEmbed()
      .setTitle("ComixsYT\'s Birthday!")
      .setFooter("Sent via M8 Bot", "https://cdn.discordapp.com/app-icons/278362996349075456/ce8868a4a1ccbe2f3f746d864f61a206.jpg")
      .setTimestamp()
      .setColor(0x9900FF)
      .setThumbnail("http://i.imgur.com/WkMgJ1Q.png")
      .addField("What is this?", "I don\'t know about you, but I care about my master, ComixsYT. \nSo in this automated message, I would like to wish my master a \nsuper fantabulous birthday!");
      msg.channel.sendEmbed(bDayEmbed, "Hey @here");
  }
  if (msg.content == "!lenny"){
    msg.delete(1000);
    msg.channel.sendMessage("( ͡° ͜ʖ ͡°)");
  }
  if (msg.content.startsWith("!ascii")){
    var input = msg.content.replace("!ascii ", "");
    var request = require("request");
    request("https://artii.herokuapp.com/make?text=" + input, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var ascii = body;
        msg.channel.sendMessage("```\n " + msg.author.username + " as requested \"" + input + "\" in ASCII from! \n" + ascii + "```");
      }
    });
  }
  //Feature Requested by IronTaters
  if (msg.content.startsWith("!define") || msg.content.startsWith("!urban")){
    if (msg.content.startsWith("!define")){
      var term = msg.content.replace("!define ", "");
    }
    if (msg.content.startsWith("!urban")){
      var term = msg.content.replace("!urban ", "");
    }
    var request = require("request");
    request("http://api.scorpstuff.com/urbandictionary.php?term=" + term, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var def = body;
        msg.channel.sendMessage(def);
      }
    });
  }
  if (msg.content.startsWith("!lmgtfy") || msg.content.startsWith("!google")){
    if (msg.content.startsWith("!lmgtfy")){
      var term = msg.content.replace("!lmgtfy ", "");
    }
    if (msg.content.startsWith("!google")){
      var term = msg.content.replace("!google ", "");
    }
    msg.channel.sendMessage("Here's your google link " + msg.author.username + " - http://lmgtfy.com/?q=" + term);
  }
  //requested by Pot4tus
  if (msg.content == "!mfinger"){
    var mFingerASCII = fs.readFileSync("./ascii/mFinger.txt", "utf-8");
    msg.channel.sendMessage("```\n Sent by " + msg.author.username + ".\n" + mFingerASCII + "\n```");
  }
});

client.on("guildMemberAdd", member => {
  let guild = member.guild;
  var guildID = member.guild.id;
  var guildGeneral = member.guild.defaultChannel.id;
  //console.log(guildGeneral);
  //console.log(guildID);
  if (guildID == "250354580926365697"){ //Meme M8s Guild ID
    member.addRole(guild.roles.find('name', 'Lil Meme'));
    //client.channels.get(guildGeneral).sendMessage("Hey " + member.displayName + ", welcome to the **Chill Spot**! You are now a Lil Meme. Please read #welcome and enjoy your stay!");
  }
  if (guildID == "169960109072449536"){ //Innovative Studios Guild ID
    member.addRole(guild.roles.find('name', 'Citizens of Townsville'));
  }
});

var token = fs.readFileSync("./token.txt", "utf-8");

client.login(token);
