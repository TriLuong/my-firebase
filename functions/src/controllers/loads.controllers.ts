import { Request, Response } from "express";
import * as _ from "lodash";
import * as httpStatusCode from "http-status-codes";
import { loadsCollection, usersCollection } from "../common/collections";
import { respondSuccess, respondError, handleError } from "../common/common";
import { ILoad } from "../models/load.model";
import { REP_ROLE, DRIVER_ROLE } from "../common/constants";

export const transformUser = async (
  ref: FirebaseFirestore.DocumentReference
) => {
  const snapshot = await ref.get();
  const load = snapshot.data()!;
  load["createdAt"] = snapshot.createTime;
  load["updatedAt"] = snapshot.updateTime;
  load["appointmentTime"] = load.appointmentTime.toDate();
  await ref.update(load);
  load["createdAt"] = load["createdAt"].toDate();
  load["updatedAt"] = load["updatedAt"].toDate();
  return load;
};

export const transformUserToEndUser = (
  snapshot: FirebaseFirestore.DocumentSnapshot
) => {
  const load = snapshot.data()!;
  load["createdAt"] = load.createdAt.toDate();
  load["updatedAt"] = load.updatedAt.toDate();
  load["appointmentTime"] = load.appointmentTime.toDate();
  return load;
};

const transformResponse = async (ref: FirebaseFirestore.DocumentReference) => {
  const snapshot = await ref.get();
  const load = snapshot.data()!;
  load["createdAt"] = snapshot.createTime;
  load["updatedAt"] = snapshot.updateTime;
  load["id"] = snapshot.id;

  await ref.update(load);

  load["createdAt"] = load["createdAt"].toDate();
  load["updatedAt"] = load["updatedAt"].toDate();

  if (load["appointmentTime"]) {
    load["appointmentTime"] = load["appointmentTime"].toDate();
  }

  const driverId = load.driverId || "-1";
  const repId = load.repId || "-1";
  const promises: any = [null, null];

  if (typeof driverId === "string" && driverId.length) {
    promises[0] = usersCollection()
      .doc(driverId)
      .get();
  }

  if (typeof repId === "string" && repId.length) {
    promises[1] = usersCollection()
      .doc(repId)
      .get();
  }

  const refs = await Promise.all(promises);

  // @ts-ignore
  load["driver"] = refs[0] && refs[0].exists ? refs[0].data() : null;
  // @ts-ignore
  load["rep"] = refs[1] && refs[1].exists ? refs[1].data() : null;

  if (_.isObject(load["driver"])) {
    if (_.hasIn(load["driver"], "createdAt")) {
      // @ts-ignore
      load["driver"]["createdAt"] = load["driver"]["createdAt"].toDate();
    }
    if (_.hasIn(load["driver"], "createdAt")) {
      // @ts-ignore
      load["driver"]["updatedAt"] = load["driver"]["updatedAt"].toDate();
    }
  }

  if (_.isObject(load["rep"])) {
    if (_.hasIn(load["rep"], "createdAt")) {
      // @ts-ignore
      load["rep"]["createdAt"] = load["rep"]["createdAt"].toDate();
    }
    if (_.hasIn(load["rep"], "createdAt")) {
      // @ts-ignore
      load["rep"]["updatedAt"] = load["rep"]["updatedAt"].toDate();
    }
  }
  return load;
};

// const transformResponseToEndUser = async (
//   snapshot: FirebaseFirestore.DocumentSnapshot,
//   hasDetail = true
// ) => {
//   const load = snapshot.data()!;

//   load["createdAt"] = load.createdAt.toDate();
//   load["updatedAt"] = load.updatedAt.toDate();

//   if (load["appointmentTime"]) {
//     load["appointmentTime"] = load["appointmentTime"].toDate();
//   }

//   const driverId = load.driverId || "-1";
//   const repId = load.repId || "-1";
//   const promises: any = [null, null];

//   if (typeof driverId === "string" && driverId.length) {
//     promises[0] = usersCollection()
//       .doc(driverId)
//       .get();
//   }

//   if (typeof repId === "string" && repId.length) {
//     promises[1] = usersCollection()
//       .doc(repId)
//       .get();
//   }

//   if (!hasDetail) {
//     return load;
//   }

//   const refs = await Promise.all(promises);

//   // @ts-ignore
//   load["driver"] = refs[0] && refs[0].exists ? refs[0].data() : null;
//   // @ts-ignore
//   load["rep"] = refs[1] && refs[1].exists ? refs[1].data() : null;

//   if (_.isObject(load["driver"])) {
//     if (_.hasIn(load["driver"], "createdAt")) {
//       // @ts-ignore
//       load["driver"]["createdAt"] = load["driver"]["createdAt"].toDate();
//     }
//     if (_.hasIn(load["driver"], "createdAt")) {
//       // @ts-ignore
//       load["driver"]["updatedAt"] = load["driver"]["updatedAt"].toDate();
//     }
//   }

