declare const chrome: any;

import { showPopup } from "../common/popup.js";

const SMARTER_SMARTSCHOOL_STYLE_ID = "smarterSmartschoolStyle";

const DISMISSED_KEY = "ssThemeWarningDismissed";
const POPUP_DELAY_MS = 1500;
const SHOW_RETRY_INTERVAL_MS = 2000;
const SHOW_RETRY_MAX_MS = 120000;
const POLL_INTERVAL_MS = 1000;
const POLL_MAX_MS = 120000;

let warned = false;
let dismissed = false;
let themeSeen = false;

function ssThemeActive(): boolean {
  return document.getElementById(SMARTER_SMARTSCHOOL_STYLE_ID) !== null;
}

function markThemeSeen(): void {
  if (themeSeen) return;
  themeSeen = true;
  tryShowWhenPossible();
}

function canShowPopup(): boolean {
  if (warned || dismissed || !themeSeen) return false;
  if (document.body.classList.contains("smpp-pomodoro-active")) return false;
  if (document.querySelector(".smpp-popup")) return false;
  return true;
}

async function showWarning(): Promise<void> {
  warned = true;

  try {
    const result = await showPopup({
      title: "Smarter Smartschool theme",
      message:
        "Smarter Smartschool is also applying its own theme on top of Smartschool++, which can make colors clash. You can turn it off in the Smarter Smartschool extension by setting its theme to default.",
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

function tryShowWhenPossible(): void {
  const start = Date.now();

  const tryShow = () => {
    if (warned || dismissed || !themeSeen) return;

    if (canShowPopup()) {
      void showWarning();
      return;
    }

    if (Date.now() - start < SHOW_RETRY_MAX_MS) {
      window.setTimeout(tryShow, SHOW_RETRY_INTERVAL_MS);
    }
  };

  window.setTimeout(tryShow, POPUP_DELAY_MS);
}

function watchForTheme(): void {
  if (ssThemeActive()) {
    markThemeSeen();
    return;
  }

  const observer = new MutationObserver(() => {
    if (ssThemeActive()) {
      observer.disconnect();
      markThemeSeen();
    }
  });

  observer.observe(document.documentElement || document, {
    childList: true,
    subtree: true,
  });

  const start = Date.now();
  const poll = () => {
    if (themeSeen || dismissed || warned) return;
    if (ssThemeActive()) {
      observer.disconnect();
      markThemeSeen();
      return;
    }
    if (Date.now() - start < POLL_MAX_MS) {
      window.setTimeout(poll, POLL_INTERVAL_MS);
    }
  };
  window.setTimeout(poll, POLL_INTERVAL_MS);
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
  } catch {}

  watchForTheme();
}
