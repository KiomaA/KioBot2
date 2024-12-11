import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; 

import botConfig from './config/botConfig.json' assert {type:'json'}
import Component from "./components/component.js";
export default class SocketHandler{
    constructor(messageHandler){
        this.messageHandler = messageHandler;

        const app = express();
        const server = http.createServer(app);
        this.io = new Server(server);

        app.use('/overlays',express.static('./overlays'));
        app.use('/temp',express.static('./temp'));


        server.listen(botConfig.socketPort,()=>{console.log(`created server on http://localhost:${botConfig.socketPort}`);})
        
        for (const key in this.messageHandler) {
            const comp = this.messageHandler[key]
            if (comp instanceof Component){
                comp.addIo(this.io);
            }
        }


        this.io.on('connection', (socket)=>{
            socket.emit("test","success");

            // look for each component and add socket events
            for (const key in this.messageHandler) {
                const comp = this.messageHandler[key]
                if (comp instanceof Component){
                    comp.handleSocket(socket,this.io,this.messageHandler);
                }
            }
        })        
    }
}