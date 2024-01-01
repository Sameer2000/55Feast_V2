import express from "express";
import { userController } from "../../controllers/index.js";
import { isAdmin } from "../../utils/index.js";
const router = express.Router();

router.get("/user/all", isAdmin(userController.getAllUsers));
router.get("/user", isAdmin(userController.getUser));
router.post("/user/all/joined", userController.getJoinedUsers);
router.post("/user/insert", isAdmin(userController.insertUser));
router.patch("/user/update", isAdmin(userController.updateUserPool));
router.delete("/user/delete", isAdmin(userController.deleteUser));
router.post("/user/all/invite", isAdmin(userController.getNotJoinedUsers));
router.post("/user/invite", isAdmin(userController.inviteUser));
router.post("/user/check-password", userController.checkPassword);
router.post("/user/reset-password", userController.resetPassword);

export default router;
