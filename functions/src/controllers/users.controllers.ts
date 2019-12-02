import * as admin from "firebase-admin";
import * as _ from "lodash";
import { Request, Response } from "express";
import * as httpStatusCode from "http-status-codes";
import { respondSuccess, respondError, handleError } from "../common/common";
import { usersCollection } from "../common/collections";
import { IUser } from "../models/user.model";

export const transformUser = async (
  ref: FirebaseFirestore.DocumentReference
) => {
  const snapshot = await ref.get();
  const user = snapshot.data()!;
  user["createdAt"] = snapshot.createTime;
  user["updatedAt"] = snapshot.updateTime;
  user["id"] = snapshot.id;
  await ref.update(user);
  user["createdAt"] = user["createdAt"].toDate();
  user["updatedAt"] = user["updatedAt"].toDate();
  return user;
};

export const transformUserToEndUser = (
  snapshot: FirebaseFirestore.DocumentSnapshot
) => {
  const load = snapshot.data()!;
  load["createdAt"] = load.createdAt.toDate();
  load["updatedAt"] = load.updatedAt.toDate();
  return load;
};

export async function all(req: Request, res: Response) {
  try {
    const { size = 10, page = 1, role } = req.query;

    const doc = await usersCollection().get();
    const pageIndex = parseInt(page) || 1;
    const pageSize = parseInt(size);
    let totalItem = doc.docs.length;
    let totalPage = Math.ceil(totalItem / pageSize);

    const result = {
      totalItem,
      totalPage,
      pageIndex,
      pageSize,
      hasNext: page < totalPage,
      hasPrev: page > 1,
      data: []
    };

    if (page > totalPage) {
      return respondSuccess(res, result);
    }

    let data = usersCollection().orderBy("createdAt", "desc");

    if (role) {
      data = data.where("role", "==", role);
    }

    const userDoc = await data.get();

    const startIndex = pageSize * (pageIndex - 1);
    const endIndex = Math.min(startIndex + pageSize, userDoc.docs.length);

    const users: any = userDoc.docs
      .slice(startIndex, endIndex)
      .map(d => transformUserToEndUser(d));

    totalItem = userDoc.docs.length;
    totalPage = Math.ceil(totalItem / pageSize) || 1;

    result["data"] = users || [];
    result["totalItem"] = totalItem;
    result["totalPage"] = totalPage;
    result["hasNext"] = page < totalPage;
    result["hasPrev"] = page > 1;

    return respondSuccess(res, result);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function create(req: Request, res: Response) {
  try {
    const {
      password,
      phone,
      email,
      role,
      name,
      truck = false,
      available = false,
      notes = "",
      truckNumber = "",
      devicePlatform = "Web",
      deviceToken = "",
      longitude = "",
      latitude = "",
      address = "",
      timezone
    } = req.body as IUser;

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return respondError(
    //     res,
    //     httpStatusCode.UNPROCESSABLE_ENTITY,
    //     errors.array()
    //   );
    // }

    const { uid } = await admin.auth().createUser({
      password,
      phoneNumber: phone,
      displayName: name,
      email
    });

    const claims = { role, timezone };

    await admin.auth().setCustomUserClaims(uid, claims);

    const user: IUser = {
      role,
      available,
      email,
      name,
      notes,
      phone,
      truck,
      truckNumber,
      devicePlatform,
      deviceToken,
      longitude,
      latitude,
      address,
      timezone
    };

    // @ts-ignore
    Object.keys(user).forEach(k => _.isUndefined(user[k]) && delete user[k]);

    const userRef = await usersCollection().get();

    user["index"] = userRef.docs.length;

    const ref = usersCollection().doc(uid);

    await ref.set(user);

    const createdUser = await transformUser(ref);

    return respondSuccess(res, createdUser);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const ref = usersCollection().doc(id);

    const doc = await ref.get();

    if (!doc.exists) {
      return respondError(res, httpStatusCode.NOT_FOUND, "User not exists");
    }

    const {
      name,
      password,
      email,
      role,
      available,
      truck,
      notes,
      phone,
      deviceToken,
      devicePlatform,
      truckNumber,
      longitude,
      latitude,
      address,
      timezone
    } = req.body;

    await admin.auth().updateUser(id, {
      displayName: name,
      password,
      email,
      phoneNumber: phone
    });

    await admin.auth().setCustomUserClaims(id, { role });

    const user: IUser = {
      name,
      email,
      role,
      available,
      truck,
      notes,
      phone,
      deviceToken,
      devicePlatform,
      truckNumber,
      longitude,
      latitude,
      address,
      timezone
    };

    // @ts-ignore
    Object.keys(user).forEach(k => _.isUndefined(user[k]) && delete user[k]);

    await ref.update(user);

    const updatedUser = await transformUser(ref);

    return respondSuccess(res, updatedUser);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function get(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const ref = usersCollection().doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return respondError(res, httpStatusCode.NOT_FOUND, "User not exists");
    }
    const users = await transformUserToEndUser(snapshot);
    return respondSuccess(res, users);
  } catch (err) {
    return handleError(res, err);
  }
}

export default { all, create, update, get };
