async function displayUsernameTopNav(name) {
  let originalNameElement = document.querySelector(
    ".js-btn-profile .hlp-vert-box span"
  );
  if (originalNameElement) originalNameElement.innerHTML = name;
}

async function attachProfilePictureObserver(url) {
  // helper to process a single <img> element
  function processImg(img) {
    try {
      // ignore if:
      // not an img or no src
      if (!(img instanceof HTMLImageElement) || !img.src) return;
      // img src was already changed
      if (img.src == url) return;
      // not the original pfp and doesn't already have the class (I know it's confusing... and I made it, so)
      if (
        !isOriginalPfpUrl(img.src) &&
        !img.classList.contains("personal-profile-picture")
      )
        return;

      img.src = url;
      img.classList.add("personal-profile-picture");
    } catch (e) {
      console.error("Error processing img:", e, img);
    }
  }

  const existingImgs = Array.from(document.getElementsByTagName("img"));
  existingImgs.forEach(processImg);

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node instanceof HTMLImageElement) {
          processImg(node);
          continue;
        }

        try {
          const imgs = node.querySelectorAll?.("img");
          if (imgs && imgs.length) {
            for (const img of imgs) processImg(img);
          }
        } catch (e) {
          console.error("Error querying imgs inside node:", e, node);
        }
      }

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
    attributes: true,
    attributeFilter: ["src"],
  });

  return observer;
}

async function applyUsername(customName) {
  if (customName) {
    displayUsernameTopNav(customName);
  } else {
    displayUsernameTopNav(originalUsername);
  }
}

async function applyProfilePicture(profile) {
  console.log("applying pfp");
  let style = document.documentElement.style;
  const setPFPstyle = (url) => {
    style.setProperty("--profile-picture", "url(" + url + ")");
  };
  const fixObserver = async (url) => {
    if (profilePictureObserver != null) {
      profilePictureObserver.disconnect();
    }

    profilePictureObserver = await attachProfilePictureObserver(url);
  };

  let profileImageURL;
  console.log(profile);
  switch (profile.useSMpfp) {
    case true:
      profileImageURL = originalPfpUrl;
      break;
    case false:
      const onDefault = () => {
        return getPfpLink(profile.username || originalUsername);
      };
      let result = await getImageURL("profilePicture", onDefault);

      profileImageURL = result.url;
      break;
  }

  setPFPstyle(profileImageURL);
  fixObserver(profileImageURL);
}

function isOriginalPfpUrl(url) {
  function createSimpleUrl(url) {
    const parts = url.split("/");
    parts.pop();
    return parts.join("/");
  }
  return createSimpleUrl(originalPfpUrl) == createSimpleUrl(url);
}
