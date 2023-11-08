import config from "../../../../config";
import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
  sendEmail,
  passwordUtils,
} from "../../utils/index.js";
import SibApiV3Sdk from "sib-api-v3-sdk";
import { userPoolModel, userModel, tokenModel } from "../../models";
import crypto from "crypto";

//Done
const getAllUsers = async (request, response) => {
  try {
    const { location } = request.query;
    const foundUsers = await userPoolModel.find({ location });
    return sendResponse(
      onSuccess(200, messageResponse.USERS_FOUND_SUCCESS, foundUsers),
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

//Done
const getUser = async (request, response) => {
  try {
    const { email } = request.body;
    const foundUser = await userPoolModel.findOne({ email });
    if (!foundUser) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.USER_FOUND, foundUser),
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

//Done
const getJoinedUsers = async (request, response) => {
  try {
    const { location } = request.query;
    // exclude this email in user list
    const { email } = request.body;
    const users = await userPoolModel.find({
      location,
      hasJoined: true,
      email: { $ne: email },
    });
    return sendResponse(
      onSuccess(200, messageResponse.USERS_FOUND_SUCCESS, users),
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

//Done
const insertUser = async (request, response) => {
  try {
    const { email, fullName, location } = request.body;
    const user = await userPoolModel.findOne({ email });
    if (user) {
      return sendResponse(onError(409, messageResponse.EMAIL_EXIST), response);
    }
    const newUser = new userPoolModel({
      fullName,
      email,
      location,
    });
    await newUser.save();
    return sendResponse(
      onSuccess(201, messageResponse.CREATED_SUCCESS, newUser),
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

//Done
const updateUserPool = async (request, response) => {
  try {
    const { email, fullName, location } = request.body;
    const user = await userPoolModel.findOneAndUpdate(
      { email },
      { fullName, location }
    );
    if (user) {
      await user.save();
      const updatedUser = await userPoolModel.findOne({ email });
      return sendResponse(
        onSuccess(200, messageResponse.USER_UPDATED_SUCCESS, updatedUser),
        response
      );
    }
    return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

//Done
const deleteUser = async (request, response) => {
  try {
    const { email } = request.query;
    const user = await userPoolModel.findOne({ email });
    updateUserPool;
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    await userPoolModel.deleteOne({ email });

    return sendResponse(
      onSuccess(200, messageResponse.USER_DELETED_SUCCESS),
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

//Done
const getNotJoinedUsers = async (request, response) => {
  try {
    const { location } = request.query;
    const { email } = request.body;
    const users = await userPoolModel.find({
      location,
      hasJoined: false,
      email: { $ne: email },
    });
    return sendResponse(
      onSuccess(200, messageResponse.USER_FOUND, users),
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

//Done
const inviteUser = async (request, response) => {
  try {
    const { email } = request.body;
    const foundUser = await userPoolModel.findOne({ email });
    if (!foundUser) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const res = sendEmail(
      messageResponse.INVITE_SUBJECT,
      foundUser.fullName,
      email,
      3
    );
    if (res.status === "failure") {
      return sendResponse(onError(400, res.message), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.INVITED_SUCCESS),
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

const forgotPassword = async (request, response) => {
  try {
    const user = await userModel.findOne({ email: request.body.email });
    if (!user)
      return sendResponse(onError(500, messageResponse.NOT_EXIST), response);

    let token = await tokenModel.findOne({ userId: user._id });
    if (!token) {
      token = await new tokenModel({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
    }
    const link = `${config.RESET_PASSWORD_URL}/password-reset/${user._id}/${token.token}`;
    const res = await sendEmail(
      messageResponse.FORGOT_PASS_SUBJECT,
      user.firstName,
      request.body.email,
      4,
      { url: link }
    );
    if (res.status === "failure") {
      return sendResponse(onError(400, res.message), response);
    }
    return sendResponse(
      onSuccess(200, messageResponse.MAIL_SENT_SUCCESS),
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

const updatePassword = async (request, response) => {
  try {
    const user = await userModel.findById(request.params.userId);
    if (!user)
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    const token = await tokenModel.findOne({
      userId: user._id,
      token: request.params.token,
    });
    if (!token)
      return sendResponse(onError(400, messageResponse.LINK_EXPIRED), response);

    const newHashedPassword = await passwordUtils.hashPassword(request.body.newPassword)
    const updatedUser = await userModel.findByIdAndUpdate(request.params.userId, {password: newHashedPassword}, { new: true })
    await token.delete();
    return sendResponse(
      onSuccess(200, messageResponse.PASSWORD_RESET_SUCCESS, updatedUser),
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

const checkPassword = async (request, response) => {
  try {
    const { email, oldPassword } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const validPassword = passwordUtils.validatePassword(user, oldPassword);
    if (validPassword) {
      return sendResponse(
        onSuccess(200, messageResponse.CORRECT_PASSWORD),
        response
      );
    }
    return sendResponse(onError(500, messageResponse.INVALID_PASSWORD), response);
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

const resetPassword = async (request, response) => {
  try {
    const {email, newPassword} = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    const newHashedPassword = await passwordUtils.hashPassword(newPassword)
    const updatedUser = await userModel.findOneAndUpdate({email}, {password: newHashedPassword}, { new: true })
    return sendResponse(
      onSuccess(200, messageResponse.PASSWORD_UPDATED, updatedUser),
      response
    );
  } catch (error) {
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

export default {
  getAllUsers,
  getUser,
  getJoinedUsers,
  insertUser,
  updateUserPool,
  deleteUser,
  getNotJoinedUsers,
  inviteUser,
  forgotPassword,
  updatePassword,
  checkPassword,
  resetPassword
};
