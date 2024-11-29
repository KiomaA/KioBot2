import { Server } from "socket.io";
import botConfig from './config/botConfig.json' assert {type:'json'}
import Component from "./components/component.js";
export default class SocketHandler{
    constructor(messageHandler){
        this.messageHandler = messageHandler;
        
        this.io = new Server(botConfig.socketPort);

        this.io.on('connection', (socket)=>{
            socket.emit("test","success");

            // look for each component and add socket events
            for (const key in this.messageHandler) {
                const comp = this.messageHandler[key]
                if (comp instanceof Component){
                    comp.socketEvent(socket,io,this.messageHandler);
                }
            }
        })        
    }
}