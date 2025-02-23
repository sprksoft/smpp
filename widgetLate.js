// This file needs to be loaded after all files that create a widget.

(async () => {
  let enabledWidgets = await browser.runtime.sendMessage({ action: 'getEnabledWidgets' });

  for (let widgetName of enabledWidgets){
    let widget = getWidgetByName(widgetName);
    if (widget !== undefined){
      widget.enable();
    }
  }

  document.getElementById("container").appendChild(widgetContainer);
})();

