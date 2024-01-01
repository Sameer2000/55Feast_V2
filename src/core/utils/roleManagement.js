import messageResponse from "./constants.js";
import config from "../../../config/index.js";
import { userModel } from "../models/index.js";
import jwt from "./jwt.js";
import { onError, sendResponse } from "./response.js";

const isAdmin = (func) => {
  return async (request, response) => {
    const token = request.headers["authorization"].split(" ")[1];
    var decoded = jwt.jwtVerify(token, config.SECRET);
    const userIsAdmin = await userModel.findOne({ email: decoded.email });
    if (!userIsAdmin.isAdmin) {
      return sendResponse(onError(401, messageResponse.UNAUTHARIZED), response);
    }
    return func(request, response);
  };
};
export default isAdmin;
