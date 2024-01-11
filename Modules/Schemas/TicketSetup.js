const mongoose = require("mongoose");

const TicketSetup = new mongoose.Schema({
  GuildID: String,
  Channel: String,
  Category: String,
  Transcripts: String,
  Handlers: String,
  Everyone: String,
  Description: String,
  Button: String,
  Emoji: String,
  Image: String || null,
});

module.exports = mongoose.model("TicketSetup", TicketSetup);
