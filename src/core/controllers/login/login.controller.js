import { userModel } from "../../models";
import bcrypt from "bcryptjs";
import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
  jwt,
} from "../../utils";

const loginController = async (request, response) => {
  try {
    const { email, password } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const checker = bcrypt.compareSync(password, user["password"]);
    if (checker) {
      const token = jwt.createToken(email, password);
      return sendResponse(
        onSuccess(200, messageResponse.LOGIN_SUCCESSFULLY, {
          token,
          user,
        }),
        response
      );
    }
    return sendResponse(
      onError(401, messageResponse.INVALID_PASSWORD),
      response
    );
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

export default loginController;
