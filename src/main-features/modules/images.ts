import { createTextInput } from "../appearance/ui.js";
import { imageInputSvg, loadingSpinnerSvg } from "../../fixes-utils/svgs.js";
import {
  isAbsoluteUrl,
  browser,
  convertLinkToBase64,
  getCompressedData,
  convertLinkToFile,
} from "../../common/utils.js";
import { isFirefox } from "../main.js";
import imageCompression from "browser-image-compression";
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
  isThemeImage: boolean;

  id: string = "";
  clearButton = document.createElement("button");
  linkInput = createTextInput("", "Link or paste");
  fileInput = document.createElement("input");
  fileInputButton = document.createElement("button");
  linkInputContainer = this.createLinkImageInputContainer();
  fileInputContainer = this.createImageFileInputContainer();
  fullContainer = this.createFullFileInput();

  /* theme: Indicates that this image selector references the background image of a theme. (used for theme share cache invalidation on modify) */
  constructor(name: string, isThemeImage: boolean = false) {
    this.name = name;
    this.isThemeImage = isThemeImage;

    this._bindEvents();
  }

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

    this.linkInput.addEventListener("paste", async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();

          if (file) {
            this.linkInput.value = file.name;
            await this.storeImage(file);
          }
        }
      }
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

  async handleFileProcessing(file: File) {
    await this.storeImage(file);
  }

  async storeImage(passedFile?: File) {
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
      const file = passedFile || this.fileInput.files?.[0];

      if (file) {
        if (!file.type.startsWith("image/")) {
          this.fileInput.value = "";
          new Toast("That's not an image!", "error").render();
          return;
        }
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
              "Failed to access image, try saving and uploading it",
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
      if (this.isThemeImage) {
        await browser.runtime.sendMessage({
          action: "markThemeAsModified",
          name: this.id,
        });
      }
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

export async function getImageURL(
  id: string,
  onDefault: () => Promise<string>,
  getCompressed: boolean
): Promise<{ url: string; type: "file" | "default" | null }> {
  let image;
  let requestedImageId = id;
  if (getCompressed) {
    requestedImageId = "compressed-" + id;
  }
  try {
    image = (await browser.runtime.sendMessage({
      action: "getImage",
      id: requestedImageId,
    })) as SMPPImage;
  } catch (err) {
    console.warn("[getImageURL] Failed to get image from background:", err);
    return { url: await onDefault(), type: null };
  }

  // Compressed image is empty. Generate a new one if the original exists.
  // used for lazy compressed image generation for shared themes
  if (getCompressed && image.imageData === "") {
    let origImage = (await browser.runtime.sendMessage({
      action: "getImage",
      id,
    })) as SMPPImage;

    // Don't generate compressed version if original is empty.
    if (origImage.imageData != "") {
      // Compress original image
      const origImageFile = await imageCompression.getFilefromDataUrl(
        origImage.imageData,
        ""
      );
      const imageData = await getCompressedData(origImageFile);

      const compressedImage: SMPPImage = {
        metaData: {
          type: origImage.metaData.type,
          link: origImage.metaData.link,
        },
        imageData,
      };

      await browser.runtime.sendMessage({
        action: "setImage",
        id: requestedImageId,
        data: compressedImage,
      });

      // Continue code with the compressed image that has just been generated.
      image = compressedImage;
    }
  }

  // Default
  if (image.metaData.type === "default") {
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

    return { url: objectURL, type: image.metaData.type };
  } catch (err) {
    console.warn("[getImageURL] Failed to create Blob URL:", err);
    return { url: await onDefault(), type: image.metaData.type };
  }
}
