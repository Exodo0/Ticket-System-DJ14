const { loadFiles } = require("../Functions/FileLoader");

async function loadButtons(client) {
  console.time("Loading Buttons");
  client.buttons = new Map();
  const buttons = new Array();

  const files = await loadFiles("/Modules/Buttons");

  for (const file of files) {
    try {
      const button = require(file);
      client.buttons.set(button.id, button);
      buttons.push({
        Button: button.id,
        Description: button.description,
        Status: "🟢",
      });
    } catch (error) {
      buttons.push({
        Button: file.split("/").pop().slice(0, -3),
        Status: "🔴",
      });
    }
  }
  console.table(buttons, ["Button", "Description", "Status"]);
  console.info("\n\x1b[36m%s\x1b[0m", "Loaded Buttons");
  console.timeEnd("Loading Buttons");
}

module.exports = { loadButtons };
