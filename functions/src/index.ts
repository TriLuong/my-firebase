import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import usersRoute from "./routes/users.routes";
import authRoute from "./routes/auth.routers";
import docsRouter from "./docs";

admin.initializeApp();
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: true }));

// app.use("/api/v1/auth/login", app);
app.use("/api/v1/users", usersRoute);
app.use("/api/v1/auth", authRoute);
app.use("/api/docs", docsRouter);

export const main = functions.https.onRequest(app);
