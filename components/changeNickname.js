import parseCommand from "../util/parseCommand.js"
import Component from "./component.js"
import config from "../config.js"

const {language: languageConfig} = config;

export default class ChangeNickname extends Component{
    twitchNames = {}
    youtubeNames = {}
    restreamNames = {}

    constructor(googleSheetHandler){
        super();
        this.googleSheetHandler = googleSheetHandler;
        this.updateNameList();
    }

    async updateNameList(){
        const sheet = await this.googleSheetHandler.getSheet("nicknames");
        const rows = await sheet.getRows();
        let twList = {};
        let ytList = {};
        let rsList = {};
        
        rows.forEach((row)=>{
            const rawData = row._rawData
            let chinese_pronounce  = "";
            if ( rawData[3].includes("Cantonese")) chinese_pronounce = "zh-yue";
            else if (rawData[3].includes("Mandarin")) chinese_pronounce = "zh-tw";

            if (rawData[1]) twList[rawData[1]] = {chinese_pronounce:chinese_pronounce, zh:rawData[4], en:rawData[5], ja:rawData[6], ko:rawData[7]} ;
            if (rawData[2]) ytList[rawData[2]] = {chinese_pronounce:chinese_pronounce, zh:rawData[4], en:rawData[5], ja:rawData[6], ko:rawData[7]} ;
            if (rawData[8]) rsList[rawData[8]] = {chinese_pronounce:chinese_pronounce, zh:rawData[4], en:rawData[5], ja:rawData[6], ko:rawData[7]} ;
        })
        
        this.twitchNames = twList;
        this.youtubeNames = ytList;  
        this.restreamNames = rsList;
    }

    change(platform,user,name,lang){
        let item = {}
        let nickname = name;
        let language = lang;

        // find name from twitch or youtube name list
        if (platform == "twitch"){
            if (!this.twitchNames[user]) return {nickname,language};
            item = this.twitchNames[user];
        }else if (platform == "youtube"){
            if (!this.youtubeNames[user]) return {nickname,language};
            item = this.youtubeNames[user]
        }else if (platform == "restreambot") {
            if (!this.restreamNames[name]) return {nickname,language};
            item = this.restreamNames[name]
        }
        else return {nickname,language};

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
            }else{
                language = languageConfig.defaultChinese;
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
            case "update": this.updateNameList(); reply = "Nickname list updated"; break;
            default: reply="Usage: update"; break;
       }

       if (reply){
        console.log(reply)
        client.say(message.channel, reply)
       }
    }
}