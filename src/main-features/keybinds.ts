// @ts-nocheck

import { setEditMode, toggleBag, widgetEditMode, widgetEditModeInit } from "../widgets/widgets.js";
import { openGlobalChat } from "./globalchat.js";
import { keybinds } from "./main.js";
import { do_qm } from "./quick-menu/quick.js";
import { openSettingsWindow } from "./settings/main-settings.js";

export type Keybind = Uppercase<string> | symbol | "None" | "Space";

document.addEventListener("keyup", async (e) => {
  if (e.target?.tagName === "INPUT") return;
  if (e.target?.tagName === "TEXTAREA") return;
  if (document.getElementById("tinymce")) return;

  const key = e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key; // this is so readable i love it

  if (
    (typeof keybinds === "undefined" || !keybinds || Object.keys(keybinds).length === 0) &&
    key === ":"
  ) {
    do_qm("dmenu");
    return;
  }

  // General
  switch (key) {
    case keybinds.dmenu:
      do_qm(keybinds.dmenu);
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
