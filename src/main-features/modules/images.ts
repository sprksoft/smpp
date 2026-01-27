import { createTextInput } from "../appearance/ui.js";
import { imageInputSvg } from "../../fixes-utils/svgs.js";
import { isAbsoluteUrl, browser } from "../../common/utils.js";
import { isFirefox } from "../main.js";
import imageCompression, { type Options } from "browser-image-compression";

export type SMPPImage = {
  type: string;
  link: string;
  imageData: string | Base64URLString;
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

  async getCompressedData(file: File): Promise<string> {
    try {
      const options: Options = {
        maxSizeMB: 0.2, // More aggressive compression
        maxWidthOrHeight: 400, // Higher resolution for better quality
        useWebWorker: false,
      };

      const compressedFile = await imageCompression(file, options);
      const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);

      return dataUrl;
    } catch (error) {
      console.error("Compression failed:", error);
      return await imageCompression.getDataUrlFromFile(file);
    }
  }

  async storeImage() {
    try {
      let data = (await browser.runtime.sendMessage({
        action: "getImage",
        id: this.id,
      })) as SMPPImage;

      if (!data) {
        data = { imageData: "", link: "", type: "default" };
      }

      const compressedId = `compressed-${this.id}`;
      let compressedImage: SMPPImage = {
        link: data.link,
        imageData: data.imageData,
        type: data.type,
      };

      // Handle file upload
      const file = this.fileInput.files?.[0];
      if (file) {
        const [originalDataUrl, compressedDataUrl] = await Promise.all([
          imageCompression.getDataUrlFromFile(file),
          this.getCompressedData(file),
        ]);

        data.imageData = originalDataUrl;
        data.link = file.name;
        data.type = "file";

        compressedImage.imageData = compressedDataUrl;
        compressedImage.link = file.name;
        compressedImage.type = "file";

        this.fileInput.value = "";
      } else {
        const linkValue = this.linkInput.value?.trim() || "";

        if (linkValue === "") {
          data.type = "default";
          data.link = "";
          data.imageData = "";

          compressedImage.type = "default";
          compressedImage.link = "";
          compressedImage.imageData = "";
        } else if (isAbsoluteUrl(linkValue)) {
          data.type = "link";
          data.link = linkValue;
          data.imageData = linkValue;

          compressedImage.type = "link";
          compressedImage.link = linkValue;
          compressedImage.imageData = linkValue;
        } else {
          data.type = "default";
          data.link = "";
          data.imageData = "";

          compressedImage.type = "default";
          compressedImage.link = "";
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
    } catch (error) {
      console.error("Failed to store image:", error);
    }
  }

  async loadImageData() {
    let data = await browser.runtime.sendMessage({
      action: "getImage",
      id: this.id,
    });

    if (!data) data = { link: "", type: "default" };

    this.linkInput.value = data.link || "";

    if (data.type === "file") {
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
    image = await browser.runtime.sendMessage({ action: "getImage", id });
    console.log(image);
  } catch (err) {
    console.warn("[getImageURL] Failed to get image from background:", err);
    return { url: await onDefault(), type: null };
  }

  // Default
  if (image.type === "default") {
    return { url: await onDefault(), type: image.type };
  }

  // Link
  if (image.type === "link") {
    return { url: image.imageData, type: image.type };
  }

  // WARNING, THIS IS CURSED BUT I DON'T CARE!
  if (isFirefox) {
    return { url: image.imageData, type: image.type };
  }

  // File (base64)
  try {
    const res = await fetch(image.imageData);
    const blob = await res.blob();

    const objectURL = URL.createObjectURL(blob);

    return { url: objectURL, type: image.type };
  } catch (err) {
    console.warn("[getImageURL] Failed to create Blob URL:", err);
    return { url: await onDefault(), type: image.type };
  }
}
