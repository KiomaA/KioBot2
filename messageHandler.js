import AutoReply from './components/autoreply.js';
import Component from './components/component.js';
import DetectLanguage from './components/detectLanguage.js';
import MessageFilter from './components/messageFilter.js';
import ReadMessage from './components/readMessage.js';
import twitchConfig from './config/twitchConfig.json' with {type:'json'}
import youtubeConfig from './config/youtubeConfig.json' with {type:'json'}
//import botConfig from './config/botConfig.json' with { type: 'json' }
import languageConfig from './config/languageConfig.json' with {type:'json'}
import GoogleSheetHandler from './googleSheetHandler.js';
import SocketHandler from './socketHandler.js';
import YoutubeLiveChat from './components/youtubeLivechat.js';
import QueueMahjong from './components/queueMahjong.js';
import ChangeNickname from './components/changeNickname.js';
import TwitchRedemption from './components/twitchRedemtion.js';
import RestreamBotChat from './components/restreamBotChat.js';
import YoutubeiLiveChat from './components/youtubeiLivechat.js';


export default class MessageHandler{
    googleSheetHandler = new GoogleSheetHandler();
    
    // components
    autoreply = new AutoReply(this.googleSheetHandler);
    messageFilter = new MessageFilter(this.googleSheetHandler);
    detectLanguage = new DetectLanguage();
    readMessage = new ReadMessage(languageConfig.enabledReadMessage);
    changeNickname = new ChangeNickname(this.googleSheetHandler);
    twitchRedemption = new TwitchRedemption(this.googleSheetHandler);
    queueMahjong = new QueueMahjong();
    
    
    
    
    
    socketHandler = new SocketHandler(this);

    constructor(chatClient, defaultChannel){
        this.chatClient = chatClient 
        this.defaultChannel = defaultChannel       
        this.youtubeLiveChat = new YoutubeLiveChat(this);
        this.restreamBotChat = new RestreamBotChat(this);
        this.youtubeiLiveChat = new YoutubeiLiveChat(this);
    }

    handleTwitchMessage(channel, user, text, msg){
        const isAdmin = twitchConfig.admins.includes(user)
        if (twitchConfig.restreamBot.includes(user)){
            this.restreamBotChat.handleRestreamMessage(text,msg);
            return;
        }else 
        if (twitchConfig.ignoreChannels.includes(user)) return;
        this.handleMessage(channel,'twitch',user,msg.userInfo.displayName, text, isAdmin, {chatMessage:msg});
    }

    handleYoutubeMessage(channelId, username, message,channelItem){
        if (youtubeConfig.ignoreChannels.includes(channelId)) return;
        const isAdmin = youtubeConfig.admins.includes(channelId);
        this.handleMessage(this.defaultChannel,'youtube',channelId,username,message,isAdmin,{channelItem:channelItem});
    }

    async handleMessage(channel,platform,user,name,message,isAdmin,remark){
        // filter message
        message = this.messageFilter.filterMessage(message);

        // detect language
        let lang = this.detectLanguage.detect(message);
        //console.log(language);
        
        // change nickname
        let {nickname, language} = this.changeNickname.change(platform,user,name,lang);
        //let language = lang;

         // handle twitch redemption
        let msg = this.twitchRedemption.redeem(this.chatClient,channel,platform,nickname,lang,message,remark);
        
        // read message
        await this.readMessage.read(nickname,msg,language)
     

        // auto reply
        this.autoreply.replyMessage(this.chatClient,channel,msg,language,nickname,user,platform,isAdmin,remark);


        // other components
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const comp = this[key];
                if (comp instanceof Component){
                    comp.handleMessage(this.chatClient,{channel,platform,user,nickname,message,isAdmin,remark},this)
                    if (isAdmin){
                        comp.handleAdminMessage(this.chatClient,{channel,platform,user,nickname,message,isAdmin,remark},this)
                    }
                }
            }
        }
    }

}