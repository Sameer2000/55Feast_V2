import mongoose from "mongoose";
import { db2Connection } from "../../database/db.js";

const poolSchema = new mongoose.Schema({
  fullName: {
    type: String,
  },
  email: {
    type: String,
  },
  location: {
    type: String,
  },
  hasJoined: {
    type: Boolean,
    default: false,
  },
});

const userPoolModel = db2Connection.model("Userpool", poolSchema);

export default userPoolModel;
