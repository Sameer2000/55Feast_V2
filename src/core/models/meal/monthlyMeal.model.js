import mongoose from "mongoose";
import { db1Connection } from "../../database/db.js";

const monthlyMealSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

const monthlyMealModel = db1Connection.model("MonthlyMeal", monthlyMealSchema);

export default monthlyMealModel;
