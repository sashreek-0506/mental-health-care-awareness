import mongoose from "mongoose";

export const MOODS = [
  "happy",
  "calm",
  "okay",
  "tired",
  "unmotivated",
  "anxious",
  "stressed",
  "overwhelmed",
  "sad",
  "angry",
];

const moodEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mood: {
      type: String,
      enum: MOODS,
      required: true,
    },
    intensity: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },
    note: {
      type: String,
      maxlength: 1000,
      trim: true,
      default: "",
    },
    context: {
      type: [String],
      default: [],
      // free-form tags the student can attach, e.g. "exams", "sleep", "family"
    },
  },
  { timestamps: true }
);

moodEntrySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("MoodEntry", moodEntrySchema);
