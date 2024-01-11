const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  PermissionFlagsBits,
} = require("discord.js");
const TicketSetup = require("../../Modules/Schemas/TicketSetup");
const config = require("../../Modules/Triggers/Tickets");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ticket-setup")
    .setDescription("📂 Configure the Ticket System.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("📂 Channel where Tickets will be created.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("category")
        .setDescription("📂 Category where Tickets will be created.")
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(true)
    )
    .addChannelOption((option) =>
      option
        .setName("transcripts")
        .setDescription("📂 Channel where Tickets will be saved.")
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("everyone")
        .setDescription("📂 Role that can view Tickets.")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option
        .setName("handlers")
        .setDescription("📂 Role that can handle Tickets.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("📂 Ticket description.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("button")
        .setDescription("📂 Add a name to the button.")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("📂 Add an emoji to the button.")
        .setRequired(true)
    )
    .addAttachmentOption((option) =>
      option
        .setName("image")
        .setDescription("📂 Add an image to the Ticket. (optional)")
    ),

  /**
   * @param {ChatInputCommandInteraction} interaction
   * @param {Client} client
   */

  async execute(interaction, client) {
    const { guild, options } = interaction;
    try {
      const channel = options.getChannel("channel");
      const category = options.getChannel("category");
      const transcripts = options.getChannel("transcripts");
      const everyone = options.getRole("everyone");
      const description = options.getString("description");
      const button = options.getString("button");
      const handlers = options.getRole("handlers");
      const emoji = options.getString("emoji");
      const image = options.getAttachment("image");

      const data = await TicketSetup.findOne({ Guild: guild.id });
      if (data) {
        await TicketSetup.findOneAndUpdate({
          GuildID: interaction.guild.id,
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Handlers: handlers.id,
          Everyone: everyone.id,
          Description: description,
          Button: button,
          Emoji: emoji,
          Image: image?.url || null,
        });
      } else {
        const newData = new TicketSetup({
          GuildID: interaction.guild.id,
          Channel: channel.id,
          Category: category.id,
          Transcripts: transcripts.id,
          Handlers: handlers.id,
          Everyone: everyone.id,
          Description: description,
          Button: button,
          Emoji: emoji,
          Image: image?.url || null,
        });
        newData.save();
      }

      const Embed = new EmbedBuilder()
        .setDescription(description)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setImage(image?.url || null)
        .setColor("Aqua");
      const ShowButtons = new ButtonBuilder()
        .setCustomId(button)
        .setLabel(button)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Primary);

      await guild.channels.cache.get(channel.id).send({
        embeds: [Embed],
        components: [new ActionRowBuilder().addComponents(ShowButtons)],
      });
      return interaction.reply({
        embeds: [
          new EmbedBuilder().setTitle("📂 Ticket System configured.").setFields(
            { name: "📂 Channel:", value: `<#${channel.id}>`, inline: true },
            {
              name: "📂 Category:",
              value: `<#${category.id}>`,
              inline: true,
            },
            {
              name: "📂 Transcripts:",
              value: `<#${transcripts.id}>`,
              inline: true,
            },
            {
              name: "📂 Members Role:",
              value: `<@&${everyone.id}>`,
              inline: true,
            },
            {
              name: "📂 Ticket Handlers Role:",
              value: `<@&${handlers.id}>`,
              inline: true,
            },
            { name: "📂 Description:", value: description, inline: true },
            { name: "📂 Button:", value: button, inline: true },
            { name: "📂 Emoji:", value: emoji, inline: true }
          ),
        ],
        ephemeral: true,
      });
    } catch (error) {
      console.error(error);
    }
  },
};
