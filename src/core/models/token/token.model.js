import mongoose from "mongoose";
const Schema = mongoose.Schema;
import { db1Connection } from "../../database/db.js";


const tokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    token: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600,
    },
});

const tokenModel = db1Connection.model("Token", tokenSchema);

export default tokenModel;
