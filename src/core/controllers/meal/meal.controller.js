import {
  onError,
  onSuccess,
  sendResponse,
  messageResponse,
  globalCatch,
} from "../../utils";
import {
  guestModel,
  mealModel,
  missedCount,
  userModel,
  userPoolModel,
} from "../../models";

//Done
const mealBookFucntion = async (email, date, bookedBy) => {
  try {
    let meal = await mealModel.mealModel.findOne({ email: email });
    const bookedByUser = await userModel.findOne({ email: bookedBy });
    if (!meal) {
      meal = new mealModel.mealModel({
        email,
        bookedDates: [
          {
            date: date,
            bookedBy: `${bookedByUser.firstName} ${bookedByUser.lastName}`,
            bookedByEmail: bookedBy,
          },
        ],
      });
    } else {
      if (meal.bookedDates.some((ele) => ele.date === date)) {
        return { message: messageResponse.MEAL_ALREADY_BOOKED };
      }
      const currentMonth = new Date(date).getMonth() + 1;
      const firstDateMonth = new Date(meal.bookedDates[0].date).getMonth() + 1;
      if (
        currentMonth - firstDateMonth >= 2 ||
        currentMonth - firstDateMonth == -10
      ) {
        meal.bookedDates = meal.bookedDates.filter((element) => {
          const currDate = new Date(element.date);
          const currMonth = currDate.getMonth() + 1;
          return currMonth != firstDateMonth;
        });
      }
      meal.bookedDates.push({
        date: date,
        mealTaken: false,
        bookedBy: `${bookedByUser.firstName} ${bookedByUser.lastName}`,
        bookedByEmail: bookedBy,
      });
    }
    await meal.save();
    return meal;
  } catch (error) {
    console.log(error.message);
  }
};

