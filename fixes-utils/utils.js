const DEBUG = false;

function openURL(url, new_window = false) {
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

function getPageURL() {
  const url = window.location;
  let urlObject = {};
  urlObject.search = url.search;
  urlObject.schoolName = url.hostname.split(".")[0];
  urlObject.fullPath = url.pathname.replace("/", "");
  urlObject.path = url.pathname.split("/")[1];

  const query = new URLSearchParams(url.search);
  urlObject.moduleName = query.get("module");
  return urlObject;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // no hate please 👉👈 // GRRRR
}

async function clearsettings() {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: "clearLocalStorage",
  });
  console.log("Cleared settings!");
}

function unbloat() {
  document.body.innerHTML = "";
}

function getImage(name) {
  return chrome.runtime.getURL(`media/${name}`);
}

function sendDebug(...messages) {
  if (DEBUG) {
    console.log(...messages);
  }
}

function getSchoolName() {
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

function getCurrentDate() {
  return new Date().toISOString().split("T")[0];
}

function getFutureDate(days) {
  return new Date(Date.now() + days * 86400000).toISOString().split("T")[0];
}

function randomChance(probability) {
  if (probability <= 0) return false;
  if (probability >= 1) return true;
  return Math.random() < probability;
}

function isAbsoluteUrl(url) {
  return /^(https?:\/\/|data:image\/)/i.test(url);
}

function getUserId() {
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
