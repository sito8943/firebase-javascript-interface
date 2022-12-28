// @ts-check
const { db } = require("./db");
const {
  collection,
  doc,
  query,
  limit,
  getDocs,
  getDoc,
  setDoc,
  orderBy,
  startAfter,
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
 * @param {string} table
 * @param {string} key
 */
const getValue = async (table, key) => {
  const dataRef = doc(db, table, key);
  const dataSnap = await getDoc(dataRef);
  if (dataSnap.exists()) return dataSnap.data();
  return undefined;
};

/**
 * @param {string} table
 * @param {string} order
 * @param {number} page
 * @param {number} count
 * @returns array of objects from firebase
 */
const getTable = async (table, order = "date", page = 1, count = 10000) => {
  const first = query(collection(db, table), orderBy(order), limit(count));
  const querySnapshot = await getDocs(first);
  // every body in the party
  if (page === 1)
    return querySnapshot.docs.map((/** @type {{ data: () => any; }} */ doc) =>
      doc.data()
    );
  else {
    const currentLast = querySnapshot.docs[page * count];
    if (currentLast) {
      const next = query(
        collection(db, table),
        orderBy(order),
        startAfter(currentLast),
        limit(count)
      );
      const nextSnapshot = await getDocs(next);
      return nextSnapshot.docs.map(
        (/** @type {{ data: () => object; }} */ doc) => doc.data()
      );
    }
  }
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
};
