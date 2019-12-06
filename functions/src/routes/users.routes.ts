import { Router } from "express";
import { isAuthenticated } from "../common/authenticated";
import { isAuthorized } from "../common/authorized";
import {
  all,
  create,
  update,
  get,
  remove
} from "../controllers/users.controllers";

const router = Router();

router.get("/", isAuthenticated, isAuthorized({ hasRole: ["Admin"] }), all);
router.post("/", isAuthenticated, isAuthorized({ hasRole: ["Admin"] }), create);
router.get("/:id", isAuthenticated, isAuthorized({ hasRole: ["Admin"] }), get);
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin"] }),
  update
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin"] }),
  remove
);

export default router;
