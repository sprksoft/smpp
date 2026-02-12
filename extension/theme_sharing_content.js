let browser;
if (browser === undefined) {
  browser = chrome;
}

function sendMessage(action, data) {
  let detail = data ?? {};
  detail.action = action;

  // For Firefox because it is secure and stuff
  if (typeof cloneInto === "function") {
    detail = cloneInto(detail, window);
  }

  document.dispatchEvent(
    new CustomEvent("smppContentScriptMessage", {
      detail,
    }),
  );
}

document.addEventListener("smppPageScriptMessage", async (e) => {
  const data = e.detail;

  switch (data.action) {
    case "init":
      {
        console.log("Initializing with the page script...");

        const resp = await browser.runtime.sendMessage({
          action: "getSharedTheme",
          shareId: e.detail.themeId,
        });

        sendMessage("setMode", {
          mode: resp.theme ? "installed" : "canInstall",
        });
      }
      break;

    case "install":
      {
        const getResp = await browser.runtime.sendMessage({
          action: "getSharedTheme",
          shareId: e.detail.themeId,
        });
        if (getResp.theme) {
          sendMessage("setMode", {
            mode: "installed",
          });
          return;
        }

        const resp = await browser.runtime.sendMessage({
          action: "installTheme",
          shareId: e.detail.themeId,
        });
        if (resp.error) {
          sendMessage("error", {
            message: resp.error,
          });
        } else {
          sendMessage("setMode", {
            mode: "installed",
          });
        }
      }
      break;
  }
});

sendMessage("init");
