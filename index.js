const admin = require("firebase-admin");

var db;

/**
 *
 * @param {any} serviceAccount
 
 */
function initialize(serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  db = admin.firestore();
}

/**
 * @param {string} table
 * @param {object} value
 */
const insert = async (table, value) => {
  const collectionRef = db.collection(table);
  const newDocRef = collectionRef.doc();
  const result = await newDocRef.set({ ...value, id: newDocRef.id });
  return result;
};

/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 */
const update = async (table, key, value) => {
  const dataToUpdate = await getValue(table, key);
  if (dataToUpdate) {
    if (value.just && value.value) {
      if (typeof value.just === "string")
        dataToUpdate[value.just] = value.value;
      else
        value.just.forEach((key1, i) => {
          dataToUpdate[key1] = value.value[i];
        });
    }
    const dataRef = db.collection(table).doc(dataToUpdate.id);
    await dataRef.update({ ...dataToUpdate });
  }
  return dataToUpdate;
};

/**
 *
 * @param {string} comparison
 */
const getComparison = (comparison) => {
  switch (comparison) {
    case "has-not":
      return "==";
    case "has":
      return "!=";
    case "contains-any":
      return "array-contains-any";
    case "in":
      return "in";
    case "equal":
    case "==":
      return "==";
    case "not-equal":
    case "!=":
      return "!=";
    default: // contains
      return "array-contains";
  }
};

/**
 * @param {string} table
 * @param {any} rQuery
 */
async function getValue(table, rQuery) {
  if (typeof rQuery === "object") {
    const collectionRef = db.collection(table);
    let q = undefined;
    if (rQuery.length && typeof rQuery[0] === "string") {
      const [attribute, comparison, value] = rQuery;
      q = collectionRef.where(
        attribute,
        getComparison(comparison),
        value || null
      );
    } else {
      q = collectionRef;
      // @ts-ignore
      rQuery.map((localQuery) => {
        const [attribute, comparison, value] = localQuery;

        // @ts-ignore
        q = q.where(attribute, getComparison(comparison), value || null);
      });
    }
    const querySnapshot = await q.get();
    for (const item of querySnapshot.docs) return item.data();
  } else {
    const dataRef = db.collection(table).doc(rQuery);
    const dataSnap = await dataRef.get();
    if (dataSnap.exists) return dataSnap.data();
    return undefined;
  }
}

/**
 * @param {string} table
 * @param {string[]} rQuery [attribute, comparison, value]
 * @param {number} page
 * @param {number} count
 * @returns array of objects from firebase
 */
const getTable = async (table, rQuery = [], page = 1, count = 10000) => {
  //* parsing count
  let parsedCount = 10000;
  if (Number.isNaN(count)) console.warn("Invalid count taking 10000");
  if (Number(count) < 0) parsedCount = 10000;
  else parsedCount = Number(count);

  //* parsing page
  let parsedPage = 1;
  if (Number.isNaN(page)) console.warn("Invalid page taking 1");
  if (Number(page) < 0) parsedPage = 1;
  else parsedPage = Number(page);
  let querySnapshot;
  let parsed = [];
  const collectionRef = db.collection(table);
  let q = undefined;
  if (rQuery.length && typeof rQuery[0] === "string") {
    const [attribute, comparison, value] = rQuery;
    q = collectionRef.where(
      attribute,
      getComparison(comparison),
      value || null
    );
  } else if (rQuery.length && rQuery[0].length) {
    q = collectionRef;
    // @ts-ignore
    rQuery.map((localQuery) => {
      const [attribute, comparison, value] = localQuery;
      // @ts-ignore
      q = q.where(attribute, getComparison(comparison), value || null);
    });
  } else q = collectionRef;
  querySnapshot = await q.get();
  parsed = querySnapshot.docs;
  const parsedPageI = page - 1;
  const length = parsed.length;
  return {
    list: parsed
      .slice(parsedPageI * parsedCount, parsedPage * parsedCount)
      .map((/** @type {{ data: () => object; }} */ doc) => doc.data()),
    totalPages: Math.ceil(length / parsedCount),
  };
};

/**
 *
 * @param {string} table
 * @param {string[]} documents
 */
const deleteDocuments = async (table, documents) => {
  const collectionRef = db.collection(table);
  const querySnapshot = await collectionRef.get();
  for (const doc of querySnapshot.docs)
    if (documents.find((document) => document === doc.data().id))
      doc.ref.delete();
};

/**
 *
 * @param {string} table
 
 * @returns
 */
const deleteCollection = async (table) => {
  const collectionRef = db.collection(table);
  const querySnapshot = await collectionRef.get();
  for (const doc of querySnapshot.docs) doc.ref.delete();
};

module.exports = {
  insert,
  update,
  getValue,
  getTable,
  deleteDocuments,
  deleteCollection,
  initialize,
};
