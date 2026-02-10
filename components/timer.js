import config from "../config.js";
import parseCommand from "../util/parseCommand.js";
import Component from "./component.js";

export default class Timer extends Component {
   constructor() {
      super();
      this.timerSoundFile = config.timer.soundFile;
   }

   setTimer(params, inMinutes, client, channel) {
      let seconds = Number(params[0]);
      let message = "";
      if (params[1]) message = params[1];
      if (isNaN(seconds)) return "Invalid timer duration";
      if (inMinutes) seconds *= 60;

      setTimeout(() => {
         client.say(channel, "Time's up!!! " + message);
         if (this.timerSoundFile) {
            this.io.emit("autoreply", { file: this.timerSoundFile });
         }
      }, seconds * 1000);

      if (this.timerSoundFile) {
         this.io.emit("autoreply", { file: this.timerSoundFile });
      }
      return `Timer set for ${params[0]} ${inMinutes ? "minutes" : "seconds"}`;
   }

   handleAdminMessage(client, message, messageHandler) {
      if (!message.message.match(/^!timer/)) return;
      const { command, params } = parseCommand(message.message, true);
      let reply = false;
      switch (command) {
         case "m":
            reply = this.setTimer(params, true, client, message.channel);
            break;
         case "s":
            reply = this.setTimer(params, false, client, message.channel);
            break;
         default:
            "Usage: m s";
            break;
      }

      if (reply) {
         console.log(reply);
         client.say(message.channel, reply);
      }
   }
}
