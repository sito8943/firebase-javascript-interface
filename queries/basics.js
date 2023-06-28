async function firestoreQuery(
  collectionRef = null,
  attribute = "id",
  operator = "==",
  value = null
) {
  let q = collectionRef
    .where(attribute, operator, value || null)
    .orderBy(attribute);
  return q;
}

module.exports = { firestoreQuery };
