import { Router } from "express";
import { all, create, update, get } from "../controllers/users.controllers";

const router = Router();

router.post("/", create);
router.get("/", all);
router.get("/:id", get);
router.patch("/:id", update);

export default router;
