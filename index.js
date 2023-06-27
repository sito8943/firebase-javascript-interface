const { fetch } = require("./queries/table");
const { insert } = require("./queries/insert");

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
      const dataRef = db.collection(table).doc(dataToUpdate.id);
      await dataRef.update({ ...dataToUpdate });
    } else {
      const dataRef = db.collection(table).doc(dataToUpdate.id);
      await dataRef.update({ ...value });
    }
  }
  return dataToUpdate;
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

//* REALTIME DATABASE

/**
 *
 * @param {string} path
 * @param {object} data
 * @returns
 */
const writeRealtime = async (path, data) => {
  const ref = realtime.ref(path);
  ref.set(data);
  return data;
};

/**
 *
 * @param {string} path
 * @returns
 */
const readRealtime = async (path) => {
  const ref = realtime.ref(path);
  const snapshot = await ref.once("value");
  const value = snapshot.val();
  return value;
};

/**
 *
 * @param {string} path
 * @returns
 */
const deleteRealtime = async (path) => {
  const ref = realtime.ref(path);
  await ref.remove();
  return true;
};

module.exports = {
  fetch,
  insert,
  update,
  deleteDocuments,
  deleteCollection,
  readRealtime,
  writeRealtime,
  deleteRealtime,
};
