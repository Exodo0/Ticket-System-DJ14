const { EmbedBuilder, PermissionFlagsBits } = require("discord.js");
const { createTranscript } = require("discord-html-transcripts");
const TicketSetup = require("../Schemas/TicketSetup");
const TicketSchema = require("../Schemas/Ticket");
const config = require("../Triggers/Tickets");

module.exports = {
  id: "ticket-close",
  description: "🔳 Ticket Close",

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

      await guild.members.cache.get(data.MembersID);
      await guild.members.cache.get(data.OwnerID);

      if (
        !member.permissions.has(ManageChannels) &
        !member.roles.cache.has(docs.Handlers)
      )
        return interaction
          .reply({ embeds: [NoPermissions], ephemeral: true })
          .catch((error) => {
            console.log(error);
            return;
          });

      const transcript = await createTranscript(channel, {
        limit: -1,
        returnType: "attachment",
        saveImages: true,
        poweredBy: false,
        filename: config.ticketName + data.TicketID + ".html",
      }).catch((error) => {
        return;
      });

      let claimed = undefined;

      if (data.Claimed === true) {
        claimed = "✅";
      }

      if (data.Claimed === false) {
        claimed = "❌";
      }

      if (data.ClaimedBy === undefined) {
        data.ClaimedBy = "❌";
      } else {
        data.ClaimedBy = "<@" + data.ClaimedBy + ">";
      }

      const transcriptTimestamp = Math.round(Date.now() / 1000);
      const transcriptEmbed = new EmbedBuilder().setDescription(
        `${config.ticketTranscriptMember} <@${data.OwnerID}>\n${config.ticketTranscriptTicket} ${data.TicketID}\n${config.ticketTranscriptClaimed} ${claimed}\n${config.ticketTranscriptModerator} ${data.ClaimedBy}\n${config.ticketTranscriptTime} <t:${transcriptTimestamp}:R> (<t:${transcriptTimestamp}:F>)`
      );

      const closingTicket = new EmbedBuilder()
        .setTitle(config.ticketCloseTitle)
        .setDescription(config.ticketCloseDescription)
        .setColor("Red");

      await guild.channels.cache
        .get(docs.Transcripts)
        .send({
          embeds: [transcriptEmbed],
          files: [transcript],
        })
        .catch((error) => {
          return;
        });

      interaction.deferUpdate().catch((error) => {
        return;
      });

      channel.send({ embeds: [closingTicket] }).catch((error) => {
        return;
      });

      await TicketSchema.findOneAndDelete({
        GuildID: guild.id,
        ChannelID: channel.id,
      });

      setTimeout(() => {
        channel.delete().catch((error) => {
          return;
        });
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  },
};
