import express from "express";
import { loginController, userController } from "../../controllers/index.js";

const router = express.Router();

router.post("/login/", loginController);
router.post("/login/forgot-password", userController.forgotPassword);
router.post("/login/update-password/:userId/:token", userController.updatePassword);

export default router;
