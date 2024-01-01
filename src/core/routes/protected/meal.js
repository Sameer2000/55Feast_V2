import express from "express";
import { mealController } from "../../controllers/index.js";
import { isAdmin } from "../../utils/index.js";

const router = express.Router();

router.post("/bookmeal/me", mealController.bookYourMeal);
router.post("/bookmeal/multiple", mealController.bookMultipleMeals);
router.patch("/bookmeal/update", mealController.updateMealStatus);
router.delete("/bookmeal/me/delete", mealController.cancelMeal);
router.get("/bookmeal/me/counts", mealController.getCountsOfUser);
router.post("/bookmeal/date/count", isAdmin(mealController.getAllCountOfDate));
router.get("/bookmeal/week/count", isAdmin(mealController.getLastFiveCounts));
router.get("/bookmeal/month/count", isAdmin(mealController.getMonthlyCounts));
router.get(
  "/bookmeal/today/not_counted",
  isAdmin(mealController.getTodayNotCountedUsers)
);
router.delete("/bookmeal/cancel", isAdmin(mealController.cancelAllMealsOfDate));
router.post("/bookmeal/count-missed", mealController.handleMissedCount);
router.get("/bookmeal/missed-counts", isAdmin(mealController.getMissedCounts));
router.post("/bookmeal/guest", isAdmin(mealController.bookForGuest));
router.delete("/bookmeal/cancel/guest", isAdmin(mealController.cancelGuestMeal));

export default router;
