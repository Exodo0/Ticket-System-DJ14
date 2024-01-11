const {
  ChannelType,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const TicketSchema = require("../Modules/Schemas/Ticket");
const TicketSetup = require("../Modules/Schemas/TicketSetup");
const config = require("../Modules/Triggers/Tickets");

module.exports = {
  name: "interactionCreate",
  description: "📂 Ticket interactions.",
  async execute(interaction) {
    const { guild, member, customId, channel } = interaction;
    const { ViewChannel, SendMessages, ManageChannels, ReadMessageHistory } =
      PermissionFlagsBits;
    const TicketID = Math.floor(Math.random() * 9000) + 1000;
    if (!interaction.isButton()) return;
    const TicketData = await TicketSetup.findOne({ GuildID: guild.id });
    if (!TicketData || !TicketData.Button.includes(customId)) return;

    const alreadyTicket = new EmbedBuilder()
      .setDescription(config.ticketAlreadyExist)
      .setColor("Red")
      .setTimestamp();
    const findTicket = await TicketSchema.findOne({
      GuildID: guild.id,
      OwnerID: member.id,
    });
    if (findTicket)
      return interaction.reply({ embeds: [alreadyTicket], ephemeral: true });

    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("I don't have permission to create channels.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });

    const ticketMessage = new EmbedBuilder()
      .setDescription(config.ticketCreate + ` <#${channel.id}>`)
      .setColor("Green")
      .setTimestamp();

    try {
      const newChannel = await guild.channels.create({
        name: config.ticketName + TicketID,
        type: ChannelType.GuildText,
        parent: TicketData.Category,
        permissionOverwrites: [
          {
            id: TicketData.Everyone,
            deny: [ViewChannel, SendMessages, ReadMessageHistory],
          },
          {
            id: TicketData.Handlers,
            allow: [
              ViewChannel,
              SendMessages,
              ReadMessageHistory,
              ManageChannels,
            ],
          },
          {
            id: member.id,
            allow: [ViewChannel, SendMessages, ReadMessageHistory],
          },
        ],
      });

      await TicketSchema.create({
        GuildID: guild.id,
        OwnerID: member.id,
        MemberID: member.id,
        TicketID: TicketID,
        ChannelID: newChannel.id,
        Locked: false,
        Claimed: false,
      });

      await newChannel.setTopic(`${config.ticketDescription} <@${member.id}>`);

      const embed = new EmbedBuilder()
        .setTitle(config.ticketMessageTitle)
        .setDescription(config.ticketMessageDescription);

      const button = new ActionRowBuilder().setComponents(
        new ButtonBuilder()
          .setCustomId("ticket-close")
          .setLabel(config.ticketClose)
          .setStyle(ButtonStyle.Danger)
          .setEmoji(config.ticketCloseEmoji),
        new ButtonBuilder()
          .setCustomId("ticket-lock")
          .setLabel(config.ticketLock)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(config.ticketLockEmoji),
        new ButtonBuilder()
          .setCustomId("ticket-unlock")
          .setLabel(config.ticketUnlock)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(config.ticketUnlockEmoji),
        new ButtonBuilder()
          .setCustomId("ticket-manage")
          .setLabel(config.ticketManage)
          .setStyle(ButtonStyle.Secondary)
          .setEmoji(config.ticketManageEmoji),
        new ButtonBuilder()
          .setCustomId("ticket-claim")
          .setLabel(config.ticketClaim)
          .setStyle(ButtonStyle.Primary)
          .setEmoji(config.ticketClaimEmoji)
      );

      await newChannel.send({ embeds: [embed], components: [button] });

      const handlersMention = await newChannel.send({
        content: `<@&${TicketData.Handlers}>`,
      });
      handlersMention.delete();

      interaction.reply({ embeds: [ticketMessage], ephemeral: true });
    } catch (err) {
      console.error(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription("An error occurred while creating the channel.")
            .setTimestamp(),
        ],
        ephemeral: true,
      });
    }
  },
};
