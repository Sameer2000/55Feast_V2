import mongoose from "mongoose";
import { db1Connection } from "../../database/db.js";

const employeeGuestSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    bookedDates: [
      {
        date: {
          type: String,
        },
        mealTaken: {
          type: Boolean,
          default: false,
        },
        bookedBy: {
          type: String,
        },
        bookedByEmail: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const nonEmployeeGuestSchema = new mongoose.Schema(
  {
    numberOfGuests: {
      type: Number,
      required: true,
    },
    bookedDates: [
      {
        date: {
          type: String,
        },
        mealTaken: {
          type: Boolean,
          default: false,
        },
        bookedBy: {
          type: String,
        },
        bookedByEmail: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const employeeGuestModel = db1Connection.model(
  "employeeGuest",
  employeeGuestSchema
);
const nonEmployeeGuestModel = db1Connection.model(
  "nonEmployeeGuest",
  nonEmployeeGuestSchema
);

export default { employeeGuestModel, nonEmployeeGuestModel };
