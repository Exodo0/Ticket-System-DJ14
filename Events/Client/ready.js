const chalk = require("chalk");
const { connect } = require("mongoose");
const { loadButtons } = require("../../Handlers/ButtonHandler");
const { LoadMenus } = require("../../Handlers/SelectMenuHandler");
const { DB } = require("../../Config/config.json");
module.exports = {
  name: "ready",
  description: "Ready Client Event",
  once: true,

  async execute(client) {
    console.log(chalk.greenBright("Client is ready!"));
    try {
      loadButtons(client);
      LoadMenus(client);
      await connect(DB);
      console.log(chalk.greenBright("Connected to MongoDB!"));
      console.log(
        chalk.greenBright(`Watching ${client.guilds.cache.size} servers!`)
      );
    } catch (error) {
      console.log(chalk.redBright("Error connecting to MongoDB: " + error));
    }

    const List = [
      "Watching over the server",
      "Watching New Members",
      "Moderating chat",
    ];

    setInterval(() => {
      const random = Math.floor(Math.random() * List.length);
      client.user.setActivity(List[random]);
    }, 10000);
  },
};
