import express from "express";
import { userController } from "../../controllers";
import { isAdmin } from "../../utils";
const router = express.Router();

router.get("/all", isAdmin(userController.getAllUsers));
router.get("/", isAdmin(userController.getUser));
router.post("/all/joined", userController.getJoinedUsers);
router.post("/insert", isAdmin(userController.insertUser));
router.patch("/update", isAdmin(userController.updateUserPool));
router.delete("/delete", isAdmin(userController.deleteUser));
router.post("/all/invite", isAdmin(userController.getNotJoinedUsers));
router.post("/invite", isAdmin(userController.inviteUser));

export default router;
