import Component from "./component.js";
import youtubeConfig from "./../config/youtubeConfig.json" assert {type: "json"}
import {LiveChat} from 'youtube-chat'
import parseCommand from "../util/parseCommand.js"

export default class YoutubeLiveChat extends Component {
    fetchTime = new Date();
    connected = false;
    constructor(messageHandler){
        super();
        this.liveChat = new LiveChat({channelId: youtubeConfig.channelId});
        this.messageHandler = messageHandler;
        this.enableOnChat();

        if (youtubeConfig.enableAtStart){
          this.connect();
        }
        
    }

    async connect(){
      if (this.connected) return;
        try {
          const ok = await this.liveChat.start()
          this.connected = true;
          console.log("Youtube livechat connected")
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Youtube livechat connected");
          //console.log("youtube connected")
          
        } catch (error) {
          //console.log("fetch youtube error")
          console.log(error)
          this.connect = false;
          console.log("Unable to connect youtube livechat")
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Unable to connect youtube livechat");
          return error
        }
        return true
      }
      
      async disconnect(){
        try {
          const ok = await this.liveChat.stop()
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Youtube livechat disconnected");
          //console.log("youtube disconnected")

        } catch (error) {
          //console.log("disconnect youtube error")
          console.log(error)
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Unable to disconnect youtube livechat");
          return error
        }
        return true;
      }

      enableOnChat(){
        this.liveChat.on("chat", (chatItem) => {
          // process new messages only
          if (chatItem.timestamp >= this.fetchTime){   
           // console.log(chatItem.message)
            let message = "";

            chatItem.message.forEach(msg => {
              if (msg.text) message += msg.text;
              if (msg.emojiText) message += msg.emojiText;
            });

            let username = chatItem.author.name
            let channelId = chatItem.author.channelId

            this.messageHandler.handleYoutubeMessage(channelId,username,message,chatItem);
          }
        });

        this.liveChat.on('error',async(err)=>{
          //console.log("[ERROR] YT Livestream error")
          console.log(err);
          this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, `YT Livestream error`);
        });
      }

      handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!yt/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        //let reply = false;
       switch (command){
            case "connect": this.connect(); break;
            case "disconnect": this.disconnect(); break;
            default: break;
       }
    }
}