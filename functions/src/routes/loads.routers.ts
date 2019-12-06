import { Router } from "express";
import { all, create } from "../controllers/loads.controllers";

const router = Router();

router.get("/", all);
router.post("/", create);

export default router;
