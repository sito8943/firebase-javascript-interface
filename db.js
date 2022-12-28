// @ts-check

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Initialize Firebase
let app;

// Initialize Cloud Firestore and get a reference to the service
let db;

export const initDatabase = (
  /** @type {{apiKey: String; authDomain: String; projectId: String; storageBucket: String; messagingSenderId: String; appId: String}} */ config
) => {
  app = initializeApp(config);
  db = getFirestore(app);
};

export default db;
