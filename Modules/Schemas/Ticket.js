const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  GuildID: String,
  OwnerID: String,
  MembersID: [String],
  TicketID: String,
  ChannelID: String,
  Locked: Boolean,
  Claimed: Boolean,
  ClaimedBy: String,
});

module.exports = mongoose.model("Ticket", TicketSchema);
