const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const TicketSetup = require("../Schemas/TicketSetup");
const TicketSchema = require("../Schemas/Ticket");
const config = require("../Triggers/Tickets");

module.exports = {
  id: "ticket-unlock",
  description: "🔳 Ticket unlck",

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
    const executeEmbed = new EmbedBuilder().setColor("Aqua");
    const alreadyEmbed = new EmbedBuilder().setColor("Orange");
    const NoPermissions = new EmbedBuilder()
      .setColor("Red")
      .setDescription(config.ticketNoPermissions);

    try {
      const data = await TicketSchema.findOne({
        GuildID: guild.id,
        ChannelID: channel.id,
      });
      if (!data)
        return interaction
          .reply({
            embeds: [embed.setColor("Red").setDescription(config.ticketError)],
            ephemeral: true,
          })
          .catch((error) => {
            return;
          });

      if (
        !member.permissions.has(ManageChannels) &
        !member.roles.cache.has(docs.Handlers)
      )
        return interaction
          .reply({ embeds: [NoPermissions], ephemeral: true })
          .catch((error) => {
            return;
          });
      alreadyEmbed.setDescription(config.ticketAlreadyUnlocked);
      if (data.Locked == false)
        return interaction
          .reply({ embeds: [alreadyEmbed], ephemeral: true })
          .catch((error) => {
            return;
          });
      await TicketSchema.updateOne(
        { ChannelID: channel.id },
        { Locked: false }
      );
      executeEmbed.setDescription(config.ticketSuccessUnlocked);
      data.MembersID.forEach((m) => {
        channel.permissionOverwrites
          .edit(m, { SendMessages: true })
          .catch((error) => {
            return;
          });
      });
      channel.permissionOverwrites
        .edit(data.OwnerID, { SendMessages: true })
        .catch((error) => {
          return;
        });
      interaction.deferUpdate().catch((error) => {
        return;
      });
      return interaction.channel
        .send({ embeds: [executeEmbed] })
        .catch((error) => {
          return;
        });
    } catch (error) {
      console.log(error);
      return;
    }
  },
};