//   if (_.isObject(load["rep"])) {
//     if (_.hasIn(load["rep"], "createdAt")) {
//       // @ts-ignore
//       load["rep"]["createdAt"] = load["rep"]["createdAt"].toDate();
//     }
//     if (_.hasIn(load["rep"], "createdAt")) {
//       // @ts-ignore
//       load["rep"]["updatedAt"] = load["rep"]["updatedAt"].toDate();
//     }
//   }

//   return load;
// };

export async function all(req: Request, res: Response) {
  try {
    const { size = 10, page = 1 } = req.query;

    const doc = await loadsCollection().get();
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

    let data = loadsCollection().orderBy("createdAt", "desc");

    const loadsDoc = await data.get();

    const startIndex = pageSize * (pageIndex - 1);
    const endIndex = Math.min(startIndex + pageSize, loadsDoc.docs.length);

    const loads: any = loadsDoc.docs
      .slice(startIndex, endIndex)
      .map(d => transformUserToEndUser(d));

    totalItem = loadsDoc.docs.length;
    totalPage = Math.ceil(totalItem / pageSize) || 1;

    result["data"] = loads;
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
      load,
      pickUp,
      notes,
      release,
      appointment,
      reservation,
      returnRail,
      yarnPull,
      loadedRail,
      appointmentTime,
      driverId,
      repId,
      status,
      customer,
      pickUpLocation = "",
      dropOffLocation = ""
    } = req.body as ILoad;

    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return respondError(
    //     res,
    //     httpStatusCode.UNPROCESSABLE_ENTITY,
    //     errors.array()
    //   );
    // }

    // @ts-ignore
    const payload: ILoad = {
      pickUp,
      notes,
      release,
      appointment,
      reservation,
      returnRail,
      yarnPull,
      loadedRail,
      appointmentTime: new Date(appointmentTime),
      driverId,
      repId,
      status: status || "New",
      transitMode: "Intermodal",
      customer,
      pickUpLocation,
      dropOffLocation,
      load
    };

    if (
      payload.status === "New" &&
      typeof driverId === "string" &&
      driverId.length
    ) {
      const driverDocRef = await loadsCollection()
        .where("role", "==", DRIVER_ROLE)
        .where("id", "==", driverId)
        .get();
      if (driverDocRef.docs.length === 0) {
        return respondError(res, 404, "Driver assigned not found");
      }
      payload.status = "AssignedNotDelivered";
    }

    if (payload.status === "New" && typeof repId === "string" && repId.length) {
      const repDocRef = await loadsCollection()
        .where("role", "==", REP_ROLE)
        .where("id", "==", repId)
        .get();
      if (repDocRef.docs.length === 0) {
        return respondError(res, 404, "Rep assigned not found");
      }
    }

    //@ts-ignore
    Object.keys(payload).forEach(k => !payload[k] && delete payload[k]);

    const loadRef = await loadsCollection().get();

    payload["index"] = loadRef.docs.length;

    const ref = await loadsCollection().add(payload);

    const createdLoad = await transformResponse(ref);
    return respondSuccess(res, createdLoad);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const ref = loadsCollection().doc(id);

    const doc = await ref.get();

    if (!doc.exists) {
      return respondError(res, httpStatusCode.NOT_FOUND, "Load not exists");
    }

    const {
      load,
      pickUp,
      notes,
      release,
      appointment,
      reservation,
      returnRail,
      yarnPull,
      loadedRail,
      appointmentTime,
      driverId,
      repId,
      status,
      customer,
      pickUpLocation = "",
      dropOffLocation = "",
      transitMode
    } = req.body;

    const user: ILoad = {
      load,
      pickUp,
      notes,
      release,
      appointment,
      reservation,
      returnRail,
      yarnPull,
      loadedRail,
      appointmentTime,
      driverId,
      repId,
      status,
      customer,
      pickUpLocation,
      dropOffLocation,
      transitMode
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
    const ref = loadsCollection().doc(id);
    const snapshot = await ref.get();
    if (!snapshot.exists) {
      return respondError(res, httpStatusCode.NOT_FOUND, "Load not exists");
    }
    const users = await transformUserToEndUser(snapshot);
    return respondSuccess(res, users);
  } catch (err) {
    return handleError(res, err);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const ref = await loadsCollection().doc(id);
    const snapshot = await ref.get();

    if (!snapshot.exists) {
      return respondError(res, httpStatusCode.NOT_FOUND, "Load not exists");
    }

    await ref.delete();

    return respondSuccess(res, {});
  } catch (err) {
    return handleError(res, err);
  }
}

export default { all, create, update, get, remove };
