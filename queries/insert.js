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

module.exports = { insert };
