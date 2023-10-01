import signup from "./signup.js";
import login from "./login.js";

export default function (app) {
  app.use("/signup", signup);
  app.use("/login", login);
  return app;
}
