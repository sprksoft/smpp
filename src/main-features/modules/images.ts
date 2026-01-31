import { createTextInput } from "../appearance/ui.js";
import { imageInputSvg, loadingSpinnerSvg } from "../../fixes-utils/svgs.js";
import {
  isAbsoluteUrl,
  browser,
  convertLinkToBase64,
  getCompressedData,
  convertLinkToFile,
  delay,
} from "../../common/utils.js";
import { isFirefox } from "../main.js";
import imageCompression, { type Options } from "browser-image-compression";
import { Toast } from "../../fixes-utils/utils.js";

export type SMPPImage = {
  metaData: SMPPImageMetaData;
  imageData: string | Base64URLString;
};

export type SMPPImageMetaData = {
  type: "file" | "default";
  link: string;
};

export class ImageSelector {
  name: string;
  constructor(name: string) {
    this.name = name;

    this._bindEvents();
  }

  id: string = "";
  clearButton = document.createElement("button");
  linkInput = createTextInput("", "Link");
  fileInput = document.createElement("input");
  fileInputButton = document.createElement("button");
  linkInputContainer = this.createLinkImageInputContainer();
  fileInputContainer = this.createImageFileInputContainer();
  fullContainer = this.createFullFileInput();

  onStore() {}

  createImageFileInputContainer() {
    const fileInputContainer = document.createElement("div");
    fileInputContainer.classList.add("file-input-container");

    this.fileInput.style.display = "none";
    this.fileInput.tabIndex = -1;
    this.fileInput.type = "file";
    this.fileInput.accept = "image/*";

    this.fileInputButton.type = "button";
    this.fileInputButton.classList.add("smpp-file-input-button");
    this.fileInputButton.setAttribute("aria-label", "Choose image file");
    this.fileInputButton.innerHTML = imageInputSvg;

    this.fileInputButton.addEventListener("click", (e) => {
      e.preventDefault();
      this.fileInput.click();
    });

    fileInputContainer.appendChild(this.fileInput);
    fileInputContainer.appendChild(this.fileInputButton);
    return fileInputContainer;
  }

