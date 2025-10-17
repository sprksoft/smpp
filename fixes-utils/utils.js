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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms)); // no hate please 👉👈 // GRRRR
}

async function clearsettings() {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: "clearLocalStorage",
  });
  location.reload();
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