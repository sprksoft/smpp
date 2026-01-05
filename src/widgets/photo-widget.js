class PhotoWidget extends WidgetBase {
  constructor() {
    super();
  }
  displayImage() {
    browser.runtime
      .sendMessage({ action: "getPhotoWidgetImage" })
      .then((result) => {
        if (result && result.photoWidgetImage) {
          this.img =
            document.getElementById("photo_widget_background_image") ||
            document.createElement("img");
          if (this.img) {
            this.img.src = result.photoWidgetImage;
          } else {
            this.img = document.createElement("img");
            this.img.id = "photo_widget_background_image";
            this.img.style.backgroundColor = "var(--color-base00)";
            this.img.style.position = "relative";
            this.img.style.top = "0";
            this.img.style.left = "0";
            this.img.style.width = "100%";
            this.img.style.height = "100%";
            this.img.style.objectFit = "cover";
            this.img.style.zIndex = -1;
            this.img.style.display = "block";
            this.img.src = result.photoWidgetImage;
          }
          this.content.appendChild(this.img);
        } else {
          this.noImageDisplay = document.createElement("div");
          this.noImageDisplay.className = "no-image-display";
          this.noImageDisplay.textContent = "No image available";
          this.content.appendChild(this.noImageDisplay);
        }
      });
  }

  createContent() {
    this.content = document.createElement("div");
    this.content.className = "photo-widget";
    this.content.id = "photo_widget";

    this.displayImage();
    return this.content;
  }

  createPreview() {
    this.previewContent = document.createElement("div");
    this.previewContent.className = "photo-widget-preview";
    this.previewContent.id = "photo_widget_preview";

    this.previewContent.textContent = "Photo Widget Preview";
    return this.previewContent;
  }
}

registerWidget(new PhotoWidget());
