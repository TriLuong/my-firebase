import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
import usersRoute from "./routes/users.routes";
import docsRouter from "./docs";

admin.initializeApp(functions.config().firebase);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/api/v1/auth/login", app);
app.use("/api/v1/users", usersRoute);
app.use("/api/docs", docsRouter);

export const main = functions.https.onRequest(app);
