// @ts-nocheck

import { getPfpLink } from "../fixes-utils/utils.js";
import { originalPfpUrl, originalUsername } from "./main.js";
import { getImageURL } from "./modules/images.js";

let profilePictureObserver;
async function displayUsernameTopNav(name) {
  const originalNameElement = document.querySelector(".js-btn-profile .hlp-vert-box span");
  if (originalNameElement) {
    originalNameElement.innerHTML = name;
  }
}

async function attachProfilePictureObserver(url) {
  // helper to process a single <img> element
  function processImg(img) {
    try {
      // ignore if:
      // not an img or no src
      if (!(img instanceof HTMLImageElement && img.src)) {
        return;
      }
      // img src was already changed
      if (img.src === url) {
        return;
      }
      // not the original pfp and doesn't already have the class (I know it's confusing... and I made it, so)
      if (!(isOriginalPfpUrl(img.src) || img.classList.contains("personal-profile-picture"))) {
        return;
      }

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
      for (const htmlNode of mutation.addedNodes) {
        if (htmlNode.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        if (htmlNode instanceof HTMLImageElement) {
          processImg(htmlNode);
          continue;
        }

        try {
          const imgs = htmlNode.querySelectorAll?.("img");
          if (imgs?.length) {
            for (const img of imgs) {
              processImg(img);
            }
          }
        } catch (e) {
          console.error("Error querying imgs inside node:", e, htmlNode);
        }
      }

      if (mutation.type === "attributes" && mutation.target instanceof HTMLImageElement) {
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

export async function applyUsername(customName) {
  if (customName) {
    displayUsernameTopNav(customName);
  } else {
    displayUsernameTopNav(originalUsername);
  }
}

export async function applyProfilePicture(profile: Settings["profile"]) {
  const style = document.documentElement.style;
  const setPFPstyle = (url) => {
    style.setProperty("--profile-picture", `url(${url})`);
  };
  const fixObserver = async (url) => {
    if (profilePictureObserver != null) {
      profilePictureObserver.disconnect();
    }

    profilePictureObserver = await attachProfilePictureObserver(url);
  };

  let profileImageURL;
  switch (profile.useSMpfp) {
    case true:
      profileImageURL = originalPfpUrl;
      break;
    case false: {
      const onDefault = () => {
        return getPfpLink(profile.username || originalUsername);
      };
      const result = await getImageURL("profilePicture", onDefault, true);

      profileImageURL = result.url;
      break;
    }
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
  return createSimpleUrl(originalPfpUrl) === createSimpleUrl(url);
}
