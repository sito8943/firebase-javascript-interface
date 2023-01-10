// @ts-check

const e = require("cors");
const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Initialize Firebase
var app;

// Initialize Cloud Firestore and get a reference to the service
var db;

const initDatabase = (
  /** @type {{apiKey: String; authDomain: String; projectId: String; storageBucket: String; messagingSenderId: String; appId: String}} */ config
) => {
  app = initializeApp(config);
  db = getFirestore(app);
};

const {
  collection,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  orderBy,
  deleteDoc,
} = require("firebase/firestore");

/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 */
const insert = async (table, key, value) => {
  await setDoc(doc(db, table, key), {
    ...value,
  });
  return { ...value };
};

/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 */
const update = async (table, key, value) => {
  const dataRef = doc(db, table, key);
  const dataSnap = await getDoc(dataRef);
  if (dataSnap.exists()) {
    await setDoc(doc(db, table, key), { ...value });
    return { ...value };
  }
  return undefined;
};

/**
 *
 * @param {string} comparison
 */
const getComparison = (comparison) => {
  switch (comparison) {
    case "equal":
      return "==";
    default: // anyone
      return comparison;
  }
};

/**
 * @param {string} table
 * @param {any} rQuery
 */
const getValue = async (table, rQuery) => {
  if (typeof rQuery === "object") {
    const [attribute, comparison, value] = rQuery;
    const q = query(
      collection(db, table),
      // @ts-ignore
      where(attribute, getComparison(comparison), value)
    );

    const querySnapshot = await getDocs(q);
    for (const item of querySnapshot.docs) return item.data();
  } else {
    const dataRef = doc(db, table, rQuery);
    const dataSnap = await getDoc(dataRef);
    if (dataSnap.exists()) return dataSnap.data();
    return undefined;
  }
};

/**
 * @param {string} table
 * @param {string} order
 * @param {string[]} rQuery [attribute, comparison, value]
 * @param {number} page
 * @param {number} count
 * @returns array of objects from firebase
 */
const getTable = async (
  table,
  order = "date",
  rQuery = [],
  page = 1,
  count = 10000
) => {
  let querySnapshot;
  if (rQuery.length) {
    const [attribute, comparison, value] = rQuery;
    const q = query(
      collection(db, table),
      orderBy(order),
      // @ts-ignore
      where(attribute, getComparison(comparison), value)
    );
    querySnapshot = await getDocs(q);
  } else {
    const first = query(collection(db, table), orderBy(order));
    querySnapshot = await getDocs(first);
  }
  const parsedPage = page - 1;
  const length = querySnapshot.docs.length;
  return {
    list: querySnapshot.docs
      .slice(parsedPage * count, page * count)
      .map((/** @type {{ data: () => object; }} */ doc) => doc.data()),
    totalPages: Math.ceil(length / count),
  };
};
/**
 *
 * @param {string} table
 * @param {object} newValue
 */
const setTable = async (table, newValue) => {
  for (const key of Object.keys(newValue)) {
    const dataRef = doc(db, table, key);
    const dataSnap = await getDoc(dataRef);
    if (dataSnap.exists()) {
      const localData = { ...newValue[key] };
      await setDoc(doc(db, table, key), localData);
    }
  }
  return true;
};

/**
 *
 * @param {string} table
 * @param {string[]} elements
 */
const deleteE = async (table, elements) => {
  for (const element of elements) await deleteDoc(doc(db, table, element));
};

module.exports = {
  insert,
  getValue,
  getTable,
  update,
  setTable,
  deleteE,
  initDatabase,
};
