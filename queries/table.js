// @ts-check
const firebaseApplication = require("../connection");

const { getComparison } = require("../utils/comparisons");
const { firestoreQuery } = require("./basics");

/**
 * @param {string} table
 * @param {any} rQuery [attribute, comparison, value]
 * @param {number} page
 * @param {number} count
 * @param {string} orderBy
 * @returns array of objects from firebase
 */
const fetch = async (
  table,
  rQuery = [],
  page = 0,
  count = 10000,
  orderBy = ""
) => {
  console.assert(typeof orderBy === "string", "orderBy must be string");
  console.assert(typeof table === "string", "collection must be string");
  console.assert(typeof page === "number", "page must be number");
  console.assert(typeof count === "number", "count must be number");
  console.assert(page >= 0, "page must be equal or greater than 0");
  let querySnapshot;
  let parsed = [];
  const db = firebaseApplication.db;
  const collectionRef = db.collection(table);
  let q = collectionRef;
  // if rQuery is an array of 3 string is a simple query
  if (rQuery.length && typeof rQuery[0] === "string") {
    const [attribute, comparison, value] = rQuery;
    q = await firestoreQuery(q, attribute, getComparison(comparison), value);
  } else if (rQuery.length && rQuery[0].length) {
    q = collectionRef;
    // @ts-ignore
    for (const localQuery of rQuery) {
      const [attribute, comparison, value] = localQuery;
      // @ts-ignore
      q = await firestoreQuery(q, attribute, getComparison(comparison), value);
    }
  }
  if (orderBy.length) q = q.orderBy(orderBy, "desc");
  querySnapshot = await q.get();
  parsed = querySnapshot.docs;
  const length = parsed.length;
  return {
    list: parsed
      .slice(page * count, (page + 1) * count)
      .map((/** @type {{ data: () => object; }} */ doc) => doc.data()),
    totalElements: length,
    totalPages: Math.ceil(length / count),
  };
};

module.exports = { fetch };
