import languageConfig from './../config/languageConfig.json' assert {type:'json'}
import gTTS from 'gtts'
import Component from './component.js';
import Audic from 'audic';
import botConfig from './../config/botConfig.json' assert { type: 'json' }
import ffmpeg from 'fluent-ffmpeg';
import { unlink } from 'fs/promises';

export default class ReadMessage extends Component{
    fileCount = 0
    queue = []
    constructor(){
        super();
    }

    async read(name,message,language){
        const count = this.fileCount;
        this.fileCount++;
        if (language == "zh") 
            if (languageConfig.defaultChinese){
                language = languageConfig.defaultChinese;
            }else{
                language = "zh-tw"
            }           

        console.log(language)
        const gtts = new gTTS(name+": "+message, language);
        const fileName = `./temp/${count}.mp3`;
        gtts.save(fileName, function (err, result) {
            if (err) console.log(err)
            ffmpeg().addInput(fileName).audioFilters("atempo="+botConfig.readMessageSpeed).output(fileName+"_p.mp3").on('end', function() {
                unlink(fileName);
              }).run();
        });
        this.queue.push(fileName+"_p.mp3");
        if (this.queue.length == 1){
            await this.playAudio()
        }
    }

    async playAudio(){
        const file = this.queue[0];
        const audic = new Audic(file);
        audic.addEventListener('ended', async () => {
            this.queue.shift();
            //console.log(`finish playing ${file}`)
            audic.destroy();
            unlink(file);
            if (this.queue.length != 0){
                await this.playAudio();
            }
        });
        await audic.play()
    }
}