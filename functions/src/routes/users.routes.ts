import { Router } from "express";
import { all, create } from "../controllers/users.controllers";

const router = Router();

router.get("/", all);
router.post("/", create);

export default router;
