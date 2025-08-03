class BaseWindow {
  constructor(id, hidden = false) {
    this.id = id;
    this.hidden = hidden;
    this.element = null;
  }

  async create() {
    this.element = await this.renderContent();
    this.element.id = this.id;
    this.element.classList.add("base-window");
    if (this.hidden) this.element.classList.add("hidden");

    // Create controls container
    const controls = document.createElement("div");
    controls.classList.add("window-controls");

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.classList.add("window-button", "window-fullscreen");
    fullscreenBtn.title = "Volledig scherm";
    fullscreenBtn.innerHTML = contractIconSVG + expandIconSVG;

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("window-button", "window-close");
    closeBtn.title = "Sluiten";
    closeBtn.innerHTML = closeIconSVG;

    controls.appendChild(fullscreenBtn);
    controls.appendChild(closeBtn);
    this.element.appendChild(controls);

    document.body.appendChild(this.element);

    fullscreenBtn.addEventListener("click", () => {
      this.element.classList.toggle("fullscreen-window");
      void this.element.offsetWidth;
    });

    closeBtn.addEventListener("click", () => this.hide());
  }

  async renderContent() {
    // Override this in subclass
    return document.createElement("div");
  }

  // Called every time the window is opened
  // Override this in subclass
  onOpened() {}

  show(triggerEvent = null) {
    if (this.isOpen) return;

    this.isOpen = true;
    this.element.classList.remove("hidden");

    const openEventTarget = triggerEvent?.target;

    this._outsideClickHandler = (e) => {
      if (
        openEventTarget &&
        (e.target === openEventTarget || openEventTarget.contains(e.target))
      ) {
        return;
      }

      if (!e.target.closest(`#${this.id}`)) {
        this.hide();
      }
    };

    document.addEventListener("click", this._outsideClickHandler);

    this.onOpened();
  }

  hide() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.element.classList.add("hidden");

    if (this._outsideClickHandler) {
      document.removeEventListener("click", this._outsideClickHandler);
      this._outsideClickHandler = null;
    }
  }

  remove() {
    this.element?.remove();
    this.isOpen = false;
  }
}
