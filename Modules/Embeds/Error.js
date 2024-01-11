const { EmbedBuilder } = require("discord.js");

/**
 * @param {Client} client
 */

module.exports = {
  Error: class Error extends EmbedBuilder {
    constructor() {
      super();
      this.setTitle("🔴 Error Detected");
      this.setDescription(
        "An error has been detected in the bot, developer have been notified about this error, please try again later."
      );
      this.setColor("Red");
      this.setAuthor({
        name: "Handler Error",
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      });
      this.setTimestamp();
    }
  },
  MissingPermissions: class MissingPermissions extends EmbedBuilder {
    constructor() {
      super();
      this.setTitle("⚠️ Missing Permissions");
      this.setDescription(
        "You don't have permissions to execute this command."
      );
      this.setColor("Yellow");
      this.setAuthor({
        name: "Handler Error",
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      });
    }
  },
  DeveloperPermissions: class DeveloperPermissions extends EmbedBuilder {
    constructor() {
      super();
      this.setTitle("⚠️ Missing Permissions");
      this.setDescription(
        "This command is only available to the developer of the bot."
      );
      this.setColor("Yellow");
      this.setAuthor({
        name: "Handler Error",
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      });
      this.setTimestamp();
    }
  },
  UnBuild: class UnBuild extends EmbedBuilder {
    constructor() {
      super();
      this.setTitle("⚠️ Current Development");
      this.setDescription(
        "This command is currently under development. Please try again later."
      );
      this.setColor("Yellow");
      this.setAuthor({
        name: "Handler Error",
        iconURL: `${client.user.displayAvatarURL({ dynamic: true })}`,
      });
    }
  },
};
