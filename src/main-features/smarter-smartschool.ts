declare const chrome: any;

import { showPomodoroPopup } from "../common/popup.js";

const SMARTER_SMARTSCHOOL_ID = "lbpdknjafmmnemenflppkofaakldbfom";
const SMARTER_SMARTSCHOOL_RESOURCE = "static/img/icon_128.png";

const DISMISSED_KEY = "ssWarningDismissed";
const PROBE_TIMEOUT_MS = 3000;
const RETRY_INTERVAL_MS = 2000;
const RETRY_MAX_MS = 120000;
const POPUP_DELAY_MS = 1800;

let warned = false;
let dismissed = false;

function probeExtensionEnabled(): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (enabled: boolean) => {
      if (settled) return;
      settled = true;
      resolve(enabled);
    };

    const img = new Image();
    const timeout = window.setTimeout(() => {
      img.src = "";
      done(false);
    }, PROBE_TIMEOUT_MS);

    img.onload = () => {
      window.clearTimeout(timeout);
      done(true);
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      done(false);
    };

    img.src = `chrome-extension://${SMARTER_SMARTSCHOOL_ID}/${SMARTER_SMARTSCHOOL_RESOURCE}?t=${Date.now()}`;
  });
}

function canShowPopup(): boolean {
  if (warned || dismissed) return false;
  if (document.body.classList.contains("smpp-pomodoro-active")) return false;
  if (document.querySelector(".smpp-pomo-popup")) return false;
  return true;
}

async function showWarning(): Promise<void> {
  warned = true;

  try {
    const result = await showPomodoroPopup({
      title: "Smarter Smartschool detected",
      message:
        "Turn off the Smarter Smartschool theme to avoid conflicts with Smartschool++.",
      confirmText: "OK",
      cancelText: "Dismiss",
      checkboxLabel: "Don't show this again",
    });

    if (result.dontShowAgain) {
      dismissed = true;
      await chrome.storage.local.set({ [DISMISSED_KEY]: true });
    }
  } catch {
    warned = false;
  }
}

function schedulePopupChecks(): void {
  const start = Date.now();

  const tryShow = () => {
    if (warned || dismissed) return;

    if (canShowPopup()) {
      void showWarning();
      return;
    }

    if (Date.now() - start < RETRY_MAX_MS) {
      window.setTimeout(tryShow, RETRY_INTERVAL_MS);
    }
  };

  window.setTimeout(tryShow, POPUP_DELAY_MS);
}

export async function initSmarterSmartschoolWarning(): Promise<void> {
  if (window !== window.top) return;

  try {
    const { [DISMISSED_KEY]: storedDismissed } =
      await chrome.storage.local.get(DISMISSED_KEY);
    if (storedDismissed) {
      dismissed = true;
      return;
    }
  } catch {
  }

  const enabled = await probeExtensionEnabled();
  if (!enabled) return;

  schedulePopupChecks();
}
