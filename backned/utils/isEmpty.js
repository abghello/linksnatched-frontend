const isEmpty = (obj) => {
  if (obj === null || obj === undefined) return true;
  // if (typeof obj === 'number') {
  //   if (obj === NaN) return true;
  //   return false;
  // }
  if (typeof obj === "string" || Array.isArray(obj)) return obj.length === 0;
  if (typeof obj === "object") return Object.keys(obj).length === 0;
  return !obj;
};

module.exports = isEmpty;
