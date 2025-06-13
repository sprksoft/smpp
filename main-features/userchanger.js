// Voeg een nieuw inputveld toe zonder de originele inhoud te verwijderen (   thx voor de geen info lukas >:(   )

function getOriginalName() {
  return (
    document.querySelector(".js-btn-profile .hlp-vert-box span")?.innerText ||
    "Mr Unknown"
  );
}

function createCustomNameInput(customName, originalName) {
  let parent = document.getElementById("smscMainBlockContainer");
  let customNameInputContainer = document.createElement("div");
  customNameInputContainer.id = "custom-name-input-containter";
  let customNameInput = document.createElement("input");
  customNameInput.type = "text";
  customNameInput.id = "custom-name-input";
  customNameInput.placeholder = "Custom name";
  customNameInput.value = customName == null ? "" : customName;
  customNameInput.addEventListener("input", async function (event) {
    if (event.target.value.trim() != "") {
      displayCustomName(event.target.value);
      await saveCustomName(event.target.value);
    } else {
      displayCustomName(originalName);
      await saveCustomName(null);
    }
  });
  customNameInputContainer.appendChild(customNameInput);
  parent.appendChild(customNameInputContainer);
}

async function saveCustomName(customName) {
  const data = await browser.runtime.sendMessage({
    action: "getQuickSettingsData",
  });
  data.customName = customName;
  await browser.runtime.sendMessage({
    action: "setQuickSettingsData",
    data: data,
  });
}
function displayCustomName(customName) {
  let style = document.documentElement.style;
  let originalNameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  );
  originalNameElement.innerHTML = customName;
  style.setProperty("--profile-picture", "url(" + getPfpLink(customName) + ")");
}

function attachMessagesObserver(originalName, customName) {
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

        const isUserMessage = nameElement.innerHTML.startsWith(originalName);

        if (isUserMessage || isSentMessagesPage) {
          const image = node.querySelector(".modern-message__image img");
          if (image) {
            image.src = getPfpLink(customName || originalName);
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
  let originalName = getOriginalName();
  if (window.location.href.includes("module=Profile"))
    createCustomNameInput(customName, originalName);
  if (customName) {
    displayCustomName(customName);
  }
  attachMessagesObserver(originalName, customName);
}
