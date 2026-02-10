import Component from "./component.js";
import parseCommand from "../util/parseCommand.js";
import config from "../config.js";
// import {playAudioFile} from 'audic'

export default class QueueMahjong extends Component {
   enabled = false;
   queue = [];
   statusMessage = "Mahjong Queue Ready";
   enabled5ma = false;
   soundFile5ma = "";
   constructor() {
      super();
      this.enabled5ma = config.queue.enable5ma;
      this.soundFile5ma = config.queue.soundFile5ma;
   }

   playerJoin(name, client, messageHandler) {
      if (!this.queue.includes(name)) {
         this.queue.push(name);
         client.say(
            messageHandler.defaultChannel,
            `謝謝 ${name} 加入！目前已排： | Thanks ${name} for joining! Currently on queue: ${this.queue.join(" ")}`,
         );
         console.log(this.queue);
         this.io.emit("mah", { queue: this.queue });
      } else {
         client.say(messageHandler.defaultChannel, `${name} 已排 | ${name} is already on queue`);
      }
   }

   enable(client, messageHandler) {
      this.enabled = true;
      this.statusMessage = `已啟動排隊，請留言「+1」進入友人場！ Queue enabled. Please type "+1" at chat to queue!`;
      client.say(
         messageHandler.defaultChannel,
         `已啟動排隊，請留言「+1」進入友人場！ Queue enabled. Please type "+1" at chat to queue!`,
      );
      this.io.emit("mah", {
         message: `已啟動排隊，請留言「+1」進入友人場！ Queue enabled. Please type "+1" at chat to queue!`,
      });
   }

   disable(client, messageHandler) {
      this.enabled = false;
      this.statusMessage = `已關閉排隊 Queue disabled`;
      client.say(messageHandler.defaultChannel, `已關閉排隊 Queue disabled`);
      this.io.emit("mah", { message: `已關閉排隊 Queue disabled` });
   }

   add(params, front, client, messageHandler) {
      if (front) {
         this.queue = [...params, ...this.queue];
      } else {
         this.queue = [...this.queue, ...params];
      }
      client.say(
         messageHandler.defaultChannel,
         `${params.join(", ")} 歡迎加入排隊！ Thanks for joining queue!`,
      );
      console.log(this.queue);
      this.io.emit("mah", { queue: this.queue });
   }

   remove(params, byIndex, client, messageHandler) {
      if (byIndex) {
         params.forEach((removeIndex) => {
            let index = Number.parseInt(removeIndex);
            if (!Number.isNaN(index)) {
               this.queue.splice(index, 1);
            }
         });
      } else {
         params.forEach((removeName) => {
            let index = this.queue.indexOf(removeName);
            if (index !== -1) {
               this.queue.splice(index, 1);
            }
         });
      }
      this.queue = [...this.queue, ...params];
      client.say(
         messageHandler.defaultChannel,
         `已移除參加者，目前已排： | Players removed, current in queue:  ${this.queue.join(", ")}`,
      );
      this.io.emit("mah", { queue: this.queue });
   }

   clear(client, messageHandler) {
      this.queue = [];
      client.say(messageHandler.defaultChannel, `已清空排隊 Queue cleared`);
      this.io.emit("mah", { queue: this.queue });
   }

   startGame(params, includeStreamer, client, messageHandler) {
      let players = 0;
      let playerNames = [];
      if (typeof params[0] == Number) players = params[0];
      else {
         players = Number.parseInt(params[0]);
         if (Number.isNaN(players)) {
            client.say(
               messageHandler.defaultChannel,
               `Start game: Invalid parameters / Usage: !mah game [no. of players including streamer] / !mah gameNs [no. of players excluding streamer]`,
            );
         }
      }

      // -1 if player includes streamer
      if (includeStreamer) players--;

      // return error message if not enough players
      if (this.queue.length < players) {
         client.say(
            messageHandler.defaultChannel,
            `不夠人玩啊，現在排隊的有： | Not enough players, current in queue: ${this.queue.join(", ")}`,
         );
         return;
      }

      // shift player names
      for (let i = 0; i < players; i++) {
         playerNames.push(this.queue.shift());
      }

      client.say(
         messageHandler.defaultChannel,
         `${playerNames.join(", ")} 請加入友人場！ Please enter game!`,
      );
      this.io.emit("mah", { queue: this.queue });
   }

   start5ma(client, messageHandler) {
      if (this.enabled5ma) {
         client.say(messageHandler.defaultChannel, `對唔住喎冇五麻呢樣嘢，最多咪俾個5ma你囉 <3`);
         if (this.soundFile5ma) {
            this.io.emit("autoreply", { file: this.soundFile5ma });
         }
      }
   }

   check(client, messageHandler) {
      client.say(messageHandler.defaultChannel, `On queue: ${this.queue.join(", ")}`);
   }

   handleSocket(socket, io, messageHandler) {
      socket.on("mah", (message) => {
         if (message.update) {
            io.emit("mah", { message: this.statusMessage, queue: this.queue });
         }
      });
   }

   handleMessage(client, message, messageHandler) {
      // add player to queue if enabled and received +1
      if (this.enabled) {
         if (message.message.includes("+1")) {
            this.playerJoin(message.nickname, client, messageHandler);
         }
      }
   }
   handleAdminMessage(client, message, messageHandler) {
      if (!message.message.match(/^!mah/)) return;
      const { command, params } = parseCommand(message.message, true);

      let reply = false;
      switch (command) {
         case "start":
            this.enable(client, messageHandler);
            break;
         case "end":
            this.disable(client, messageHandler);
            break;
         case "add":
            this.add(params, false, client, messageHandler);
            break;
         case "addFront":
            this.add(params, true, client, messageHandler);
            break;
         case "remove":
            this.remove(params, false, client, messageHandler);
            break;
         case "removeIdx":
            this.remove(params, true, client, messageHandler);
            break;
         case "clear":
            this.clear(client, messageHandler);
            break;
         case "3ma":
            this.startGame([3], true, client, messageHandler);
            break;
         case "4ma":
            this.startGame([4], true, client, messageHandler);
            break;
         case "5ma":
            this.start5ma(client, messageHandler);
            break;
         case "game":
            this.startGame(params[0], true, client, messageHandler);
            break;
         case "gameNs":
            this.startGame(params[0], false, client, messageHandler);
            break;
         case "check":
            this.check(client, messageHandler);
            break;
         default:
            reply =
               "Usage: start end add addFront remove removeIdx clear 3ma 4ma 5ma game gameNs check";
            break;
      }

      if (reply) {
         console.log(reply);
         client.say(message.channel, reply);
      }
   }
}
