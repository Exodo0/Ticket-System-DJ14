const { loadFiles } = require("../Functions/FileLoader");

async function LoadMenus(client) {
  console.time("Loading Menus");
  client.menus = new Map();
  const menus = new Array();

  const files = await loadFiles("/Modules/Menus");

  for (const file of files) {
    try {
      const menu = require(file);
      client.menus.set(menu.id, menu);
      menus.push({
        Menu: menu.id,
        Description: menu.description,
        Status: "🟢",
      });
    } catch (error) {
      menus.push({
        Menu: file.split("/").pop().slice(0, -3),
        Status: "🔴",
      });
    }
  }
  console.table(menus, ["Menu", "Description", "Status"]);
  console.info("\n\x1b[36m%s\x1b[0m", "Loaded Menus");
  console.timeEnd("Loading Menus");
}

module.exports = { LoadMenus };
