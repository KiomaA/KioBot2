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
            list[rawData[0]] = {zh:rawData[1], en:rawData[2], ja:rawData[3], ko:rawData[4]} 
        })
        this.rewards = list
    }

    redeem(chatClient,channel,platform,name,lang,msg,remark){
        if (platform != "twitch") return msg;
        if (typeof remark != "object") return msg;
        if (!remark.chatMessage) return msg;
        if (!remark.chatMessage.isRedemption) return msg;
        if (!remark.chatMessage.rewardId) return msg;
        if (!this.rewards[remark.chatMessage.rewardId]) return msg;

        let item = this.rewards[remark.chatMessage.rewardId];
        let message = msg;        

        let rewardName = false;

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