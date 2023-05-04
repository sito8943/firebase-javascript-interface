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
  deleteDoc,
} = require("firebase/firestore");

/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 * @param {object} headers
 */
const insert = async (table, key, value, headers) => {
  await setDoc(
    doc(db, table, key),
    {
      ...value,
    },
    { headers }
  );
  return { ...value };
};

/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 */
const update = async (table, key, value, headers) => {
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
    const dataRef = doc(db, table, dataToUpdate.id);
    const dataSnap = await getDoc(dataRef);
    if (dataSnap.exists())
      await setDoc(doc(db, table, key), { ...dataToUpdate }, { headers });
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
      return "has-not";
    case "has":
      return "has";
    case "contains-any":
      return "array-contains-any";
    case "in":
      return "in";
    case "equal":
      return "==";
    case "not-equal":
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
    let q = undefined;
    if (rQuery.length && typeof rQuery[0] === "string") {
      if (rQuery.length === 2) {
        q = query(collection(db, table));
        const querySnapshot = await getDocs(q);
        for (const item of querySnapshot.docs) {
          const [attribute, comparison] = rQuery;
          if (comparison === "has" && item.data()[attribute])
            return item.data();
          if (comparison === "has-not" && !item.data()[attribute])
            return item.data();
          return undefined;
        }
      }
      const [attribute, comparison, value] = rQuery;
      q = query(
        collection(db, table),
        // @ts-ignore
        where(attribute, getComparison(comparison), value)
      );
    } else {
      q = query(
        collection(db, table),
        // @ts-ignore
        ...rQuery
          .filter((localQuery) => localQuery.length === 3)
          .map((localQuery) => {
            const [attribute, comparison, value] = localQuery;
            // @ts-ignore
            return where(attribute, getComparison(comparison), value);
          })
      );
      const localQueryFiltering = rQuery.filter(
        (localQuery) => localQuery.length === 2
      );
      const querySnapshot = await getDocs(q);
      for (const element of querySnapshot.docs) {
        for (const localQuery of localQueryFiltering) {
          const [attribute, comparison] = localQuery;
          if (comparison === "has" && element.data()[attribute])
            return element.data();
          if (comparison === "has-not" && !element.data()[attribute])
            return element.data();
          return undefined;
        }
      }
    }
    const querySnapshot = await getDocs(q);
    for (const item of querySnapshot.docs) return item.data();
  } else {
    const dataRef = doc(db, table, rQuery);
    const dataSnap = await getDoc(dataRef);
    if (dataSnap.exists()) return dataSnap.data();
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
  let q = undefined;
  if (rQuery.length && typeof rQuery[0] === "string") {
    if (rQuery.length === 2) {
      q = query(collection(db, table));

      const querySnapshot = await getDocs(q);
      parsed = [];
      for (const item of querySnapshot.docs) {
        const [attribute, comparison] = rQuery;
        console.log(attribute, comparison);
        if (comparison === "has" && item.data()[attribute]) parsed.push(item);
        if (comparison === "has-not" && !item.data()[attribute])
          parsed.push(item);
      }
    } else {
      const [attribute, comparison, value] = rQuery;
      q = query(
        collection(db, table),
        // @ts-ignore
        where(attribute, getComparison(comparison), value)
      );
      querySnapshot = await getDocs(q);
      parsed = querySnapshot.docs;
    }
  } else if (rQuery.length && rQuery[0].length) {
    q = query(
      collection(db, table),
      // @ts-ignore
      ...rQuery
        .filter((localQuery) => localQuery.length === 3)
        .map((localQuery) => {
          const [attribute, comparison, value] = localQuery;
          // @ts-ignore
          return where(attribute, getComparison(comparison), value);
        })
    );
    querySnapshot = await getDocs(q);
    parsed = [];
    for (const item of querySnapshot.docs) {
      rQuery
        .filter((localQuery) => localQuery.length === 2)
        .forEach((localQuery) => {
          const [attribute, comparison] = localQuery;
          if (comparison === "has" && item.data()[attribute]) parsed.push(item);
          if (comparison === "has-not" && !item.data()[attribute])
            parsed.push(item);
        });
    }
  } else {
    const first = query(collection(db, table));
    querySnapshot = await getDocs(first);
    parsed = querySnapshot.docs;
  }
  const parsedPageI = page - 1;
  const length = parsed.length;
  return {
    list: parsed
      .filter((item) => {
        if (rQuery.length == 2) {
          const [attribute, comparison] = rQuery;
          if (comparison === "has" && item.data()[attribute]) return true;
          if (comparison === "has-not" && !item.data()[attribute]) return true;
          return false;
        }
        return true;
      })
      .slice(parsedPageI * parsedCount, parsedPage * parsedCount)
      .map((/** @type {{ data: () => object; }} */ doc) => doc.data()),
    totalPages: Math.ceil(length / parsedCount),
  };
};
/**
 *
 * @param {string} table
 * @param {object[]} elements
 */
const setTable = async (table, elements, headers) => {
  for (const item of elements) {
    await setDoc(
      doc(db, table, item.id),
      {
        ...elements,
      },
      { headers }
    );
  }
};

/**
 *
 * @param {string} table
 * @param {string[]} elements
 */
const deleteE = async (table, elements) => {
  for (const element of elements) await deleteDoc(doc(db, table, element));
};

/**
 *
 * @param {string} collectionPath
 
 * @returns
 */
const deleteCollection = async (collectionPath) => {
  const { list } = await getTable(collectionPath, [], 1, 10000);
  for (const element of list)
    await deleteDoc(doc(db, collectionPath, element.id));
};

module.exports = {
  insert,
  getValue,
  getTable,
  update,
  setTable,
  deleteE,
  initDatabase,
  deleteCollection,
};
