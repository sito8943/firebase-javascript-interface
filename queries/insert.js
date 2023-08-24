// @ts-check
const firebaseApplication = require("../connection");

/**
 * @param {string} table
 * @param {object} value
 */
const insert = async (table, value) => {
  console.assert(typeof table === "string", "collection must be string");
  const db = firebaseApplication.db;
  const collectionRef = db.collection(table);
  const newDocRef = collectionRef.doc();
  await newDocRef.set({ ...value, id: newDocRef.id });
  return newDocRef.id;
};

/**
 * @param {string} table
 * @param {object} value
 */
const hardInsert = async (table, value) => {
  console.assert(typeof table === "string", "collection must be string");
  console.assert(value.id !== undefined, "item must have an id");
  const db = firebaseApplication.db;
  const collectionRef = db.collection(table);
  await collectionRef.doc(value.id).set({ ...value });
  return value.id;
};

module.exports = { insert, hardInsert };
