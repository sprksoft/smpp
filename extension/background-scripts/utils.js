// Fills missing fields in an object with values from a default object.
export function fillObjectWithDefaults(object, defaults) {
  if (!object) object = {};

  for (const key of Object.keys(defaults)) {
    if (typeof defaults[key] === "object" && defaults[key] !== null) {
      object[key] = fillObjectWithDefaults(object[key], defaults[key]);
    }
    if (object[key] === undefined) {
      object[key] = defaults[key];
    }
  }

  return object;
}

/*
 const ob = { sub1: { sub2: "hello" } };
 getByPath(ob, "sub1.sub2") === "hello"
*/

export function getByPath(object, path) {
  if (!path) {
    return object;
  }
  let ob = object;
  for (let node of path.split(".")) {
    ob = ob[node];
    if (ob === undefined) {
      throw `getByPath: ${node} did not exist in path ${path}`;
    }
  }
  return ob;
}

export function setByPath(object, path, value) {
  let ob = object;
  const pathSplit = path.split(".");
  for (let i = 0; i < pathSplit.length - 1; i++) {
    ob = ob[pathSplit[i]];
    if (ob === undefined) {
      throw `setByPath: ${pathSplit[i]} did not exist in path ${path}`;
    }
  }
  ob[pathSplit[pathSplit.length - 1]] = value;
}
