import { Router } from "express";
import {
  all,
  create,
  update,
  get,
  remove
} from "../controllers/loads.controllers";

const router = Router();

router.get("/", all);
router.post("/", create);
router.patch("/:id", update);
router.get("/:id", get);
router.delete("/:id", remove);

export default router;
