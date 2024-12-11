import languageConfig from './../config/languageConfig.json' assert {type:'json'}
import { eld } from 'eld'
import Component from './component.js';
export default class DetectLanguage extends Component{
    constructor(){ 
        super();
        if (languageConfig.detectLanguages){
            eld.dynamicLangSubset(languageConfig.detectLanguages);
            eld.dynamicLangSubset(false)
        }        
    }

    detect(message){
        const lang = eld.detect(message);
        let language = lang.language;
        let scores = lang.getScores();
        //console.log(scores)

        // add chinese weight if only chinese characters and no kana
        if (languageConfig.addChineseWeight){
            if (message.match(/[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF]/)){
                if (!scores.zh) scores.zh = 0.3;
                if (!scores.ja) scores.ja = 0.3;
            }

            if (scores.zh && !message.match(/[\u3040-\u30FF\u31F0-\u31FF]/)){
               scores.zh *= 5;
            }
            try{
            language = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            }catch(err){}
        }
        

        if (!languageConfig.detectLanguages){
            language = "en"
        }else if (!languageConfig.detectLanguages.includes(language)){
            language = languageConfig.detectLanguages[0];
        }

        console.log(scores)
        console.log(language)
        return language;
    }
}