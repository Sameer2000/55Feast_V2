import express from "express";
import { db1Connection } from "../core/database/db.js";
import { db2Connection } from "../core/database/db.js";
import bodyParser from "body-parser";
import cors from "cors";
import morgan from "morgan";
import unauthorized from "../core/routes/unprotected/index.js";
import authorized from "../core/routes/protected/index.js";
import middleware from "../core/middleware/index.js";
import config from "../../config/index.js";

const app = express();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  cors({
    origin: "*",
  })
);
app.use(morgan("tiny"));
app.use(bodyParser.urlencoded({ extended: true }));

unauthorized(app);
middleware(app);
authorized(app);

app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`server running on port ${config.PORT}`);
});
