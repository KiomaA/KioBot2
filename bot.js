import config from './config.js';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import twitchCredentials from './credentials/twitchCredentials.json' with { type: 'json' }
import MessageHandler from './messageHandler.js';
import { promises as fs } from 'fs';
import { Bot } from '@twurple/easy-bot';

const {twitch: twitchConfig} = config


const clientId = twitchCredentials.id;
const clientSecret = twitchCredentials.secret;


// twitch chat auth
const tokenData = JSON.parse(await fs.readFile(`./tokens/tokens.${twitchCredentials.bot}.json`, 'utf-8'));
const authProvider = new RefreshingAuthProvider(
	{
		clientId,
		clientSecret
	}
);
authProvider.addUser(twitchCredentials.bot,tokenData,["chat"]);
authProvider.onRefresh(async (userId, newTokenData) => await fs.writeFile(`./tokens/tokens.${userId}.json`, JSON.stringify(newTokenData, null, 4), 'utf-8'));


// create twitch chat client
const chatClient = new ChatClient({ authProvider, channels: twitchConfig.channels });
chatClient.connect();

// handle chat messages
const mainChannel = twitchConfig.channels[0]
const messageHandler = new MessageHandler(chatClient,mainChannel)

chatClient.onMessage(async (channel, user, text, msg) => {
    messageHandler.handleTwitchMessage(channel,user,text,msg);
});

// twitch bot
const bot = new Bot({
	authProvider,
	channels: twitchConfig.channels
});

bot.onSub(({ broadcasterName, userDisplayName }) => {
	bot.say(broadcasterName, `Thanks to @${userDisplayName} for subscribing to the channel!`);
});
bot.onResub(({ broadcasterName, userDisplayName, months }) => {
	bot.say(broadcasterName, `Thanks to @${userDisplayName} for subscribing to the channel for a total of ${months} months!`);
});

bot.onCommunitySub(({broadcasterName, gifterDisplayName, count}) => {
    bot.say(broadcasterName, `Thanks @${gifterDisplayName} for gifting ${count} subscriptions!`);
});

bot.onSubGift(({ broadcasterName, gifterName, userDisplayName }) => {
	bot.say(broadcasterName, `Thanks to @${gifterName} for gifting a subscription to @${userDisplayName}!`);
});
bot.onRaid(({broadcasterName, userDisplayName, viewerCount})=>{
    bot.say(broadcasterName, `Thanks ${userDisplayName}'s raid with ${viewerCount} viewers!`)
})

