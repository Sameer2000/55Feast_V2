import express from "express";
import { loginController, userController } from "../../controllers";

const router = express.Router();

router.post("/", loginController);
router.post("/forgot-password", userController.forgotPassword);
router.post("/update-password", userController.updatePassword);

export default router;
