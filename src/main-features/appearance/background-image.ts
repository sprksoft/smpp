import { getExtensionImage } from "../../common/utils.js";
import { isValidImage } from "../../fixes-utils/utils.js";
import { getImageURL } from "../modules/images.js";

export async function setBackground(themeName: string) {
  function displayBackgroundImage(imageSrc: string | null) {
    document.documentElement.style.setProperty("--background-color", "transparent");
    const imgContainer =
      (document.getElementById("smpp-background-image-container") as HTMLDivElement) ||
      document.createElement("div");
    imgContainer.id = "smpp-background-image-container";
    imgContainer.classList.add("smpp-background-image-container");

    const img =
      (document.getElementById("smpp-background-image") as HTMLImageElement) ||
      document.createElement("img");
    img.id = "smpp-background-image";
    img.classList.add("smpp-background-image");

    if (imageSrc) {
      img.classList.remove("image-not-available");
      img.src = imageSrc;
    } else {
      img.classList.add("image-not-available");
      img.src = "";
    }

    if (!(document.getElementById("smpp-background-image") || document.getElementById("tinymce"))) {
      document.body.appendChild(imgContainer);
      imgContainer.appendChild(img);
    }
  }

  const imageURL = await getImageURL(
    themeName,
    async () => {
      return await getExtensionImage(`theme-backgrounds/${themeName}.jpg`);
    },
    false,
  );
  if (await isValidImage(imageURL.url)) {
    displayBackgroundImage(imageURL.url);
  } else {
    displayBackgroundImage(null);
  }
}
