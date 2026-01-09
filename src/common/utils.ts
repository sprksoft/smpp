export const DEBUG = false;

export var browser: any;
declare const chrome: any;
if (browser == undefined) {
  browser = chrome;
}

export function isActuallyAnObject(object: any): boolean {
  return typeof object === "object" && !Array.isArray(object);
}

/// Get a value inside an object by path
//
///```js
/// const ob = { sub1: { sub2: "hello" } };
/// getByPath(ob, "sub1.sub2") === "hello"
///```
export function getByPath(object: any, path: string): any {
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

/// set a value inside an object by path
export function setByPath(object: any, path: string, value: any) {
  let ob = object;
  const pathSplit = path.split(".");
  for (let i = 0; i < pathSplit.length - 1; i++) {
    ob = ob[pathSplit[i]!];
    if (ob === undefined) {
      throw `setByPath: ${pathSplit[i]} did not exist in path ${path}`;
    }
  }
  ob[pathSplit[pathSplit.length - 1]!] = value;
}

/// Fills missing fields in an object with values from a default object.
export function fillObjectWithDefaults(object: any, defaults: any) {
  if (!object) {
    object = {};
  }

  for (const key of Object.keys(defaults)) {
    if (
      typeof defaults[key] === "object" &&
      !Array.isArray(defaults[key]) &&
      defaults[key] !== null
    ) {
      object[key] = fillObjectWithDefaults(object[key], defaults[key]);
    }

    if (object[key] === undefined) {
      object[key] = defaults[key];
    }
  }

  return object;
}

export function openURL(url: string, new_window = false) {
  if (new_window) {
    let a = document.createElement("a");
    a.href = url;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    a.click();
    return;
  }
  window.location.href = url;
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // no hate please 👉👈 // GRRRR
}

export function getExtensionImage(name: string) {
  return browser.runtime.getURL(`media/${name}`);
}

export function sendDebug(...messages: any[]) {
  if (DEBUG) {
    console.log(...messages);
  }
}

export function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

export function getFutureDate(days: number) {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

export function randomChance(probability: number) {
  if (probability <= 0) return false;
  if (probability >= 1) return true;
  return Math.random() < probability;
}

export function isAbsoluteUrl(url: string) {
  return /^(https?:\/\/|data:image\/)/i.test(url);
}
