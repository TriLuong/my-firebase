import * as admin from "firebase-admin";

export const usersCollection = () => admin.firestore().collection("/users");
