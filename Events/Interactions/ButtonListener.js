const {  ChatInputCommandInteraction } = require("discord.js");
const {
  DeveloperPermissions,
  MissingPermissions,
} = require("../../Modules/Embeds/Error");
const config = require("../../Config/config.json");
module.exports = {
  name: "interactionCreate",
  description: "Button Listener Event",

  /**
   *
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */
  async execute(interaction, client) {
    if (!interaction.isButton()) return;

    const button = client.buttons.get(interaction.customId);

    if (!button) return;

    if (button == undefined) return;

    if (
      button.permission &&
      !interaction.member.permissions.has(button.permission)
    )
      return interaction.reply({
        embeds: [new  MissingPermissions()],
        ephemeral: true,
      });

    if (button.developer && interaction.user.id !== config.ID)
      return interaction.reply({
        embeds: [new DeveloperPermissions()],
        ephemeral: true,
      });

    button.execute(interaction, client);
  },
};
