// @ts-check

const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Initialize Firebase
let app;

// Initialize Cloud Firestore and get a reference to the service
let db;

const initDatabase = (
  /** @type {{apiKey: String; authDomain: String; projectId: String; storageBucket: String; messagingSenderId: String; appId: String}} */ config
) => {
  app = initializeApp(config);
  db = getFirestore(app);
};

module.exports = { db, initDatabase };
