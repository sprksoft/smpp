//@ts-nocheck
const DEBUG = false;


/// Get a value inside an object by path
//
///```js
/// const ob = { sub1: { sub2: "hello" } };
/// getByPath(ob, "sub1.sub2") === "hello"
///```
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

/// set a value inside an object by path
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

/// Fills missing fields in an object with values from a default object.
export function fillObjectWithDefaults(object, defaults) {
  if (!object) {
    object = {};
  }

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

export function openURL(url, new_window = false) {
  if (new_window) {
    let a = document.createElement("a");
    a.href = url;
    a.rel = "noopener noreferrer";
    a.target = "_blank";
    a.click();
    return;
  }
  window.location = url;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // no hate please 👉👈 // GRRRR
}

export async function clearAllData() {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: "clearLocalStorage",
  });
  location.reload();
}

export function unbloat() {
  document.body.innerHTML = "";
}

export function getExtensionImage(name) {
  return chrome.runtime.getURL(`media/${name}`);
}

export function sendDebug(...messages) {
  if (DEBUG) {
    console.log(...messages);
  }
}

export function getSchoolName() {
  try {
    const schoolName = window.location.hostname.split(".")[0];
    if (!schoolName) {
      throw new Error("Failed to extract school name");
    }
    return schoolName;
  } catch (error) {
    console.error(error.message);
    return null;
  }
}

export function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

export function getFutureDate(days) {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

export function randomChance(probability) {
  if (probability <= 0) return false;
  if (probability >= 1) return true;
  return Math.random() < probability;
}

export function isAbsoluteUrl(url) {
  return /^(https?:\/\/|data:image\/)/i.test(url);
}

export function getPfpLink(username) {
  let firstInitial;
  let secondInitial;
  if (username) {
    const parts = username.trim().split(/\s+/);
    firstInitial = parts[0][0].toUpperCase();
    secondInitial = parts.length > 1 ? parts[1][0].toUpperCase() : "";
  } else {
    // Mr. Unknown
    firstInitial = "M";
    secondInitial = "U";
  }
  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${firstInitial + secondInitial
    }/plain/1/res/128`;
}

export function getUserId() {
  let userId;
  // get UID
  try {
    // try get it from a magic element
    sendDebug("Trying to get plannerUrl from DOM...");
    const plannerUrl = document
      .getElementById("datePickerMenu")
      .getAttribute("plannerurl");
    sendDebug("Found plannerUrl from DOM:", plannerUrl);

    const expirationDate = new Date(); // store UID as cookie
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `plannerUrl=${plannerUrl};expires=${expirationDate.toUTCString()};path=/`;
    sendDebug("Stored plannerUrl in cookies with 30 day expiration.");

    userId = plannerUrl.split("/")[4];
    sendDebug("Extracted userId from plannerUrl:", userId);
  } catch (e) {
    // read it from a cookie cuz the magic is unreliable af
    sendDebug("Failed to get plannerUrl from DOM. Error:", e.message);
    sendDebug("Trying to get plannerUrl from cookies...");

    const cookies = document.cookie.split(";");
    const plannerUrlCookie = cookies.find((cookie) =>
      cookie.trim().startsWith("plannerUrl=")
    );

    if (plannerUrlCookie) {
      sendDebug("Retrieved plannerUrl from cookies" + plannerUrlCookie);
      const plannerUrl = plannerUrlCookie.split("=")[1];
      sendDebug("Found plannerUrl in cookies:", plannerUrl);

      userId = plannerUrl.split("/")[4];
      sendDebug("Extracted userId from cookie plannerUrl:", userId);
    } else {
      console.error(
        "UID is fucked, refresh 5 keer en als het dan niet werkt vraag hulp op discord @JJorne"
      );
    }
  }
  if (userId) {
    return userId;
  } else {
    console.error("No userID? womp womp");
  }
}
