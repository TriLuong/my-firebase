import { Request, Response } from "express";
import { respondError } from "./common";
import * as httpStatusCode from "http-status-codes";
import { Roles } from "../models/user.model";

const ADMIN_EMAILS = ["myfirebase@mailinator.com"];

export const isAdmin = (email: string) => ADMIN_EMAILS.includes(email);

export function hasRole(roles: Array<Roles>) {
  return (req: Request, res: Response, next: Function) => {
    const { role, email } = res.locals;

    if (isAdmin(email)) return next();

    if (!role) return res.status(httpStatusCode.FORBIDDEN).send();

    if (roles.includes(role)) {
      return next();
    } else {
      return respondError(res, httpStatusCode.FORBIDDEN, "Forbidden");
    }
  };
}

export function isAuthorized(opts: {
  hasRole: Array<Roles>;
  allowSameUser?: boolean;
}) {
  return (req: Request, res: Response, next: Function) => {
    const { role, email, uid } = res.locals;
    const { id } = req.params;

    if (isAdmin(email)) return next();

    if (opts.allowSameUser && id && uid === id) return next();

    if (!role) return respondError(res, httpStatusCode.FORBIDDEN, "Forbidden");

    if (opts.hasRole.includes(role)) return next();

    return respondError(res, httpStatusCode.FORBIDDEN, "Forbidden");
  };
}
