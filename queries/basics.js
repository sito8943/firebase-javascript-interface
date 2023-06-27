async function firestoreQuery(
  collectionRef = null,
  attribute = "id",
  operator = "==",
  value = null,
  page = 0,
  count = 10000,
  orderBy = ""
) {
  let q = collectionRef.where(attribute, operator, value || null);
  if (orderBy.length) q = q.orderBy(orderBy);
  if (count && !page) q = q.limit(count);
  if (page && count) q = q.startAt((page + 1) * count);
  return q;
}

module.exports = { firestoreQuery };
