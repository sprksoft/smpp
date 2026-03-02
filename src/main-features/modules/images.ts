import { createTextInput } from "../appearance/ui.js";
import { imageInputSvg, loadingSpinnerSvg } from "../../fixes-utils/svgs.js";
import {
  isAbsoluteUrl,
  browser,
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

class ImageProcessingError extends Error {
  constructor(
    public override message: string,
    public toastType: "error" | "warning" | "info" = "error",
    public toastDuration?: number
  ) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

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

  private getDefaultImageData(): SMPPImage {
    return { imageData: "", metaData: { link: "", type: "default" } };
  }

  private setButtonLoading(isLoading: boolean) {
    if (isLoading) {
      this.fileInputButton.innerHTML = loadingSpinnerSvg;
      new Toast("Loading image...", "info").render();
    } else {
      this.fileInputButton.innerHTML = imageInputSvg;
    }
  }

  private async processLocalFile(file: File): Promise<{
    original: SMPPImage;
    compressed: SMPPImage;
  }> {
    if (!file.type.startsWith("image/")) {
      throw new ImageProcessingError("That's not an image!", "error");
    }

    this.setButtonLoading(true);

    const [originalDataUrl, compressedDataUrl] = await Promise.all([
      getCompressedData(file, {
        maxSizeMB: 3,
        maxWidthOrHeight: 2560,
        useWebWorker: false,
      }),
      getCompressedData(file),
    ]);

    return {
      original: {
        imageData: originalDataUrl,
        metaData: { link: file.name, type: "file" },
      },
      compressed: {
        imageData: compressedDataUrl,
        metaData: { link: file.name, type: "file" },
      },
    };
  }

  private async processImageLink(url: string): Promise<{
    original: SMPPImage;
    compressed: SMPPImage;
  }> {
    if (!isAbsoluteUrl(url)) {
      throw new ImageProcessingError("That's not a valid link!", "warning");
    }

    this.setButtonLoading(true);

    // Fetch file and base64 concurrently
    const [file] = await Promise.all([
      convertLinkToFile(url).catch(() => null),
    ]);

    if (!file) {
      throw new ImageProcessingError(
        "Failed to access image, try saving and uploading it",
        "error",
        5000
      );
    }

    if (!file.type.startsWith("image/")) {
      throw new ImageProcessingError("That's not an image!", "error");
    }

    const compressedBase64 = await getCompressedData(file);
    const base64 = await getCompressedData(file, {
      maxSizeMB: 3,
      maxWidthOrHeight: 2560,
      useWebWorker: false,
    });
    return {
      original: { imageData: base64, metaData: { link: url, type: "file" } },
      compressed: {
        imageData: compressedBase64,
        metaData: { link: url, type: "file" },
      },
    };
  }

  private async saveToStorage(data: SMPPImage, compressedImage: SMPPImage) {
    const compressedId = `compressed-${this.id}`;

    // 1. Save both images to storage

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

    // 2. Update local state
    await this.loadImageData();
    this.onStore();
    // 3. Update theme if applicable
    if (this.isThemeImage) {
      await browser.runtime.sendMessage({
        action: "markThemeAsModified",
        name: this.id,
      });
    }
  }

  async storeImage(passedFile?: File) {
    // 1. Fetch existing data (or fall back to defaults)
    let storedData = await browser.runtime.sendMessage({
      action: "getImage",
      id: this.id,
    });
    let data: SMPPImage = storedData
      ? (storedData as SMPPImage)
      : this.getDefaultImageData();

    let compressedImage: SMPPImage = {
      imageData: data.imageData,
      metaData: { ...data.metaData },
    };

    try {
      const file = passedFile || this.fileInput.files?.[0];
      const linkValue = this.linkInput.value?.trim() || "";

      // 2. Route the action based on input type
      if (file) {
        const result = await this.processLocalFile(file);
        data = result.original;
        compressedImage = result.compressed;
      } else if (linkValue !== "") {
        const result = await this.processImageLink(linkValue);
        data = result.original;
        compressedImage = result.compressed;
      } else {
        // Clear the image if inputs are empty
        data = this.getDefaultImageData();
        compressedImage = this.getDefaultImageData();
      }

      // 3. Save to browser storage and update UI
      await this.saveToStorage(data, compressedImage);

      // 4. Success notification

      new Toast("Image successfully saved", "success").render();
    } catch (error) {
      // 5. Centralized Error Handling
      if (error instanceof ImageProcessingError) {
        new Toast(error.message, error.toastType, error.toastDuration).render();

        // If validation fails (e.g., bad link), wipe the corrupted state and save defaults
      } else {
        // Catch network or system-level crashes
        new Toast("Failed to save image", "error", 5000).render();
        console.error("Failed to store image:", error);
      }
    } finally {
      // 6. Universal Cleanup
      this.fileInput.value = "";
      this.setButtonLoading(false);
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
