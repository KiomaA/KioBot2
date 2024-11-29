import AutoReply from './components/autoreply.js';
import Component from './components/component.js';
import DetectLanguage from './components/detectLanguage.js';
import MessageFilter from './components/messageFilter.js';
import ReadMessage from './components/readMessage.js';
import twitchConfig from './config/twitchConfig.json' assert {type:'json'}
import youtubeConfig from './config/youtubeConfig.json' assert {type:'json'}
import botConfig from './config/botConfig.json' assert { type: 'json' }
import GoogleSheetHandler from './googleSheetHandler.js';
import SocketHandler from './socketHandler.js';
import YoutubeLiveChat from './components/youtubeLivechat.js';
import QueueMahjong from './components/queueMahjong.js';


export default class MessageHandler{
    googleSheetHandler = new GoogleSheetHandler();
    
    // components
    autoreply = new AutoReply(this.googleSheetHandler);
    messageFilter = new MessageFilter(this.googleSheetHandler);
    detectLanguage = new DetectLanguage();
    readMessage = new ReadMessage();
    queueMahjong = new QueueMahjong();
    
    
    
    socketHandler = new SocketHandler(this);

    constructor(chatClient, defaultChannel){
        this.chatClient = chatClient 
        this.defaultChannel = defaultChannel       
        this.youtubeLiveChat = new YoutubeLiveChat(this);
    }

    handleTwitchMessage(channel, user, text, msg){
        if (twitchConfig.ignoreChannels.includes(user)) return;
        const isAdmin = twitchConfig.admins.includes(user)
        this.handleMessage(channel,'twitch',user,msg.userInfo.displayName, text, isAdmin, {chatMessage:msg});
    }

    handleYoutubeMessage(channelId, username, message,channelItem){
        if (youtubeConfig.ignoreChannels.includes(user)) return;
        const isAdmin = youtubeConfig.admins.includes(channelId);
        this.handleMessage(this.defaultChannel,'youtube',channelId,username,message,isAdmin,{channelItem:channelItem});
    }

    async handleMessage(channel,platform,user,name,message,isAdmin,remark){
        // handle twitch redemption
        

        // filter message
        message = this.messageFilter.filterMessage(message);

        // detect language
        let lang = this.detectLanguage.detect(message);
        //console.log(language);
        
        // change nickname
        //let {language, name} = this.changeNickname.change(name,lang);
        let language = lang;
        
        // read message
        if (botConfig.enabledReadMessage){
            await this.readMessage.read(name,message,language)
        }        

        // auto reply
        this.autoreply.replyMessage(this.chatClient,channel,message,language,name,user,isAdmin);


        // other components
        for (const key in this) {
            if (Object.prototype.hasOwnProperty.call(this, key)) {
                const comp = this[key];
                if (comp instanceof Component){
                    comp.handleMessage(this.chatClient,{channel,platform,user,name,message,isAdmin,remark},this)
                    if (isAdmin){
                        comp.handleAdminMessage(this.chatClient,{channel,platform,user,name,message,isAdmin,remark},this)
                    }
                }
            }
        }
    }

}