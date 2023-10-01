import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils";
import { menuModel } from "../../models";

const addMenuItem = async (request, response) => {
  try {
    const { name, picture } = request.body;
    const newMenuItem = new menuModel({
      name,
      picture,
    });
    await newMenuItem.save();
    return sendResponse(
      onSuccess(201, messageResponse.MENU_ITEM_ADDED, newMenuItem),
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

const editMenuItem = async (request, response) => {
  try {
    const { id } = request.params;
    const { name, picture } = request.body;
    const updatedItem = await menuModel.findOneAndUpdate(
      { _id: id },
      { name, picture }
    );
    if (!updatedItem) {
      return sendResponse(
        onError(404, messageResponse.ITEM_NOT_FOUND),
        response
      );
    }
    await updatedItem.save();
    const menuItem = await menuModel.findOne({ _id: id });
    return sendResponse(
      onSuccess(200, messageResponse.MENU_ITEM_UPDATED, menuItem),
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

const deleteMenuItem = async (request, response) => {
  try {
    const { id } = request.params;
    const menuItem = await menuModel.findOne({ _id: id });
    if (!menuItem) {
      return sendResponse(
        onError(404, messageResponse.ITEM_NOT_FOUND),
        response
      );
    }
    await menuModel.deleteOne({ _id: id });
    return sendResponse(
      onSuccess(200, messageResponse.MENU_ITEM_DELETED_SUCCESS),
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

const getMenu = async (request, response) => {
  try {
    const menuItems = await menuModel.find({});
    return sendResponse(
      onSuccess(200, messageResponse.MENU_FETCHED, menuItems),
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

export default { addMenuItem, editMenuItem, deleteMenuItem, getMenu };
