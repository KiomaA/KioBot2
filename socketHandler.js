import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; 
import config from './config.js';

import Component from "./components/component.js";
export default class SocketHandler{
    constructor(messageHandler){
        this.messageHandler = messageHandler;

        const app = express();
        const server = http.createServer(app);
        this.io = new Server(server);

        app.use('/',express.static('./html'))
        app.use('/overlays',express.static('./html/overlays'));
        app.use('/temp',express.static('./temp'));
        app.use('/audio',express.static('./audio'));


        server.listen(config.socketPort,()=>{console.log(`created server on http://localhost:${config.socketPort}`);})
        
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