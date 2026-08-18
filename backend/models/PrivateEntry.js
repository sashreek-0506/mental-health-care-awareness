import mongoose from "mongoose";

const privateEntrySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 150,
      default: "Untitled Reflection",
    },
    content: {
      type: String,
      required: [true, "Entry content is required"],
      trim: true,
      maxlength: 5000,
    },
    tags: {
      type: [String],
      default: [],
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    // ML Encouragement object generated dynamically upon creation
    encouragement: {
      detectedMood: String,
      detectedContext: String,
      validation: String,
      strengthSpotlight: String,
      reframing: String,
      mantra: String,
    },
  },
  { timestamps: true }
);

privateEntrySchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("PrivateEntry", privateEntrySchema);
