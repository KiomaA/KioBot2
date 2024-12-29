import languageConfig from './../config/languageConfig.json' assert {type:'json'}
import gTTS from 'gtts'
import Component from './component.js';
import ffmpeg from 'fluent-ffmpeg';
import parseCommand from "../util/parseCommand.js"
import { mkdirSync, rmSync } from 'fs';


export default class ReadMessage extends Component{
    fileCount = 0
    volume = 0.7
    queue = []
    constructor(enabled){
        super();
        this.enabled = !!enabled;
        rmSync('./temp',{recursive:true, force:true});
        mkdirSync('./temp');
    }

    async read(name,message,language){
        if (!this.enabled) return;
        const count = this.fileCount;
        this.fileCount++;
        if (language == "zh") 
            if (languageConfig.defaultChinese){
                language = languageConfig.defaultChinese;
            }else{
                language = "zh-tw"
            }           

        //console.log(language)

        let mes = message;
        if (!languageConfig.readUrl) mes = mes.replace(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/igm, "URL")

        const gtts = new gTTS(name+": "+mes, language);
        const fileName = `/temp/${count}.mp3`;
        const volume = this.volume;
        const io  = this.io;
        const tempo = languageConfig.readMessageSpeed[language]? languageConfig.readMessageSpeed[language]:1.5

        gtts.save('.'+fileName, function (err, result) {
            if (err) console.log(err)
            let duration = 10;
            
            ffmpeg.ffprobe('.'+fileName, function(err, metadata) {
                //console.dir(metadata); // all metadata
                duration = metadata.format.duration / tempo;
            });           
            
            ffmpeg().addInput('.'+fileName).audioFilters([`volume=volume=${volume}`,`atempo=${tempo}`]).output('.'+fileName+"_p.mp3").on('end', function() {
                //unlink(fileName);
                io.emit('read',{file:fileName+"_p.mp3", duration:duration});
              }).run();
        });
    }

    setVolume(params){
        let volume = Number(params[0]);
        if (isNaN(volume)) return "Invalid volume value";
        if (volume < 0) return "Invalid volume value";
        this.volume = volume;
    }


    handleAdminMessage(client,message,messageHandler){
        if (!message.message.match(/^!read/)) return;
        const {command, params} = parseCommand(message.message, true);
       
        let reply = false;
       switch (command){
            case "enable": this.enabled = true; reply = "Read message enabled"; break;
            case "disable": this.enabled = false; reply = "Read message disabled"; break;
            case "volume": reply = this.setVolume(params); break;
            default: break;
       }

       if (reply){
        console.log(reply)
        client.say(message.channel, reply)
       }

    }

    handleSocket(socket,io,messageHandler){
        return;
    }

}