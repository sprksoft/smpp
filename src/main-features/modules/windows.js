import { contractIconSVG, expandIconSVG, closeIconSVG } from "../../fixes-utils/json"

export class BaseWindow {
  #keydownHandler;
  constructor(id, hidden = true) {
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
    fullscreenBtn.classList.add("window-button", "window-fullscreen-btn");
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
  onOpened() { }

  show(triggerEvent = null) {
    if (!this.hidden) return;
    this.hidden = false;

    this.element.classList.remove("hidden");
    const isKeyboardEvent =
      triggerEvent &&
      (typeof KeyboardEvent !== "undefined"
        ? triggerEvent instanceof KeyboardEvent
        : String(triggerEvent.type).startsWith("key"));
    const openEventTarget = isKeyboardEvent
      ? null
      : triggerEvent?.target ?? null;
    this._outsideClickHandler = (e) => {
      if (
        openEventTarget &&
        (e.target === openEventTarget || openEventTarget.contains(e.target))
      ) {
        return;
      }
      if (!this.element.contains(e.target)) {
        this.hide();
      }
    };
    document.addEventListener("click", this._outsideClickHandler, {
      capture: true,
    });
    if (!this.#keydownHandler) {
      this.#keydownHandler = (e) => {
        if (e.key === "Escape") {
          this.hide();
        }
      };
      document.addEventListener("keydown", this.#keydownHandler);
    }

    // Focus the first focusable element inside the window
    if (isKeyboardEvent) {
      requestAnimationFrame(() => {
        const focusableElements = this.element.querySelectorAll("label");
        if (focusableElements.length > 0) {
          focusableElements[0].focus();
        }
      });
    }

    this.onOpened();
  }

  hide() {
    if (this.hidden) return;

    this.hidden = true;
    this.element.classList.add("hidden");
    if (this._outsideClickHandler) {
      document.removeEventListener("click", this._outsideClickHandler, {
        capture: true,
      });
      this._outsideClickHandler = null;
    }
    if (this.#keydownHandler) {
      document.removeEventListener("keydown", this.#keydownHandler);
      this.#keydownHandler = null;
    }

    this.onClosed?.();
  }

  remove() {
    this.element?.remove();
    this.isOpen = false;
  }
}
