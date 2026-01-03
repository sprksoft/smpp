/// Fills missing fields in an object with values from a default object.
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
