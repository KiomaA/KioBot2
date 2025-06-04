// [YouTube: Kioma Ch. 祈奧馬・阿凡隆【HKVTuber】] :face-blue-smiling::face-blue-smiling::face-blue-smiling:
import Component from "./component.js";
import twitchConfig from './../config/twitchConfig.json' with {type:'json'}

export default class RestreamBotChat extends Component {
    constructor(messageHandler){
        super();
        this.messageHandler = messageHandler;
        this.enabled = twitchConfig.restreamBotEnabled
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
    }
      
      async disconnect(){
        this.enabled = false;
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