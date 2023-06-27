// @ts-check

/**
 *
 * @param {string} comparison
 */
const getComparison = (comparison) => {
  switch (comparison) {
    case "has-not":
      return "==";
    case "<=":
      return "<=";
    case "<":
    case "less-than":
    case "less than":
      return "<";
    case ">=":
      return ">";
    case ">":
    case "greater-than":
    case "greater than":
      return ">";
    case "has":
      return "!=";
    case "contains-any":
      return "array-contains-any";
    case "in":
      return "in";
    case "not-in":
      return "not-in";
    case "equal":
    case "==":
      return "==";
    case "not-equal":
    case "!=":
      return "!=";
    default: // contains
      return "array-contains";
  }
};

module.exports = {
  getComparison,
};