  createLinkImageInputContainer() {
    const linkInputContainer = document.createElement("div");
    linkInputContainer.classList.add("link-input-container");

    this.clearButton;
    this.clearButton.type = "button";
    this.clearButton.tabIndex = -1;
    this.clearButton.classList.add("smpp-link-clear-button");
    this.clearButton.setAttribute("aria-label", "Clear link");
    this.clearButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <g xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>`;

    linkInputContainer.appendChild(this.linkInput);
    linkInputContainer.appendChild(this.clearButton);
    return linkInputContainer;
  }

  createFullFileInput() {
    const container = document.createElement("div");
    container.classList.add("full-file-input-container");
    container.appendChild(this.linkInputContainer);
    container.appendChild(this.fileInputContainer);
    return container;
  }

  _bindEvents() {
    this.fileInput.addEventListener("change", async () => {
      if (this.fileInput.files && this.fileInput.files.length > 0) {
        this.fileInputButton.classList.add("active");
      } else {
        this.fileInputButton.classList.remove("active");
      }
      await this.storeImage();
    });

    this.linkInput.addEventListener("change", async () => {
      if ((this.linkInput.value || "").trim() !== "") {
        this.clearButton.classList.add("active");
      } else {
        this.clearButton.classList.remove("active");
      }
      await this.storeImage();
    });

    this.clearButton.addEventListener("click", async (e) => {
      e.preventDefault();
      this.linkInput.value = "";
      this.clearButton.classList.remove("active");
      this.fileInputButton.classList.remove("active");
      await this.storeImage();
    });
  }

  async storeImage() {
    try {
      let data = (await browser.runtime.sendMessage({
        action: "getImage",
        id: this.id,
      })) as SMPPImage;

      if (!data) {
        data = { imageData: "", metaData: { link: "", type: "default" } };
      }

      const compressedId = `compressed-${this.id}`;
      let compressedImage: SMPPImage = {
        imageData: data.imageData,
        metaData: { link: data.metaData.link, type: data.metaData.type },
      };

      // Handle file upload
      const file = this.fileInput.files?.[0];
      if (file) {
        this.fileInputButton.innerHTML = loadingSpinnerSvg;
        const [originalDataUrl, compressedDataUrl] = await Promise.all([
          imageCompression.getDataUrlFromFile(file),
          getCompressedData(file),
        ]);
        this.fileInputButton.innerHTML = imageInputSvg;

        data.imageData = originalDataUrl;
        data.metaData.link = file.name;
        data.metaData.type = "file";

        compressedImage.imageData = compressedDataUrl;
        compressedImage.metaData.link = file.name;
        compressedImage.metaData.type = "file";

        this.fileInput.value = "";
      } else {
        const linkValue = this.linkInput.value?.trim() || "";

        if (linkValue === "") {
          data.metaData.type = "default";
          data.metaData.link = "";
          data.imageData = "";

          compressedImage.metaData.type = "default";
          compressedImage.metaData.link = "";
          compressedImage.imageData = "";
        } else if (isAbsoluteUrl(linkValue)) {
          this.fileInputButton.innerHTML = loadingSpinnerSvg;
          let [base64, file] = await Promise.all([
            await convertLinkToBase64(linkValue),
            await convertLinkToFile(linkValue),
          ]);
          this.fileInputButton.innerHTML = imageInputSvg;
          if (base64 && file) {
            data.metaData.type = "file";
            data.metaData.link = linkValue;
            data.imageData = base64;

            this.fileInputButton.innerHTML = loadingSpinnerSvg;
            let compressedBase64 = await getCompressedData(file);
            this.fileInputButton.innerHTML = imageInputSvg;

            compressedImage.metaData.type = "file";
            compressedImage.metaData.link = linkValue;
            compressedImage.imageData = compressedBase64;
          } else {
            await this.loadImageData();
            await new Toast(
              "Failed to access image, try to upload it as a file",
              "error",
              5000
            ).render();
            data.metaData.type = "default";
            data.metaData.link = "";
            data.imageData = "";

            compressedImage.metaData.type = "default";
            compressedImage.metaData.link = "";
            compressedImage.imageData = "";
          }
        } else {
          await this.loadImageData();
          await new Toast("That's not a valid link!", "warning").render();
          data.metaData.type = "default";
          data.metaData.link = "";
          data.imageData = "";

          compressedImage.metaData.type = "default";
          compressedImage.metaData.link = "";
          compressedImage.imageData = "";
        }
      }

      await browser.runtime.sendMessage({
        action: "setImage",
        id: this.id,
        data: data,
      });
      await browser.runtime.sendMessage({
        action: "setImage",
        id: compressedId,
        data: compressedImage,
      });
      await this.loadImageData();
      this.onStore();
      if (data.metaData.type == "file") {
        new Toast("Image succesfully saved", "succes").render();
      }
    } catch (error) {
      await new Toast("Failed to save image", "error", 5000).render();
      console.error("Failed to store image:", error);
    }
  }

  async loadImageData() {
    let data = (await browser.runtime.sendMessage({
      action: "getImage",
      id: this.id,
    })) as SMPPImage;
    let metaData = data.metaData;

    if (!metaData) metaData = { link: "", type: "default" };

    this.linkInput.value = metaData.link || "";
    if (metaData.type === "file") {
      this.fileInputButton.classList.add("active");
    } else {
      this.fileInputButton.classList.remove("active");
    }

    if ((this.linkInput.value || "").trim() !== "") {
      this.clearButton.classList.add("active");
    } else {
      this.clearButton.classList.remove("active");
    }
  }
}

// Returns { url: string|null, type: file, link, default }
export async function getImageURL(
  id: string,
  onDefault: Function,
  getCompressed: boolean
) {
  let image;
  if (getCompressed) {
    id = "compressed-" + id;
  }
  try {
    image = (await browser.runtime.sendMessage({
      action: "getImage",
      id,
    })) as SMPPImage;
    console.log(image);
    console.log(id);
  } catch (err) {
    console.warn("[getImageURL] Failed to get image from background:", err);
    return { url: await onDefault(), type: null };
  }

  // Default
  if (image.metaData.type === "default") {
    console.log("why");
    return { url: await onDefault(), type: image.metaData.type };
  }

  // WARNING, THIS IS CURSED BUT I DON'T CARE!
  if (isFirefox) {
    return { url: image.imageData, type: image.metaData.type };
  }

  // File (base64)
  try {
    const res = await fetch(image.imageData);
    const blob = await res.blob();

    const objectURL = URL.createObjectURL(blob);
    console.log("yes");

    return { url: objectURL, type: image.metaData.type };
  } catch (err) {
    console.warn("[getImageURL] Failed to create Blob URL:", err);
    return { url: await onDefault(), type: image.metaData.type };
  }
}
