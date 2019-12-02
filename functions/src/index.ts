import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as express from "express";
import * as bodyParser from "body-parser";
import usersRoute from "./routes/users.routes";

admin.initializeApp(functions.config().firebase);
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use("/api/v1/auth/login", app);
app.use("/api/v1/users", usersRoute);

export const main = functions.https.onRequest(app);
