//@ts-nocheck
import { DEBUG, sendDebug } from "../common/utils.js";

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
  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${
    firstInitial + secondInitial
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

export async function clearAllData() {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: "clearLocalStorage",
  });
  location.reload();
}
