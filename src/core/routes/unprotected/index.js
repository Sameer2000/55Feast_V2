import signup from "./signup.js";
import login from "./login.js";

export default function (app) {
  app.use("/api", signup);
  app.use("/api", login);
  return app;
}
