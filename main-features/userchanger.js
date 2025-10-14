// Voeg een nieuw inputveld toe zonder de originele inhoud te verwijderen (   thx voor de geen info lukas >:(   )

function getOriginalName() {
  return (
    document.querySelector(".js-btn-profile .hlp-vert-box span")?.innerText ||
    "Mr Unknown"
  );
}

function createCustomNameInput(customName) {
  let parent = document.getElementById("smscMainBlockContainer");
  let customNameInputContainer =
    document.getElementById("custom-name-input-container") ||
    document.createElement("div");
  customNameInputContainer.id = "custom-name-input-container";

  let customNameInput =
    document.getElementById("custom-name-input") ||
    document.createElement("input");
  customNameInput.type = "text";
  customNameInput.id = "custom-name-input";
  customNameInput.placeholder = "Custom name";
  customNameInput.value = customName == null ? "" : customName;
  customNameInput.addEventListener("input", async function (event) {
    if (event.target.value.trim() != "") {
      displayUsernameTopNav(event.target.value);
      await saveCustomName(event.target.value);
    } else {
      displayUsernameTopNav(originalUsername);
      await saveCustomName(null);
    }
  });
  if (!document.getElementById("custom-name-input-container")) {
    customNameInputContainer.appendChild(customNameInput);
    parent.appendChild(customNameInputContainer);
  }
}

async function saveCustomName(name) {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  data.profile.username = name;
  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: data,
  });
}
function displayUsernameTopNav(name) {
  let style = document.documentElement.style;
  let originalNameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  );
  if (originalNameElement) originalNameElement.innerHTML = name;
  style.setProperty("--profile-picture", "url(" + getPfpLink(name) + ")");
}

function attachMessagesObserver(customName) {
  const messagesList = document.getElementById("msglist");
  if (!messagesList) return;

  const observer = new MutationObserver((mutations) => {
    const isSentMessagesPage =
      document.querySelector(".msgcell__head__title")?.innerText ===
      "Verzonden";
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) continue;

        const nameElement = node.querySelector(".modern-message__name");
        if (!nameElement) continue;

        const isUserMessage =
          nameElement.innerHTML.startsWith(originalUsername);

        if (isUserMessage || isSentMessagesPage) {
          const image = node.querySelector(".modern-message__image img");
          if (image) {
            image.src = getPfpLink(customName || originalUsername);
          }
        }
      }
    }
  });

  observer.observe(messagesList, {
    childList: true,
    subtree: false,
  });
}

async function userNameChanger(customName) {
  if (window.location.href.includes("module=Profile"))
    createCustomNameInput(customName);
  if (customName) {
    displayUsernameTopNav(customName);
  } else {
    displayUsernameTopNav(originalUsername);
  }
  attachMessagesObserver(customName);
}
