import mongoose from "mongoose";
import config from "../../../config";

export const db1Connection = mongoose.createConnection(config.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const db2Connection = mongoose.createConnection(config.USERPOOL_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db1Connection.on("connected", () => {
  console.log("Connected to database1");
});

db1Connection.on("error", (err) => {
  console.error("Connection error to database1:", err);
});

db1Connection.on("disconnected", () => {
  console.log("Disconnected from database1");
});

db2Connection.on("connected", () => {
  console.log("Connected to database2");
});

db2Connection.on("error", (err) => {
  console.error("Connection error to database2:", err);
});

db2Connection.on("disconnected", () => {
  console.log("Disconnected from database2");
});

