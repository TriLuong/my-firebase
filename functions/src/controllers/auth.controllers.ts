import { Request, Response } from "express";
import * as admin from "firebase-admin";
import * as httpStatusCode from "http-status-codes";
import { IDENTITY_TOOL_KIT, WEB_API } from "../config";
import * as request from "request";
import { respondSuccess, respondError, handleError } from "../common/common";

export async function login(req: Request, res: Response) {
  try {
    const url = `${IDENTITY_TOOL_KIT}/accounts:signInWithPassword?key=${WEB_API}`;
    const { email, password } = req.body;
    const body = { email, password, returnSecureToken: true };
    request.post(
      url,
      {
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      },
      async (error, response, data) => {
        if (error || response.statusCode !== 200) {
          handleError(res, error || Error(response.statusMessage));
        }
        const json = JSON.parse(data);
        const userRecord = await admin.auth().getUser(json.localId);

        const result = {
          id: json.localId,
          email: json.email,
          name: json.displayName,
          // @ts-ignore
          role: userRecord.customClaims && userRecord.customClaims.role,
          token: json.idToken,
          refreshToken: json.refreshToken,
          expiresIn: json.expiresIn
        };
        respondSuccess(res, result);
      }
    );
  } catch (error) {
    respondError(res, httpStatusCode.INTERNAL_SERVER_ERROR, error);
  }
}
