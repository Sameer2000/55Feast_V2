import config from "../../../../config";
import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils/index.js";
import SibApiV3Sdk from "sib-api-v3-sdk";
import { userPoolModel } from "../../models";

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
    const defaultClient = SibApiV3Sdk.ApiClient.instance;
    const apiKey = defaultClient.authentications["api-key"];
    apiKey.apiKey = config.EMAIL_API_KEY;
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.sender = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    sendSmtpEmail.subject = "Invitation to onboard 55Feast";
    sendSmtpEmail.replyTo = {
      email: config.SENDER_EMAIL,
      name: "55Feast",
    };
    const foundUser = await userPoolModel.findOne({ email });
    if (!foundUser) {
      return sendResponse(onError(404, messageResponse.NOT_EXIST), response);
    }
    sendSmtpEmail.to = [{ name: foundUser.fullName, email: email }];
    sendSmtpEmail.templateId = 3;
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail);
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

export default {
  getAllUsers,
  getUser,
  getJoinedUsers,
  insertUser,
  updateUserPool,
  deleteUser,
  getNotJoinedUsers,
  inviteUser,
};
