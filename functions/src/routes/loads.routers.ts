import { Router } from "express";
import { isAuthenticated } from "../common/authenticated";
import { isAuthorized } from "../common/authorized";
import {
  all,
  create,
  update,
  get,
  remove
} from "../controllers/loads.controllers";

const router = Router();

router.get("/", [
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin", "Driver"] }),
  all
]);
router.post("/", isAuthenticated, isAuthorized({ hasRole: ["Admin"] }), create);
router.patch(
  "/:id",
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin", "Driver"] }),
  update
);
router.get(
  "/:id",
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin", "Driver"] }),
  get
);
router.delete(
  "/:id",
  isAuthenticated,
  isAuthorized({ hasRole: ["Admin"] }),
  remove
);

export default router;
