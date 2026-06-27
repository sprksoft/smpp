// @ts-nocheck
import { keybinds } from "./main.js";
import { do_qm } from "./quick-menu/quick.js";
import { openSettingsWindow } from "./settings/main-settings.js";
import { openGlobalChat } from "./globalchat.js";
import {
  widgetEditMode,
  widgetEditModeInit,
  setEditMode,
  toggleBag,
} from "../widgets/widgets.js";

export type Keybind = Uppercase<string> | symbol | "None" | "Space";

function hasKeybinds(): boolean {
  return (
    typeof keybinds !== "undefined" &&
    !!keybinds &&
    Object.keys(keybinds).length > 0
  );
}

function isTextEditingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toUpperCase();

  if (tagName === "INPUT") return true;
  if (tagName === "TEXTAREA") return true;
  if (tagName === "SELECT") return true;

  if (target.isContentEditable) return true;

  if (
    target.closest("[contenteditable='true']") ||
    target.closest("[contenteditable='']") ||
    target.closest("[contenteditable='plaintext-only']") ||
    target.closest("[role='textbox']") ||
    target.closest(".tox-tinymce") ||
    target.closest(".tox-edit-area") ||
    target.closest(".mce-content-body")
  ) {
    return true;
  }

  const activeElement = document.activeElement;

  if (activeElement instanceof HTMLElement && activeElement !== target) {
    const activeTagName = activeElement.tagName.toUpperCase();

    if (activeTagName === "INPUT") return true;
    if (activeTagName === "TEXTAREA") return true;
    if (activeTagName === "SELECT") return true;
    if (activeElement.isContentEditable) return true;

    if (
      activeElement.closest("[contenteditable='true']") ||
      activeElement.closest("[contenteditable='']") ||
      activeElement.closest("[contenteditable='plaintext-only']") ||
      activeElement.closest("[role='textbox']") ||
      activeElement.closest(".tox-tinymce") ||
      activeElement.closest(".tox-edit-area") ||
      activeElement.closest(".mce-content-body")
    ) {
      return true;
    }
  }

  if (document.getElementById("tinymce")) return true;

  return false;
}

function normalizeKey(e: KeyboardEvent): Keybind {
  return e.key === " "
    ? "Space"
    : e.key.length === 1
      ? e.key.toUpperCase()
      : e.key;
}

function openQuickMenuFromKeyboard(source: string): void {
  do_qm(source);
}

document.addEventListener("keydown", async (e) => {
  if (e.defaultPrevented) return;
  if (e.repeat) return;
  if (isTextEditingTarget(e.target)) return;

  const isQuickMenuShortcut =
    (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";

  if (isQuickMenuShortcut) {
    e.preventDefault();
    openQuickMenuFromKeyboard("dmenu");
  }
});

document.addEventListener("keyup", async (e) => {
  if (e.defaultPrevented) return;
  if (isTextEditingTarget(e.target)) return;

  const key = normalizeKey(e);

  if (!hasKeybinds()) {
    if (key === ":") {
      openQuickMenuFromKeyboard("dmenu");
    }

    return;
  }

  // General
  switch (key) {
    case keybinds.dmenu:
      openQuickMenuFromKeyboard(keybinds.dmenu);
      break;
    case keybinds.settings:
      openSettingsWindow(e);
      break;
    case keybinds.gc:
      openGlobalChat(e);
      break;
  }

  // Widget
  if (!widgetEditModeInit) return;

  if (key === "Escape" && widgetEditMode) {
    await setEditMode(false);
    return;
  }

  switch (key) {
    case keybinds.widgetEditMode:
      await setEditMode(true);
      break;
    case keybinds.widgetBag:
      if (widgetEditMode) toggleBag();
      break;
  }
});