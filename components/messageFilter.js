import Component from "./component.js";

export default class MessageFilter extends Component{
    filters = []
    constructor(googleSheetHandler){
        super();
        this.updateFilter(googleSheetHandler);
    }

    async updateFilter(googleSheetHandler){
        const sheet = await googleSheetHandler.getSheet("message_filter");
        const rows = await sheet.getRows();

        const filters = rows.map((row)=>{
            const rawData = row._rawData

            return {message: rawData[0], replacement: rawData[1]} 
        })
        this.filters = filters
    }

    filterMessage(message){
        let filteredMessage = message
        for (const filter of this.filters) {
            if (message.includes(filter.message)){
                filteredMessage = filteredMessage.replaceAll(filter.message, filter.replacement);
            }
        }
        return filteredMessage;
    }

}