//Done
const bookYourMeal = async (request, response) => {
  try {
    const { email, date, bookedBy } = request.body;
    if (!email || !date || !bookedBy) {
      return sendResponse(onError(400, messageResponse.BAD_REQUEST), response);
    }
    const meal = await mealBookFucntion(email, date, bookedBy);
    if (meal?.message === messageResponse.MEAL_ALREADY_BOOKED) {
      return sendResponse(
        onError(409, messageResponse.MEAL_ALREADY_BOOKED),
        response
      );
    }
    return sendResponse(
      onSuccess(201, messageResponse.MEAL_BOOKED, meal),
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
const bookMultipleMeals = async (request, response) => {
  try {
    const { email, dates, bookedBy } = request.body;
    const data = dates.map(async (date) => {
      const meal = await mealBookFucntion(email, date, bookedBy);
      if (meal?.message === messageResponse.MEAL_ALREADY_BOOKED) {
        return sendResponse(
          onError(409, messageResponse.MEAL_ALREADY_BOOKED),
          response
        );
      }
      return meal;
    });
    const bookedArray = await Promise.all(await data);
    const mealResult = await mealModel.mealModel.findOne({ email });
    return sendResponse(
      onSuccess(201, messageResponse.MEAL_BOOKED, mealResult),
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
const cancelMeal = async (request, response) => {
  try {
    const { email, date } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    const mealFound = await mealModel.mealModel.findOne({ email: user.email });
    if (!mealFound) {
      return sendResponse(
        onError(404, messageResponse.MEAL_NOT_BOOKED),
        response
      );
    }
    if (mealFound.bookedDates.some((ele) => ele.date === date)) {
      const index = mealFound.bookedDates.findIndex(
        (item) => item.date === date
      );
      mealFound.bookedDates.splice(index, 1);
      await mealFound.save();
      return sendResponse(
        onSuccess(200, messageResponse.COUNT_CANCELLED, mealFound),
        response
      );
    }
    return sendResponse(
      onError(404, messageResponse.MEAL_NOT_BOOKED, mealFound),
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
const updateMealStatus = async (request, response) => {
  try {
    const { email, date } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    const updatedMeal = await mealModel.mealModel.findOneAndUpdate(
      {
        email: email,
        "bookedDates.date": date,
      },
      {
        $set: {
          "bookedDates.$.mealTaken": true,
        },
      },
      { new: true }
    );
    if (!updatedMeal) {
      return sendResponse(
        onError(404, messageResponse.MEAL_NOT_BOOKED),
        response
      );
    }
    return sendResponse(
      onSuccess(200, messageResponse.MEAL_UPDATED, updatedMeal),
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
const getCountsOfUser = async (request, response) => {
  try {
    const { email } = request.query;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    const mealFound = await mealModel.mealModel.findOne({ email: user.email });
    if (!mealFound) {
      const newMealEntity = new mealModel.mealModel({
        email,
        bookedDates: [{}],
      });
      await newMealEntity.save();
      return sendResponse(
        onSuccess(200, messageResponse.BOOK_YOUR_FIRST_MEAL, newMealEntity),
        response
      );
    }
    return sendResponse(
      onSuccess(
        200,
        messageResponse.DATE_FETCHED_SUCCESS,
        mealFound.bookedDates
      ),
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
const getAllCountOfDate = async (request, response) => {
  try {
    const { date } = request.body;
    const { location } = request.query;
    const foundUsers = await mealModel.mealModel.find({
      bookedDates: { $elemMatch: { date: date } },
    });
    const users = foundUsers.map(async (element) => {
      const foundUser = await userPoolModel.findOne({ email: element.email });
      return {
        id: foundUser._id,
        fullName: foundUser.fullName,
        email: element.email,
        location: foundUser.location,
      };
    });
    const foundGuests = await guestModel.find({
      bookedDates: { $elemMatch: { date: date } },
    });
    const guests = foundGuests.map(async (element) => {
      if (element.email === messageResponse.GUEST_EMAIL) {
        return {
          id: element._id,
          fullName: messageResponse.GUEST_EMAIL,
          email: messageResponse.GUEST_EMAIL,
          location: element.location,
        };
      } else {
        const foundUser = await userPoolModel.findOne({ email: element.email });
        return {
          id: element._id,
          fullName: foundUser.fullName,
          email: element.email,
          location: element.location,
        };
      }
    });
    const res1 = await Promise.all(users);
    const res2 = await Promise.all(guests);
    const result = res1.concat(res2);
    const count = result.filter((user) => user.location === `${location}`);
    return sendResponse(
      onSuccess(200, messageResponse.DATE_FETCHED_SUCCESS, count),
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
const getLastFiveCounts = async (request, response) => {
  try {
    const { location } = request.query;
    const lastFiveDay = [];
    const currentDate = new Date();
    for (let i = 1; lastFiveDay.length < 5; i++) {
      const day = new Date(currentDate);
      day.setDate(day.getDate() - i);
      if (day.getDay() !== 6 && day.getDay() !== 0) {
        lastFiveDay.push(day.toISOString().split("T")[0]);
      }
    }
    const lastFiveDayCounts = lastFiveDay.map(async (element) => {
      return {
        count: await getCounts(element, location),
        date: element,
        day: getDayByDate(element),
      };
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.COUNTS_FETCHED_SUCCESS,
        await Promise.all(lastFiveDayCounts.reverse())
      ),
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
const getDayByDate = (dateToBeUsed) => {
  const date = new Date(dateToBeUsed);
  const options = { weekday: "long" };
  const dayName = date.toLocaleDateString("en-US", options);
  return dayName;
};

//Done
const getCounts = async (date, location) => {
  const foundUsers = await mealModel.mealModel.find({
    bookedDates: { $elemMatch: { date: date } },
  });
  const users = foundUsers.map(async (element) => {
    const foundUser = await userPoolModel.findOne({ email: element.email });
    return { email: element.email, location: foundUser.location };
  });
  const foundGuests = await guestModel.find({
    bookedDates: { $elemMatch: { date: date } },
  });
  const guests = foundGuests.map((element) => {
    return {
      email: element.email,
      location: element.location,
    };
  });
  const res1 = await Promise.all(users);
  const result = res1.concat(guests);
  const count = result.filter((user) => user.location === `${location}`);
  return count.length;
};

//Done
const cancelAllMealsOfDate = async (request, response) => {
  try {
    const { date } = request.query;
    const foundUsers = await mealModel.mealModel.find({
      bookedDates: { $elemMatch: { date: date } },
    });
    foundUsers.map(async (element) => {
      if (element.bookedDates.some((ele) => ele.date === date)) {
        const index = element.bookedDates.findIndex(
          (item) => item.date === date
        );
        element.bookedDates.splice(index, 1);
        await element.save();
      }
    });
    return sendResponse(
      onSuccess(200, messageResponse.COUNTS_DELETED_SUCCESS),
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
const getTodayNotCountedUsers = async (request, response) => {
  try {
    const today = new Date();
    const day = new Date(today);
    const date = day.toISOString().split("T")[0];
    const foundUsers = await mealModel.mealModel.find({
      "bookedDates.date": { $ne: date },
    });
    const users = foundUsers.map(async (element) => {
      const foundUser = await userPoolModel.findOne({ email: element.email });
      return { fullName: foundUser.fullName, email: element.email };
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.DATE_FETCHED_SUCCESS,
        await Promise.all(await users)
      ),
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
const getMonthlyCounts = async (request, response) => {
  try {
    const { location } = request.query;
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastMonthEndDate = new Date(
      lastMonth.getFullYear(),
      lastMonth.getMonth() + 1,
      0
    );
    const datesOfLastMonth = [];
    for (let i = lastMonth.getDate(); i <= lastMonthEndDate.getDate(); i++) {
      const year = lastMonth.getFullYear();
      const month =
        lastMonth.getMonth() + 1 <= 9
          ? `0${lastMonth.getMonth() + 1}`
          : lastMonth.getMonth() + 1;
      const day = i <= 9 ? `0${i}` : i;
      const formattedDate = `${year}-${month}-${day}`;
      const weekDay = new Date(formattedDate).getDay();
      if (weekDay !== 6 && weekDay !== 0) {
        datesOfLastMonth.push(`${year}-${month}-${day}`);
      }
    }
    const lastMonthCounts = datesOfLastMonth.map(async (element) => {
      const result = {
        count: await getCounts(element, location),
        date: element,
        day: getDayByDate(element),
      };
      const newMonthlyMeal = new mealModel.monthlyMealModel(result);
      await newMonthlyMeal.save();
      return result;
    });
    return sendResponse(
      onSuccess(
        200,
        messageResponse.COUNTS_FETCHED_SUCCESS,
        await Promise.all(lastMonthCounts)
      ),
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
const handleMissedCount = async (request, response) => {
  try {
    const { date, email } = request.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return sendResponse(onError(400, messageResponse.INVALID_USER), response);
    }
    let missedCountEntity = await missedCount.findOne({ date });
    if (!missedCountEntity) {
      missedCountEntity = new missedCount({
        date,
        users: [{ email, name: `${user.firstName} ${user.lastName}` }],
      });
    } else {
      missedCountEntity.users.push({
        email,
        name: `${user.firstName} ${user.lastName}`,
      });
    }
    await missedCountEntity.save();
    return sendResponse(
      onSuccess(200, messageResponse.NOTIFIED_MISSED_COUNT, missedCountEntity),
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

const getMissedCounts = async (request, response) => {
  try {
    const { date } = request.query;
    let countsMissed = await missedCount.findOne({ date });
    if (!countsMissed) {
      countsMissed = new missedCount({
        date,
        users: [],
      });
      await countsMissed.save();
    }
    return sendResponse(
      onSuccess(200, messageResponse.MISSED_COUNTS_FETCHED, countsMissed),
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

const bookForGuest = async (request, response) => {
  try {
    const { guestType, location } = request.query;
    const { email: bookedByEmail } = request.user;
    const bookedByUser = await userModel.findOne({ email: bookedByEmail });
    let guest;
    if (guestType === "employee") {
      const { email, dates } = request.body;
      const employee = await userPoolModel.findOne({ email });
      if (!employee) {
        return sendResponse(
          onError(404, messageResponse.EMPLOYEE_NOT_FOUND),
          response
        );
      }
      guest = await guestModel.findOne({ email, location });
      if (guest) {
        dates.map((date) => {
          guest.bookedDates.push({
            date: date,
            bookedBy: `${bookedByUser.firstName} ${bookedByUser.lastName}`,
            bookedByEmail,
          });
        });
      } else {
        const bookedDates = dates.map((date) => {
          return {
            date: date,
            bookedBy: `${bookedByUser.firstName} ${bookedByUser.lastName}`,
            bookedByEmail,
          };
        });
        guest = new guestModel({
          email,
          location,
          bookedDates,
        });
      }
      await guest.save();
    } else if (guestType === "nonEmployee") {
      const { count, dates } = request.body;
      const bookedDates = dates.map((date) => {
        return {
          date: date,
          bookedBy: `${bookedByUser.firstName} ${bookedByUser.lastName}`,
          bookedByEmail,
        };
      });
      for (let i = 0; i < count; i++) {
        guest = new guestModel({
          email: messageResponse.GUEST_EMAIL,
          location,
          bookedDates,
        });
        await guest.save();
      }
    }
    return sendResponse(
      onSuccess(200, messageResponse.MEAL_BOOKED_FOR_GUESTS, guest),
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

const cancelGuestMeal = async (request, response) => {
  try {
    const { guestType, location } = request.query;
    if (guestType === "employee") {
      const { email, date } = request.body;
      const employee = await userPoolModel.findOne({ email });
      if (!employee) {
        return sendResponse(
          onError(404, messageResponse.EMPLOYEE_NOT_FOUND),
          response
        );
      }
      const mealFound = await guestModel.findOne({ email, location });
      if (!mealFound) {
        return sendResponse(
          onError(404, messageResponse.MEAL_NOT_BOOKED),
          response
        );
      }
      if (mealFound.bookedDates.some((ele) => ele.date === date)) {
        const index = mealFound.bookedDates.findIndex(
          (item) => item.date === date
        );
        mealFound.bookedDates.splice(index, 1);
        await mealFound.save();
        return sendResponse(
          onSuccess(200, messageResponse.COUNT_CANCELLED, mealFound),
          response
        );
      }
      return sendResponse(
        onError(404, messageResponse.MEAL_NOT_BOOKED, mealFound),
        response
      );
    } else if (guestType === "nonEmployee") {
      const { guestId, date } = request.body;
      const guest = await guestModel.findOne({ _id: guestId, location });
      if (!guest) {
        return sendResponse(
          onError(404, messageResponse.GUEST_NOT_FOUND),
          response
        );
      }
      if (guest.bookedDates.some((ele) => ele.date === date)) {
        const index = guest.bookedDates.findIndex((item) => item.date === date);
        guest.bookedDates.splice(index, 1);
        await guest.save();
        return sendResponse(
          onSuccess(200, messageResponse.COUNT_CANCELLED, guest),
          response
        );
      }
      return sendResponse(
        onError(404, messageResponse.MEAL_NOT_BOOKED, guest),
        response
      );
    }
  } catch (error) {
    globalCatch(request, error);
    return sendResponse(
      onError(500, messageResponse.ERROR_FETCHING_DATA),
      response
    );
  }
};

export default {
  bookYourMeal,
  bookMultipleMeals,
  cancelMeal,
  getCountsOfUser,
  getAllCountOfDate,
  getLastFiveCounts,
  cancelAllMealsOfDate,
  getTodayNotCountedUsers,
  getMonthlyCounts,
  updateMealStatus,
  handleMissedCount,
  getMissedCounts,
  bookForGuest,
  cancelGuestMeal,
};
