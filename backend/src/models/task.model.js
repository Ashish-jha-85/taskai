import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    input: {
      type: String,
      required: true,
    },
    operation: {
      type: String,
      enum: [
        "uppercase",
        "lowercase",
        "reverse",
        "wordcount",
      ],
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "running",
        "success",
        "failed",
      ],
      default: "pending",
    },
    result: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    logs: [
      {
        message: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexing Strategy

taskSchema.index({ status: 1 });
taskSchema.index({ userId: 1 });
taskSchema.index({ createdAt: -1 });

export const Task = mongoose.model("Task", taskSchema);