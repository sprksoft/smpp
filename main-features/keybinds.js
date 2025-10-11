document.addEventListener("keyup", async (e) => {
  if (e.target?.tagName === "INPUT") return;

  const key =
    e.key === " " ? "Space" : e.key.length === 1 ? e.key.toUpperCase() : e.key; // this is so readable i love it
  console.log(key);

  // Global
  switch (key) {
    case keybinds.dmenu:
      do_qm(keybinds.dmenu);
      break;
    case keybinds.settings:
      openSettingsWindow(e);
      break;
    case keybinds.gc:
      openGlobalChat(e);
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
