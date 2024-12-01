import parseCommand from "../util/parseCommand.js"
import Component from "./component.js"


export default class ChangeNickname extends Component{
    twitchNames = {}
    youtubeNames = {}

    constructor(googleSheetHandler){
        super();
        this.googleSheetHandler = googleSheetHandler;
        this.updateTwitchNameList();
        this.updateYoutubehNameList();
    }

    async updateTwitchNameList(){
        const sheet = await this.googleSheetHandler.getSheet("twitch_names");
        const rows = await sheet.getRows();
        let list = {};
        rows.forEach((row)=>{
            const rawData = row._rawData
            list[rawData[0]] = {chinese_pronounce:rawData[1], zh:rawData[2], en:rawData[3], ja:rawData[4], ko:rawData[5]} 
        })
        this.twitchNames = list
    }

    async updateYoutubehNameList(){
        const sheet = await this.googleSheetHandler.getSheet("yt_names");
        const rows = await sheet.getRows();
        let list = {};
        rows.forEach((row)=>{
            const rawData = row._rawData
            list[rawData[0]] = {chinese_pronounce:rawData[1], zh:rawData[2], en:rawData[3], ja:rawData[4], ko:rawData[5]} 
        })
        this.youtubeNames = list
    }

    change(platform,user,name,lang){
        let item = {}
        let nickname = name;
        let language = lang;

        // find name from twitch or youtube name list
        if (platform == "twitch"){
            if (!this.twitchNames[user]) return {name,lang};
            item = this.twitchNames[user];
        }else if (platform == "youtube"){
            if (!this.youtubeNames[user]) return {name,lang};
            item = this.youtubeNames[user]
        }else return {name,lang};

        //console.log(item)

        // replace nickname
        switch (lang){
            case "zh": 
                if (item.zh) nickname = item.zh;
                else if (item.en) nickname = item.en;
                else nickname =  name;
                break;
            case "ja":
                if (item.ja) nickname = item.ja;
                else if (item.en) nickname = item.en;
                else nickname =  name;
                break;
            case "ko":
                if (item.ko) nickname = item.ko;
                else if (item.en) nickname = item.en;
                else nickname =  name;
                break;
            default: 
                if (item.en) nickname = item.en;
                else nickname =  name;
                break;

        }

        // cantonese or mandarin
        if (item.chinese_pronounce && lang == "zh"){
            if (item.chinese_pronounce == "zh-tw" || item.chinese_pronounce == "zh-yue"){
                language = item.chinese_pronounce;
            }
        }
        return {nickname, language}
    }

    handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!name/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        let reply = false;
       switch (command){
            //case "add": reply = this.addReply(params)
            case "update": this.updateTwitchNameList(); this.updateYoutubehNameList(); reply = "Nickname list updated"; break;
            default: break;
       }

       if (reply){
        console.log(reply)
        client.say(message.channel, reply)
       }
    }
}