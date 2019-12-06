import * as admin from "firebase-admin";

export const usersCollection = () => admin.firestore().collection("/users");
export const loadsCollection = () => admin.firestore().collection("/loads");
