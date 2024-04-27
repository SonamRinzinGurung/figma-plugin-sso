// Import the functions you need from the SDKs you need
import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const config = {
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://FIGMA-SSO.firebaseio.com",
  projectId: "figma-sso",
};

export const firebase = admin.apps.length
  ? admin.app()
  : admin.initializeApp(config);
