import { randomUUID } from "crypto";
import parseCommand from "../util/parseCommand.js";
import Component from "./component.js";

export default class TextScroll extends Component {
    enabled = true;
    statusList = [];
    instanceId = null;


    constructor(messageHandler, googleSheetHandler) {
        super();
        this.messageHandler = messageHandler;
        this.googleSheetHandler = googleSheetHandler;
        this.updateStatusList(this.enabled);
    }

    async updateStatusList(startScroll = false) {
        const sheet = await this.googleSheetHandler.getSheet("text_scroll");
        const rows = await sheet.getRows();
        this.statusList = rows.map(row => {return {message: row._rawData[0], postChat:row._rawData[1] == "Y", duration: Number(row._rawData[2])}});
        console.log(this.statusList);

        if (startScroll) {
            const newInstanceId = randomUUID();
            this.instanceId = newInstanceId;
            this.startScrollInterval(0, newInstanceId);
        }
    }

    startScrollInterval(index = 0, instanceId = null) {
        // return if not enabled or instanceId is not the same
        if (!this.enabled || instanceId !== this.instanceId) return;

        // get duration from current status
        const duration = this.statusList[index].duration;

        // emit message to socket
        this.io.emit('textScroll', {message: this.statusList[index].message, enabled: this.enabled});
        if (this.statusList[index].postChat) {
            this.messageHandler.chatClient.say(this.messageHandler.defaultChannel, this.statusList[index].message);
        }

        // set timeout to next status
        setTimeout(() => {
            const newIndex = (index + 1) % this.statusList.length;
            this.startScrollInterval(newIndex, instanceId);
        }, duration * 60 * 1000);
    }

    listStatus() {
        let reply = "Text Scroll list: ";
        for (const status of this.statusList) {
            reply += `- ${status.message} (${status.duration} min${status.postChat ? ", Post Chat" : ""})`;
            if (status !== this.statusList[this.statusList.length - 1]) {
                reply += " | ";
            }
        }
        return reply;
    }



    handleSocket(socket, io, messageHandler) {
        socket.on('textScroll', (message) => {
            if (message.update){
                if (this.statusList.length > 0) {
                    io.emit('textScroll', {message: this.statusList[0].message, enabled: this.enabled});
                } else {
                    io.emit('textScroll', {message: "List loading...", enabled: this.enabled});
                    this.updateStatusList(this.enabled);
                }
            }
        });
    }

    handleAdminMessage(client, message, messageHandler) {
        if (!message.message.match(/^!textScroll/)) return;
        const { command, params } = parseCommand(message.message, true);
        let reply = false;
        switch (command) {
            case "disable":
                this.enabled = false;
                reply = "Text Scroll disabled";
                break;
            case "enable":
                    this.enabled = true;
                    const newInstanceId = randomUUID();
                    this.startScrollInterval(0, this.instanceId);
                    reply = "Text Scroll enabled";
                break;
            case "update":
                this.updateStatusList(this.enabled);
                reply = "Text Scroll list updated";
                break;

            case "list":
                reply = this.listStatus();
                break;

            default:
                reply = "Usage: disable enable update";
                break;
        }
        if (reply) {
            console.log(reply);
            client.say(message.channel, reply);
        }
    }
    
}
