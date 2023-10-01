import bookMeal from "./meal.js";
import user from "./user.js";
import menu from "./menu.js";

export default function (app) {
  app.use("/bookmeal", bookMeal);
  app.use("/user", user);
  app.use("/menu", menu);
  return app;
}
