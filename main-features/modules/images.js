class ImageSelector {
  constructor(name) {
    this.name = name;

    this.clearButton = null;
    this.linkInput = null;
    this.linkInputContainer = this.createLinkImageInputContainer();

    this.fileInput = null;
    this.fileInputButton = null;
    this.fileInputContainer = this.createImageFileInputContainer();

    this.fullContainer = this.createFullFileInput();
    this._bindEvents();
  }

  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => {
        reader.abort();
        reject(new Error("Failed to read file"));
      };
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  onStore() {}

  createImageFileInputContainer() {
    const fileInputContainer = document.createElement("div");
    fileInputContainer.classList.add("file-input-container");

    this.fileInput = document.createElement("input");
    this.fileInput.style.display = "none";
    this.fileInput.type = "file";
    this.fileInput.accept = "image/*";

    this.fileInputButton = document.createElement("button");
    this.fileInputButton.type = "button";
    this.fileInputButton.classList.add("smpp-file-input-button");
    this.fileInputButton.setAttribute("aria-label", "Choose image file");
    this.fileInputButton.innerHTML = fileInputIconSvg;

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

    this.clearButton = document.createElement("button");
    this.clearButton.type = "button";
    this.clearButton.classList.add("smpp-link-clear-button");
    this.clearButton.setAttribute("aria-label", "Clear link");
    this.clearButton.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke-width="2">
          <g xmlns="http://www.w3.org/2000/svg">
          <path d="M7 7.00006L17 17.0001M7 17.0001L17 7.00006" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
        </svg>`;

    this.linkInput = createTextInput(null, "Link");

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
    let data = await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
    });

    if (!data) data = { imageData: null, link: "", type: "default" };

    const file = this.fileInput.files && this.fileInput.files[0];
    if (file) {
      const dataUrl = await this.readFileAsDataURL(file);
      data.imageData = dataUrl;
      data.link = file.name;
      data.type = "file";

      this.fileInput.value = "";
    } else {
      const linkValue = (this.linkInput.value || "").trim();
      console.log(linkValue);
      if (linkValue === "") {
        data.type = "default";
        data.link = "";
        data.imageData = null;
      } else {
        data.link = linkValue;
        if (isAbsoluteUrl(linkValue)) {
          data.type = "link";
          data.imageData = linkValue;
        } else {
          data.type = "default";
          data.imageData = null;
        }
      }
    }

    await browser.runtime.sendMessage({
      action: "setImage",
      id: this.name,
      data,
    });
    this.loadImageData();
    this.onStore();
  }

  async loadImageData() {
    let data = await browser.runtime.sendMessage({
      action: "getImage",
      id: this.name,
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
