import imageCompression, { type Options } from "browser-image-compression";
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

export function isValidHexColor(color: string) {
  return /^#[0-9a-f]{3}(?:[0-9a-f]{3})?(?:[0-9a-f]{2})?$/i.test(color);
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

export async function convertLinkToBase64(link: string) {
  let base64 = (await browser.runtime.sendMessage({
    action: "getBase64",
    link: link,
  })) as string | null;
  if (base64) return base64;
  console.error(`Failed to convert link:${link} to base64`);
  return null;
}

export async function convertLinkToFile(link: string) {
  try {
    const fileData = await browser.runtime.sendMessage({
      action: "getFileData",
      link: link,
    });

    if (!fileData) {
      console.error(`Failed to get file data for link: ${link}`);
      return null;
    }

    const { arrayBuffer, mimeType, filename } = fileData;
    const uint8Array = new Uint8Array(arrayBuffer);
    const file = new File([uint8Array], filename, { type: mimeType });

    return file;
  } catch (error) {
    console.error("Error converting link to file:", error);
    return null;
  }
}

const FNV_PRIME = 0x0100000001b3n;
const FNV_OFFSET = 0xcbf29ce484222325n;
export function fnv1aHash(byteArray: Uint8Array): string {
  let hash = FNV_OFFSET;
  for (let i = 0; i < byteArray.length; i++) {
    hash ^= BigInt(byteArray[i] as number);
    hash = BigInt.asUintN(64, hash * FNV_PRIME);
  }
  return hash.toString();
}

export async function getCompressedData(file: File): Promise<string> {
  try {
    const options: Options = {
      maxSizeMB: 0.01,
      maxWidthOrHeight: 350,
      useWebWorker: false,
    };

    const compressedFile = await imageCompression(file, options);
    const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);

    return dataUrl;
  } catch (error) {
    console.error("Compression failed:", error);
    return await imageCompression.getDataUrlFromFile(file);
  }
}
