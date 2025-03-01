import parseCommand from "../util/parseCommand.js"
import Component from "./component.js"


export default class TwitchRedemption extends Component{
    rewards = {}

    constructor(googleSheetHandler){
        super();
        this.googleSheetHandler = googleSheetHandler;
        this.updateRewardList();
    }

    async updateRewardList(){
        const sheet = await this.googleSheetHandler.getSheet("rewards");
        const rows = await sheet.getRows();
        let list = {};
        rows.forEach((row)=>{
            const rawData = row._rawData
            list[rawData[0]] = {zh:rawData[1], en:rawData[2], ja:rawData[3], ko:rawData[4], duration:rawData[5], vipOnly:!!rawData[6], subOnly:!!rawData[7], endSound:rawData[8]} 
        })
        this.rewards = list
    }

    redeem(chatClient,channel,platform,name,lang,msg,remark){
        if (platform != "twitch") return msg;
        if (typeof remark != "object") return msg;
        if (!remark.chatMessage) return msg;
        if (!remark.chatMessage.isRedemption) return msg;
        if (!remark.chatMessage.rewardId) return msg;
        if (!this.rewards[remark.chatMessage.rewardId]) {
            console.log(`unlisted reward: ${remark.chatMessage.rewardId}`)
            return msg;
        }   

        let item = this.rewards[remark.chatMessage.rewardId];
        let message = msg;        

        let rewardName = false;

        //console.log(remark.chatMessage.userInfo.isMod)
        //console.log(remark.chatMessage.userInfo.isSubscriber)
        //console.log(remark.chatMessage.userInfo.isVip)


        let validReward = false;

        
        if (item.vipOnly && remark.chatMessage.userInfo.isVip){
            validReward = true;
         }else{
             message = "本獎勵只限VIP兌換，請聯絡台主退還點數。 This reward is for VIP only. Please contact streamer to return your points.";
         }


        if (item.subOnly && remark.chatMessage.userInfo.isSubscriber){
            validReward = true;
         }else{
             message = "本獎勵只限訂閲者兌換，請聯絡台主退還點數。 This reward is for subscribers only. Please contact streamer to return your points.";
        }

        if (!item.vipOnly && !item.subOnly) validReward = true;

        if (!validReward){
            chatClient.say(channel,message);
            return message;
        }
        

        switch (lang){
            case "zh": 
                if (item.zh) rewardName = item.zh;
                else if (item.en) rewardName = item.en;
                else message = msg;
                message = "兌換了獎勵："+rewardName+"！"+msg;
                break;
            case "ja":
                if (item.ja) rewardName = item.ja;
                else if (item.en) rewardName = item.en;
                else message = msg;
                message = "さんは「"+rewardName+"」を引き換えました! "+msg;
                break;
            // case "ko":
            //     if (item.ko) rewardName = item.ko;
            //     else if (item.en) rewardName = item.en;
            //     else return msg;
            //     message = "Redeemed: "+rewardName+"! "+msg;
            //     break;
            default: 
                if (item.en) rewardName = item.en;
                else message = msg;
                message = "Redeemed: "+rewardName+"! "+msg;
                break;
        }

        let rewardNameZh= "";
        let rewardNameEn = "";
        if (item.en){
            rewardNameZh = item.zh?item.zh:item.en;
            rewardNameEn = item.en;
        }       
        chatClient.say(channel,`感謝 ${name} 兌換${rewardNameZh}！ Thanks ${name} for redeeming ${rewardNameEn}!`)

        if (item.duration){
            let duration = Number(item.duration);
            let io = this.io;
            if (!isNaN(duration)){
                setTimeout(()=>{
                    chatClient.say(channel,`兌換${rewardNameZh}時間已到！ Time's up for reward ${rewardNameEn}!`)

                    if (item.endSound){
                        io.emit('autoreply',{file:'/audio/'+item.endSound})
                    }

                },duration*60*1000)
            }
        }

        return message;
    }

    handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!reward/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        let reply = false;
       switch (command){
            case "update": this.updateRewardList();  reply = "Reward list updated"; break;
            default: break;
       }

       if (reply){
        console.log(reply)
        client.say(message.channel, reply)
       }
    }
}