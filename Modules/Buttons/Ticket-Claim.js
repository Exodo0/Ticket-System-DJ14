const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const TicketSetup = require("../Schemas/TicketSetup");
const TicketSchema = require("../Schemas/Ticket");
const config = require("../Triggers/Tickets.js");

module.exports = {
  id: "ticket-claim",
  description: "🔳 Ticket Claim",

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
      alreadyEmbed.setDescription(
        config.ticketAlreadyClaim + " <@" + data.ClaimedBy + ">."
      );
      if (data.Claimed == true)
        return interaction
          .reply({ embeds: [alreadyEmbed], ephemeral: true })
          .catch((error) => {
            return;
          });
      await TicketSchema.updateOne(
        { ChannelID: channel.id },
        { Claimed: true, ClaimedBy: member.id }
      );
      let lastinfos = channel;
      await channel
        .edit({
          name: config.ticketClaimEmoji + "・" + lastinfos.name,
          topic:
            lastinfos.topic +
            config.ticketDescriptionClaim +
            "<@" +
            member.id +
            ">.",
        })
        .catch((error) => {
          return;
        });
      executeEmbed.setDescription(
        config.ticketSuccessClaim + " <@" + member.id + ">."
      );
      interaction.deferUpdate().catch((error) => {
        return;
      });
      interaction.channel.send({ embeds: [executeEmbed] }).catch((error) => {
        return;
      });
    } catch (error) {
      console.error(error);
      return;
    }
  },
};
