import parseCommand from "../util/parseCommand";
import Component from "./component.js";

export default class Timer extends Component{
    constructor(){
        super();
    }

    setTimer(params,inMinutes, client, channel){
        let seconds = Number(params[0]);
        let message = "";
        if (params[1]) message = params[1];
        if (isNaN(seconds)) return "Invalid timer duration";
        if (inMinutes) seconds *= 60;

        setTimeout(()=>{
            client.say(channel,"Time's up!!! "+message);
        }, seconds * 1000);

    }

    handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!timer/)) return;
        const {command, params} = parseCommand(message.message, true);
        let reply = false;
        switch (command){
             case "m": reply = this.setTimer(params,true, client, message.channel);  break;
             case "s": reply = this.setTimer(params,false, client, message.channel); break;
             default: break;
        }

        if (reply){
         console.log(reply)
         client.say(message.channel, reply)
        }
    }
}