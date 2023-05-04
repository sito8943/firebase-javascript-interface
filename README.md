# firebase-javascript-interface@0.14.3

Functions to use firebase cloud firestore database like CRUD (Create Read Update Delete)

## functions

### insert

_to insert new objects to the db_

```
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
```

### deleteE

_to delete elements_

```
/**
 *
 * @param {string} table
 * @param {string[]} elements
 */
const deleteE = async (table, elements) => {
  for (const element of elements) await deleteDoc(doc(db, table, element));
};
```

### update

_to update objects to the db_

```
/**
 * @param {string} table
 * @param {string} key
 * @param {any} value
 */
const update = async (table, key, value) => {
  const dataRef = doc(db, table, key);
  const dataSnap = await getDoc(dataRef);
  if (dataSnap.exists()) {
    await setDoc(doc(db, table, key), { ..value });
    return { ...value };
  }
  return undefined;
};
```

### getValue

_to fetch a single value from db_

```
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
```

### getTable

_to fetch a entire collection_

```
/**
 * @param {string} table
 * @param {string} order
 * @param {number} page
 * @param {number} count
 * @returns array of objects from firebase
 */
const getTable = async (table, order = "date", page = 1, count = 10000) => {
  const parsedPage = page - 1;
  const first = query(collection(db, table), orderBy(order));
  const querySnapshot = await getDocs(first);
  const length = querySnapshot.docs.length;
  return {
    list: querySnapshot.docs
      .slice(parsedPage * count, page * count)
      .map((/** @type {{ data: () => object; }} */ doc) => doc.data()),
    totalPages: Math.ceil(length / count),
  };
};
/**
```

### setTable

_update entire collection_

```
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
```
