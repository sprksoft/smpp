async function displayUsernameTopNav(name) {
  let style = document.documentElement.style;
  let originalNameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  );
  if (originalNameElement) originalNameElement.innerHTML = name;
  if (isFirefox) return;
  const ifDefault = () => {
    return getPfpLink(name || originalUsername);
  };
  let result = await getImageURL("profilePicture", ifDefault);
  const profileImageURL = result.url;
  style.setProperty("--profile-picture", "url(" + profileImageURL + ")");
}

async function attachProfilePictureObserver() {
  // get the stored image once (cached). handle errors gracefully.
  let result;
  try {
    result = await browser.runtime.sendMessage({
      action: "getImage",
      id: "profilePicture",
    });
  } catch (err) {
    console.error("Failed to get profile picture from background:", err);
    return null;
  }
  if (!result || !result.imageData) {
    console.warn("No profile picture returned from background.");
    return null;
  }

  // helper to process a single <img> element
  function processImg(img) {
    try {
      // ignore if not an element or no src
      if (!(img instanceof HTMLImageElement) || !img.src) return;
      if (!isOriginalPfpUrl(img.src)) return;
      img.src = result.imageData;
    } catch (e) {
      console.error("Error processing img:", e, img);
    }
  }

  // process all existing images on the page
  const existingImgs = Array.from(document.getElementsByTagName("img"));
  existingImgs.forEach(processImg);

  // create observer to detect newly added nodes / images
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      // nodes directly added
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        // if the added node itself is an <img>, process it
        if (node instanceof HTMLImageElement) {
          processImg(node);
          continue;
        }

        // otherwise, find any <img> descendants and process them
        try {
          const imgs = node.querySelectorAll?.("img");
          if (imgs && imgs.length) {
            for (const img of imgs) processImg(img);
          }
        } catch (e) {
          // some nodes (like SVG fragments) might throw on querySelectorAll in odd cases
          console.error("Error querying imgs inside node:", e, node);
        }
      }

      // optionally handle attribute changes if some code sets src later via attribute mutation
      if (
        mutation.type === "attributes" &&
        mutation.target instanceof HTMLImageElement
      ) {
        processImg(mutation.target);
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true, // observe src attribute changes too
    attributeFilter: ["src"],
  });

  // return observer so caller can disconnect if needed
  return observer;
}

async function applyProfilePicture() {
  let result = await browser.runtime.sendMessage({
    action: "getImage",
    id: "profilePicture",
  });
  document.querySelectorAll("rounded_profile_photo").forEach((picture) => {
    picture.src = result.imageData;
  });
}

async function userNameChanger(customName) {
  if (customName) {
    displayUsernameTopNav(customName);
  } else {
    displayUsernameTopNav(originalUsername);
  }
  attachProfilePictureObserver();
}

function isOriginalPfpUrl(url) {
  function createSimpleUrl(url) {
    const parts = url.split("/");
    parts.pop();
    return parts.join("/");
  }
  return createSimpleUrl(originalPfpUrl) == createSimpleUrl(url);
}
