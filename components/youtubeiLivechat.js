import Component from "./component.js";
import youtubeConfig from "./../config/youtubeConfig.json" with {type: "json"}
// import {LiveChat} from 'youtube-chat'
import parseCommand from "../util/parseCommand.js"

import {Innertube, YTNodes} from 'youtubei.js'


export default class YoutubeiLiveChat extends Component {
    fetchTime = new Date();
    connected = false;
    initiated = false;
    constructor(messageHandler){
        super();
        this.messageHandler = messageHandler;
        if (youtubeConfig.enableAtStart && youtubeConfig.videoId){
          this.connect(youtubeConfig.videoId);
        }
        
    }

    async connect(params){
      if (!params[0]){
        this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Video ID required");
        return;
      }

      if (this.connected) return;
        try {

          const yt =  await Innertube.create({});

          // const channel = await it.getChannel(youtubeConfig.channelId);

          const videoInfo = await yt.getInfo(params[0]);

          this.liveChat = await videoInfo.getLiveChat();

          this.liveChat.start();


          // this.liveChat = new LiveChat({channelId: youtubeConfig.channelId});
          await this.enableOnChat(this.liveChat);
          // const ok = await this.liveChat.start()
          // this.connected = true;
          // if (!this.initiated){
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Youtube livechat connected");
          
          //console.log("youtube connected")
          
        } catch (error) {
          //console.log("fetch youtube error")
          console.log(error)
          this.connect = false;
          console.log("Unable to connect youtube livechat")
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Unable to connect youtube livechat");
          await this.disconnect();
          return error
        }
        return true
      }
      
      async disconnect(){
        try {
          delete this.liveChat;
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Youtube livechat disconnected");
        } catch (error) {
          console.log(error)
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Unable to disconnect youtube livechat");
          return error
        }
        return true;
      }

      async enableOnChat(livechat){
           livechat.on('chat-update', (action) => {

            if (action.is(YTNodes.AddChatItemAction)) {
              const item = action.as(YTNodes.AddChatItemAction).item;
            
              if (!item)
                return console.info('Action did not have an item.', action);
            
              const hours = new Date(item.hasKey('timestamp') ? item.timestamp : Date.now()).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              });
            
              switch (item.type) {
                case 'LiveChatTextMessage':
                  // console.log(
                  //   `${item.as(YTNodes.LiveChatTextMessage).author?.is_moderator ? '[MOD]' : ''}`,
                  //   `${hours} - ${item.as(YTNodes.LiveChatTextMessage).author?.name.toString()}:\n` +
                  //   `${item.as(YTNodes.LiveChatTextMessage).message.toString()}\n`
                  // );

                  // console.log(item.as(YTNodes.LiveChatTextMessage));
                  
                  const channelId = item.as(YTNodes.LiveChatTextMessage).author.id;
                  const username = item.as(YTNodes.LiveChatTextMessage).author.name;
                  let message = "";
                  const runs = item.as(YTNodes.LiveChatTextMessage).message.runs;


                  runs.forEach(run => {
                    console.log(run);

                   if (run.emoji){
                      message += run.emoji.shortcuts[0];
                    }else{
                      message += run.text;
                    }
                  });


                  this.messageHandler.handleYoutubeMessage(channelId,username,message,{});

                  // let channelId = item.as(YTNodes.LiveChatTextMessage).author.

                  // this.messageHandler.handleYoutubeMessage(channelId,username,message,chatItem);
                  break;
                case 'LiveChatPaidMessage':
                  console.log(
                    `${item.as(YTNodes.LiveChatPaidMessage).author?.is_moderator ? '[MOD]' : ''}`,
                    `${hours} - ${item.as(YTNodes.LiveChatPaidMessage).author.name.toString()}:\n` +
                    `${item.as(YTNodes.LiveChatPaidMessage).message.toString()}\n`,
                    `${item.as(YTNodes.LiveChatPaidMessage).purchase_amount}\n`
                  );
                  break;
                case 'LiveChatPaidSticker':
                  console.log(
                    `${item.as(YTNodes.LiveChatPaidSticker).author?.is_moderator ? '[MOD]' : ''}`,
                    `${hours} - ${item.as(YTNodes.LiveChatPaidSticker).author.name.toString()}:\n` +
                    `${item.as(YTNodes.LiveChatPaidSticker).purchase_amount}\n`
                  );
                  break;
                default:
                  console.debug(action);
                  break;
              }
            };
      });
    }

      handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!yi/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        //let reply = false;
       switch (command){
            case "connect": this.connect(params); break;
            case "disconnect": this.disconnect(); break;
            default: break;
       }
    }
}