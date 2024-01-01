import { menuController } from "../../controllers/index.js";
import { isAdmin } from "../../utils/index.js";
import express from "express";

const router = express.Router();

router.post("/menu", isAdmin(menuController.addMenuItem));
router.patch("/menu/:id", isAdmin(menuController.editMenuItem));
router.delete("/menu/:id", isAdmin(menuController.deleteMenuItem));
router.get("/menu/all", menuController.getMenu);

export default router;
