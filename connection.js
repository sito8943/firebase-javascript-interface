const admin = require("firebase-admin");

class FirebaseApplication {
  constructor() {}

  async initialize(serviceAccount, databaseURL = "") {
    if (databaseURL.length)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL,
      });
    else
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

    this.db = admin.firestore();
    if (databaseURL && databaseURL.length) this.realtime = admin.database();
  }
}

const firebaseApplication = new FirebaseApplication();

module.exports = firebaseApplication;
