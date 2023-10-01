import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const SECRET = process.env.SECRET;
const JWT_EXPIRY = 2592000;
const EMAIL_API_KEY = process.env.EMAIL_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL;
const PORT = process.env.PORT;
const USERPOOL_MONGO_URI = process.env.USERPOOL_MONGO_URI;

export default {
  MONGO_URI,
  SECRET,
  JWT_EXPIRY,
  EMAIL_API_KEY,
  SENDER_EMAIL,
  PORT,
  USERPOOL_MONGO_URI,
};
