const {
  EmbedBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");
const TicketSchema = require("../Schemas/Ticket");
const TicketSetup = require("../Schemas/TicketSetup");
const config = require("../Triggers/Tickets");

module.exports = {
  id: "ticket-manage-menu",
  description: "🔳 Ticket Manage Menu",

  async execute(interaction, client) {
    const { guild, member, customId, channel } = interaction;
    const { ManageChannels, SendMessages } = PermissionFlagsBits;
    const docs = await TicketSetup.findOne({ GuildID: guild.id });
    if (!docs) return;
    const embed = new EmbedBuilder();
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

      const findMembers = await TicketSchema.findOne({
        GuildID: guild.id,
        ChannelID: channel.id,
        MembersID: interaction.values[0],
      });
      if (!findMembers) {
        data.MembersID.push(interaction.values[0]);
        channel.permissionOverwrites
          .edit(interaction.values[0], {
            SendMessages: true,
            ViewChannel: true,
            ReadMessageHistory: true,
          })
          .catch((error) => {
            return;
          });
        interaction.channel
          .send({
            embeds: [
              embed
                .setColor("Green")
                .setDescription(
                  "<@" +
                    interaction.values[0] +
                    ">" +
                    " " +
                    config.ticketMemberAdd
                ),
            ],
          })
          .catch((error) => {
            return;
          });
        data.save();
      } else {
        data.MembersID.remove(interaction.values[0]);
        channel.permissionOverwrites
          .delete(interaction.values[0])
          .catch((error) => {
            return;
          });
        interaction.channel
          .send({
            embeds: [
              embed
                .setColor("Green")
                .setDescription(
                  "<@" +
                    interaction.values[0] +
                    ">" +
                    " " +
                    config.ticketMemberRemove
                ),
            ],
          })
          .catch((error) => {
            return;
          });
        data.save();
      }
    } catch (error) {
      console.log(error);
    }
  },
};
