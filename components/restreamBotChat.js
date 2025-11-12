import Component from "./component.js";
import config from "../config.js";
import parseCommand from "../util/parseCommand.js";

const {twitch: twitchConfig} = config;

export default class RestreamBotChat extends Component {
    constructor(messageHandler){
        super();
        this.messageHandler = messageHandler;
        this.enabled = twitchConfig.enableRestreamBot
    }

    handleRestreamMessage(text,msg){
        if (!this.enabled) return;
        let message = text.replace(/^\[YouTube: .+\] /, '');
        let nameLen = text.length - message.length
        let username = text.substring(0,nameLen).replace(/^\[YouTube: /, '').replace(/\] $/,"");
        this.messageHandler.handleMessage(this.messageHandler.defaultChannel,'restreambot','rs',username,message,false,{chatMessage:msg});
    }

    async connect(){
        this.enabled = true;
        this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Restream connect");
    }
      
      async disconnect(){
        this.enabled = false;
        this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, "Restream disconnect");
        
      }

      handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!rb/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        //let reply = false;
       switch (command){
            case "connect": this.connect(); break;
            case "disconnect": this.disconnect(); break;
            default: break;
       }
    }
}