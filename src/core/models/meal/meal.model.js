import mongoose from "mongoose";
import { db1Connection } from "../../database/db.js";

const mealSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    bookedDates: [
      {
        date: {
          type: String,
          required: true,
        },
        mealTaken: {
          type: Boolean,
          default: false,
        },
        bookedBy: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const mealModel = db1Connection.model("Meal", mealSchema);

export default mealModel;
