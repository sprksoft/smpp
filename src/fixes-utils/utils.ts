import { browser, delay, sendDebug } from "../common/utils.js";
import { errorSvg, infoSvg, succesSvg, warnSvg } from "./svgs.js";

export function isValidImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

export function getPfpLink(username: string): string {
  let firstInitial: string;
  let secondInitial: string;

  if (username) {
    const parts = username.trim().split(/\s+/);
    firstInitial = parts[0]?.[0] ? parts[0][0].toUpperCase() : "M";
    secondInitial = parts.length > 1 && parts[1] && parts[1][0] ? parts[1][0].toUpperCase() : "U";
  } else {
    // Mr. Unknown
    firstInitial = "M";
    secondInitial = "U";
  }

  return `https://userpicture20.smartschool.be/User/Userimage/hashimage/hash/initials_${
    firstInitial + secondInitial
  }/plain/1/res/128`;
}

export function getUserId(): string | undefined {
  let userId: string | undefined;

  // get UID
  try {
    // try get it from a magic element
    sendDebug("Trying to get plannerUrl from DOM...");
    const plannerElement = document.getElementById("datePickerMenu");
    const plannerUrl = plannerElement?.getAttribute("plannerurl");

    if (!plannerUrl) {
      throw new Error("plannerUrl attribute not found");
    }

    sendDebug("Found plannerUrl from DOM:", plannerUrl);
    const expirationDate = new Date(); // store UID as cookie
    expirationDate.setDate(expirationDate.getDate() + 30);
    document.cookie = `plannerUrl=${plannerUrl};expires=${expirationDate.toUTCString()};path=/`;
    sendDebug("Stored plannerUrl in cookies with 30 day expiration.");
    userId = plannerUrl.split("/")[4];
    sendDebug("Extracted userId from plannerUrl:", userId);
  } catch (e) {
    // read it from a cookie cuz the magic is unreliable af
    const errorMessage = e instanceof Error ? e.message : String(e);
    sendDebug("Failed to get plannerUrl from DOM. Error:", errorMessage);
    sendDebug("Trying to get plannerUrl from cookies...");

    const cookies = document.cookie.split(";");
    const plannerUrlCookie = cookies.find((cookie) => cookie.trim().startsWith("plannerUrl="));

    if (plannerUrlCookie) {
      sendDebug(`Retrieved plannerUrl from cookies${plannerUrlCookie}`);
      const plannerUrl = plannerUrlCookie.split("=")[1];
      sendDebug("Found plannerUrl in cookies:", plannerUrl);
      if (plannerUrl) userId = plannerUrl.split("/")[4];
      sendDebug("Extracted userId from cookie plannerUrl:", userId);
    } else {
      console.error(
        "UID is fucked, refresh 5 keer en als het dan niet werkt vraag hulp op discord @JJorne",
      );
    }
  }

  if (userId) {
    return userId;
  } else {
    console.error("No userID? womp womp");
    return undefined;
  }
}

export function getSchoolName(): string | null {
  try {
    const schoolName = window.location.hostname.split(".")[0];
    if (!schoolName) {
      throw new Error("Failed to extract school name");
    }
    return schoolName;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(errorMessage);
    return null;
  }
}

export async function clearAllData(): Promise<void> {
  localStorage.clear();
  await browser.runtime.sendMessage({
    action: "clearLocalStorage",
  });
  location.reload();
}

export type ToastType = "info" | "succes" | "error" | "warning";

export class Toast {
  content: string;
  type: ToastType;
  time: number;
  toastElement: HTMLDivElement;

  constructor(content: string, type: ToastType, time: number = 3000) {
    this.content = content;
    this.type = type;
    this.time = time;
    this.toastElement = this.createToastElement();
  }

  createToastElement(): HTMLDivElement {
    const toast = document.createElement("div");
    toast.classList.add("smpp-toast");
    const icon = document.createElement("div");
    icon.classList.add("smpp-toast-icon");
    const title = document.createElement("span");
    switch (this.type) {
      case "info":
        title.innerText = "Info";
        icon.innerHTML = infoSvg;
        toast.classList.add("smpp-info-toast");
        break;
      case "succes":
        title.innerText = "Succes";
        icon.innerHTML = succesSvg;
        toast.classList.add("smpp-succes-toast");
        break;
      case "error":
        title.innerText = "Error";
        icon.innerHTML = errorSvg;
        toast.classList.add("smpp-error-toast");
        break;
      case "warning":
        title.innerText = "Warning";
        icon.innerHTML = warnSvg;
        toast.classList.add("smpp-warning-toast");
        break;
    }
    const topContainer = document.createElement("div");
    topContainer.classList.add("smpp-toast-top");
    topContainer.appendChild(icon);
    topContainer.appendChild(title);

    toast.appendChild(topContainer);

    const content = document.createElement("span");
    content.classList.add("smpp-toast-content");
    content.innerText = this.content;
    toast.appendChild(content);
    return toast;
  }

  async hideToastElement(): Promise<void> {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;
    this.toastElement.classList.add("being-removed");
    await delay(300);
    toastContainer.removeChild(this.toastElement);
  }

  async render(): Promise<void> {
    const toastContainer = document.getElementById("toast-container");

    if (!toastContainer) return;
    toastContainer.appendChild(this.toastElement);
    await delay(this.time);
    await this.hideToastElement();
  }
}
