import mongoose from "mongoose";
import { db1Connection } from "../../database/db.js";

const missedCountSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    users: [
      {
        email: {
          type: String,
          required: true,
        },
        name: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const missedCount = db1Connection.model("MissedCount", missedCountSchema);

export default missedCount;
