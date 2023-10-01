import mongoose from "mongoose";
import { db1Connection } from "../../database/db.js";

const menuSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const menuModel = db1Connection.model("Menu", menuSchema);

export default menuModel;
