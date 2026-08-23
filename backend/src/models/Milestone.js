import mongoose from "mongoose";
const schema = new mongoose.Schema({
  pilotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pilot",
    required: true,
  },
  title: String,
  dueDate: Date,
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "verified"],
    default: "pending",
  },
  paymentAmount: Number,
  paymentDue: { type: Boolean, default: false },
  paymentStatus: {
    type: String,
    enum: ["not-due", "due", "released"],
    default: "not-due",
  },
});
export default mongoose.model("Milestone", schema);
