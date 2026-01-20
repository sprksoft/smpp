// @ts-nocheck
import { browser, getExtensionImage } from "../../common/utils.js";

export async function setBackground(appearance: any) {
  function displayBackgroundImage(imageSrc: string) {
    document.documentElement.style.setProperty(
      "--background-color",
      `transparent`
    );
    let img =
      (document.getElementById("background_image") as HTMLImageElement) ||
      document.createElement("img");
    img.id = "background_image";
    img.style.backgroundColor = "var(--color-base00)";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.zIndex = "-1";
    img.style.display = "block";
    if (imageSrc) img.src = imageSrc;
    if (
      !document.getElementById("background_image") &&
      !document.getElementById("tinymce") // check for message writing box
    ) {
      document.body.appendChild(img);
    }
  }
  
  let result = await browser.runtime.sendMessage({
    action: "getImage",
    id: appearance.theme,
  });

  if (result && result.type == "default") {
    result.imageData = await getExtensionImage(
      "theme-backgrounds/" + appearance.theme + ".jpg"
    );
  }
  
  displayBackgroundImage(result?.imageData || null);
}
