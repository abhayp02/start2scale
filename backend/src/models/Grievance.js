import mongoose from "mongoose";
const schema = new mongoose.Schema({
  pilotId: { type: mongoose.Schema.Types.ObjectId, ref: "Pilot", required: true },
  description: String,
  channel: { type: String, enum: ["self-online", "csc-assisted", "patwari-assisted", "ivr-call", "gram-sabha"], required: true },
  loggedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, enum: ["open", "resolved"], default: "open" },
});
export default mongoose.model("Grievance", schema);

