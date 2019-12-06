import { Request, Response } from "express";
import * as admin from "firebase-admin";
import * as httpStatusCode from "http-status-codes";
import { respondError } from "./common";

export async function isAuthenticated(
  req: Request,
  res: Response,
  next: Function
) {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith("Bearer")) {
    return respondError(res, httpStatusCode.UNAUTHORIZED, "Unauthorized");
  }

  const split = authorization.split("Bearer ");
  if (split.length !== 2) {
    return respondError(res, httpStatusCode.UNAUTHORIZED, "Unauthorized");
  }

  const token = split[1];

  try {
    const decodedToken: admin.auth.DecodedIdToken = await admin
      .auth()
      .verifyIdToken(token);
    res.locals = {
      ...res.locals,
      uid: decodedToken.uid,
      role: decodedToken.role,
      email: decodedToken.email
    };
    return next();
  } catch (err) {
    return respondError(res, httpStatusCode.UNAUTHORIZED, "Unauthorized");
  }
}
