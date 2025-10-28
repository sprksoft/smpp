async function displayUsernameTopNav(name) {
  let style = document.documentElement.style;
  let originalNameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  );
  if (originalNameElement) originalNameElement.innerHTML = name;

  let result = await browser.runtime.sendMessage({
    action: "getImageURL",
    id: "profilePicture",
  });

  const profileImageURL = result.url;

  if (result.isDefault) {
    profileImageURL = getPfpLink(name || originalUsername);
  }
  style.setProperty("--profile-picture", "url(" + profileImageURL + ")");
}

async function attachMessagesObserver() {
  const messagesList = document.getElementById("msglist");
  if (!messagesList) return;

  const observer = new MutationObserver((mutations) => {
    // Check if we are on the "Sent messages" page
    const isSentMessagesPage =
      document.querySelector(".msgcell__head__title")?.innerText ===
      "Verzonden";

    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.TEXT_NODE) continue;

        const nameElement = node.querySelector?.(".modern-message__name");
        if (!nameElement) continue;

        // Check if this message is from the user
        const isUserMessage =
          nameElement.innerHTML.startsWith(originalUsername);

        if (isUserMessage || isSentMessagesPage) {
          // Add a class instead of changing the image
          node.classList.add("message-from-user");
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
  if (customName) {
    displayUsernameTopNav(customName);
  } else {
    displayUsernameTopNav(originalUsername);
  }

  attachMessagesObserver();
}
