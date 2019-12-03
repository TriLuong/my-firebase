import { Router } from "express";
import * as swaggerJsdoc from "swagger-jsdoc";
import * as swaggerUi from "swagger-ui-express";

const router = Router();

const isDev = process.env.NODE_ENV === "dev";
const host = isDev
  ? "http://localhost:5001/my-firebase-a2772/us-central1/main"
  : "https://cms-my-firebase.web.app";

const path = __dirname + "/*.yaml";

const swaggerDefinition = {
  openAPI: "1.0.0",
  swagger: "2.0",
  info: {
    title: "API for my-firebse",
    version: "1.0.0",
    description: "Rest API for my-firebase"
  },
  schemes: isDev ? ["http", "https"] : ["https", "http"],
  host
};
const options = {
  swaggerDefinition,
  apis: [path]
};

const specs = swaggerJsdoc(options);
router.use("/", swaggerUi.serve, swaggerUi.setup(specs));

export default router;
