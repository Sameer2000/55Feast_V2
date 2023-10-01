import { menuController } from "../../controllers";
import { isAdmin } from "../../utils";
import express from "express";

const router = express.Router();

router.post("/", isAdmin(menuController.addMenuItem));
router.patch("/:id", isAdmin(menuController.editMenuItem));
router.delete("/:id", isAdmin(menuController.deleteMenuItem));
router.get("/all", menuController.getMenu);

export default router;
