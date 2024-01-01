import bookMeal from "./meal.js";
import user from "./user.js";
import menu from "./menu.js";

export default function (app) {
  app.use("/api", bookMeal);
  app.use("/api", user);
  app.use("/api", menu);
  return app;
}
