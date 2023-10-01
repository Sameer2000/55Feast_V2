import messageResponse from "./constants";
import config from "../../../config";
import { userModel } from "../models";
import jwt from "./jwt";
import { onError, sendResponse } from "./response";

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
