import parseCommand from "../util/parseCommand.js"
import Component from "./component.js"
import fs from 'fs'

export default class AutoReply extends Component{
    replies = []
    messageUsers = {}
    messageCount = {}
    soundTime = {}
    mute = false;
    
    constructor(googleSheetHandler){
        super();
        this.googleSheetHandler = googleSheetHandler;
        this.updateReplyList()
    }

    async updateReplyList(){
        const sheet = await this.googleSheetHandler.getSheet("autoreply");
        const rows = await sheet.getRows();

        const replies = rows.map((row)=>{
            const rawData = row._rawData
            let exceptions = [];
            let replyLanguages = [];
            let skipLanguages = [];
            if (rawData[5] != '' && rawData[5] != undefined){
                exceptions = rawData[5].split(",")
            }
            if (rawData[8] != '' && rawData[8] != undefined){
                replyLanguages = rawData[8].split(",")
            }
            if (rawData[9] != '' && rawData[9] != undefined){
                skipLanguages = rawData[9].split(",")
            }

            let cooldown = Number(rawData[7]);
            if (isNaN(cooldown)) cooldown = 0;

            return {message: rawData[0], type: rawData[1], reply: rawData[2], ignoreAdmin:!!rawData[3], once:!!rawData[4], exceptions:exceptions, sound:rawData[6], soundCooldown:cooldown, replyLanguages:replyLanguages,skipLanguages:skipLanguages, disabled:!!rawData[10], subscriberReply:rawData[11], subscriberUniqueSound:!!rawData[12],} 
        })
        this.replies = replies
        // console.log(this.replies[0]);
    }

    replyMessage(client,channel,message,language,name,user,platform,isAdmin,remark){
        for (const reply of this.replies) {
            // look for keyword
            if (message.toLowerCase().includes(reply.message)){
                // skip if autoreply is disabled
                if (reply.disabled) continue;

                // check autoreply language
                if (reply.replyLanguages.length >= 1 && !reply.replyLanguages.includes(language)) continue;
                if (reply.skipLanguages.length >= 1 && reply.skipLanguages.includes(language)) continue;

                // skip if no need to reply to admin
                if (reply.ignoreAdmin && isAdmin) continue;

                // skip if exception
                let skip = false
                for (const exc of reply.exceptions) {
                    if(message.toLowerCase().includes(exc)){
                        skip = true;
                        break;
                    }
                }
                if (skip) continue;

                // check if message is one-time only
                if (reply.once){
                    if (this.messageUsers[reply.type]){
                        if (this.messageUsers[reply.type].includes(user)) continue;
                        else this.messageUsers[reply.type] = [...this.messageUsers[reply.type],user];
                    }else{
                        this.messageUsers[reply.type] = [user];
                    }
                }

                // check message count
                if (reply.reply.includes("{count}")){
                    if (this.messageCount[reply.type]){
                        this.messageCount[reply.type] ++;
                    }else{
                        this.messageCount[reply.type] = 1;
                    }
                }

                let replyText = reply.reply;
                replyText = replyText.replace("{name}",name);
                replyText = replyText.replace("{count}", this.messageCount[reply.type]);

                client.say(channel,replyText)

                // play audio
                if (!this.mute && reply.sound){
                    // check cooldown time
                    let playsound = true;
                    let sound = reply.sound;

                    if (reply.soundCooldown){
                      if (!this.soundTime[reply.type]){
                        this.soundTime[reply.type] = new Date().getTime() / 1000;
                      }else{
                        let nowSeconds = new Date().getTime() / 1000;
                        if (nowSeconds - this.soundTime[reply.type] < reply.soundCooldown) {
                          playsound = false;
                          console.log(`play sound in cooldown: ${reply.soundCooldown -(nowSeconds - this.soundTime[reply.type])} s remaining`)
                        }else{
                            this.soundTime[reply.type] = nowSeconds;
                        }
                      }
                    }     
                    if (playsound){
                        let soundPath = '/audio/'+sound

                        // check if subscriber voice exists
                        if (platform == "twitch"){
                            if (reply.subscriberUniqueSound){
                                if (remark.chatMessage.userInfo.isSubscriber){
                                    let subSoundPath = `/audio/sub/${reply.type}/twitch_${user}.mp3`
                                    // console.log(subSoundPath)
                                    if (fs.existsSync("./"+subSoundPath)) soundPath = subSoundPath;
                                }
                            }
                        }
                        // else if (platform == "youtube"){
                        //     // reserved for youtube members
                        // }
                        
                      this.io.emit('autoreply',{file:soundPath})
                    //   playAudioFile('./audio/'+reply.sound);
                    }


                  }
            }
        }
    }

    reset(resetMessageUsers, resetMessageCount, resetSoundTime) {
        let reset = [];
        if (resetMessageUsers) {
            this.messageUsers = {};
            reset.push("user list")
        }
        if (resetMessageCount) {
            this.messageCount = {}
            reset.push("message count")
        }
        if (resetSoundTime) {
            this.soundTime = {}
            reset.push("cooldown time")
        }
        return `Autoreply ${reset.join(", ")} reset`
    }

    handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!autoreply/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        let reply = false;
       switch (command){
            //case "add": reply = this.addReply(params)
            case "update": this.updateReplyList(); reply = "Auto-reply updated"; break;
            case "mute": this.mute = true; reply = "Auto-reply muted"; break;
            case "unmute": this.mute = false; reply = "Auto-reply unmuted"; break;
            case "resetUsers": reply = this.reset(true,false,false); break;
            case "resetCount":  reply = this.reset(false,true,false); break;
            case "resetTime":  reply = this.reset(false,false,true); break;
            case "reset": reply = this.reset(true,true,true); break;
            default: reply="Usage: update mute unmute resetUsers resetTime reset"; break;
       }

       if (reply){
        console.log(reply)
        client.say(message.channel, reply)
       }

    }
}