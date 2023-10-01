import jwt from "jsonwebtoken";
import config from "../../../config";
import messageResponse from "./constants.js";

const createToken = (email, password) => {
  const token = jwt.sign({ email, password }, config.SECRET, {
    expiresIn: config.JWT_EXPIRY,
  });
  return token;
};

const jwtVerify = (token, secret) => {
  try {
    let result;
    jwt.verify(token, secret, (error, data) => {
      if (error) {
        return;
      }
      result = data;
    });
    return result;
  } catch (error) {
    console.log(messageResponse.ERROR_FETCHING_DATA);
  }
};

export default { createToken, jwtVerify };
