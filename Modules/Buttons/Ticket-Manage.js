const {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");
const TicketSetup = require("../Schemas/TicketSetup");
const config = require("../Triggers/Tickets");

module.exports = {
  id: "ticket-manage",
  description: "🔳 Ticket Manage",

  async execute(interaction, client) {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;
    const docs = await TicketSetup.findOne({ GuildID: guild.id });
    if (!docs) return;

    const Error = new EmbedBuilder()
      .setTitle("🔴 Ocurrio un error.")
      .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
      .setDescription(config.ticketError)
      .setTimestamp();

    if (!guild.members.me.permissions.has((r) => r.id === docs.Handlers))
      return interaction.reply({
        embeds: [Error],
        ephemeral: true,
      });
    const NoPermissions = new EmbedBuilder()
      .setColor("Red")
      .setDescription(config.ticketNoPermissions);

    try {
      if (
        !member.permissions.has(ManageChannels) &
        !member.roles.cache.has(docs.Handlers)
      )
        return interaction
          .reply({ embeds: [NoPermissions], ephemeral: true })
          .catch((error) => {
            return;
          });
      const menu = new UserSelectMenuBuilder()
        .setCustomId("ticket-manage-menu")
        .setPlaceholder(
          config.ticketManageMenuEmoji + config.ticketManageMenuTitle
        )
        .setMinValues(1)
        .setMaxValues(1);
      return interaction
        .reply({
          components: [new ActionRowBuilder().addComponents(menu)],
          ephemeral: true,
        })
        .catch((error) => {
          return;
        });
    } catch (error) {
      console.log(error);
      return;
    }
  },
};
