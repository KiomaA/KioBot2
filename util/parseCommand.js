export default function parseCommand(message, joinSentence){
    const parts = message.split(" ")
    const command = parts[1];

    let params = [...parts]
    params.shift();
    params.shift();

    if (joinSentence){
        let sentenceStart = 0
        let inSentence = false;

        // group each parameter into sentences
        for (let i = 0; i < params.length; i++) {
            let word = params[i];
            if (word.match(/^".+"$/)){
                params[i] = word.replace(/^"/,"").replace(/"$/,"");
                continue;
            }

            if (!inSentence && word.match(/^".+/)){
                params[i] = word.replace(/^"/,"");
                sentenceStart = i
                inSentence = true;
            }else if (inSentence && word.match(/.+"$/)){
                word = word.replace(/"$/,"");
                params[sentenceStart] += " " + word;
                params[i] = "";
                inSentence = false;
            }else if (inSentence){
                params[sentenceStart] += " " + word;
                params[i] = "";
            }
        }
        params = params.filter((param)=>{return param != ""})
        //console.log(params)
    }

    return {command:command, params:params}
}