import express from "express";
import { signupController } from "../../controllers";

const router = express.Router();

router.post("/", signupController);

export default router;
