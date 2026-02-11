import {
  contractIconSVG,
  expandIconSVG,
  closeIconSVG,
} from "../../fixes-utils/svgs.js";

export class BaseWindow {
  id: string;
  hidden: boolean;
  element: HTMLDivElement;
  wrapper: HTMLDivElement;
  private _outsideClickHandler: ((e: MouseEvent) => void) | null = null;
  private _keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(id: string, hidden = true) {
    this.id = id;
    this.hidden = hidden;
    this.element = document.createElement("div");
    this.wrapper = document.createElement("div");
  }

  async create(): Promise<void> {
    this.element = await this.renderContent();
    this.element.id = this.id;
    this.element.classList.add("base-window");
    this.wrapper.classList.add("window-wrapper");
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

    this.wrapper.appendChild(this.element);
    document.body.appendChild(this.wrapper);

    fullscreenBtn.addEventListener("click", () => {
      this.onScreenSizeUpdate?.();
      this.element.classList.toggle("fullscreen-window");
      void this.element.offsetWidth;
    });

    closeBtn.addEventListener("click", () => this.hide(true));
  }

  // Override this in subclass
  async renderContent(): Promise<HTMLDivElement> {
    return document.createElement("div");
  }

  // Called every time the window is opened
  // Override this in subclass
  onOpened(): void { }

  // Called when window is closed
  onClosed?(clickedCloseButton: boolean): void;

  // Called when window grows or shrinks
  onScreenSizeUpdate?(): void;

  show(triggerEvent: MouseEvent | KeyboardEvent | null = null): void {
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
      : ((triggerEvent as MouseEvent | null)?.target ?? null);

    this._outsideClickHandler = (e: MouseEvent) => {
      const clickedElement = e.target as HTMLElement;

      // Check if click is inside the dialog itself
      const isInsideDialog = this.element.contains(clickedElement);
      if (isInsideDialog) {
        return;
      }

      // Check if click is inside a .base-dialog element
      const isInsideBaseDialog =
        clickedElement.closest(".base-dialog") !== null;
      if (isInsideBaseDialog) {
        return;
      }

      // Check if click is inside a .window-wrapper that contains a .base-dialog
      const windowWrapper = clickedElement.closest(".window-wrapper");
      const isInsideDialogWrapper =
        windowWrapper?.querySelector(".base-dialog") !== null;
      const isOwnWrapper = clickedElement == this.wrapper;
      if (isInsideDialogWrapper && !isOwnWrapper) {
        return;
      }

      // Check if click is on or inside the element that opened this dialog
      if (openEventTarget && clickedElement instanceof Node) {
        const isOpenTrigger = clickedElement === openEventTarget;
        const isInsideOpenTrigger =
          openEventTarget instanceof Node &&
          openEventTarget.contains(clickedElement);

        if (isOpenTrigger || isInsideOpenTrigger) {
          return;
        }
      }

      // Click was outside - hide the dialog
      this.hide();
    };
    document.addEventListener("mousedown", this._outsideClickHandler, {
      capture: true,
    });

    if (!this._keydownHandler) {
      this._keydownHandler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          this.hide(true);
        }
      };
      document.addEventListener("keydown", this._keydownHandler);
    }

    // Focus the first focusable element inside the window
    if (isKeyboardEvent) {
      requestAnimationFrame(() => {
        const focusableElements =
          this.element.querySelectorAll<HTMLLabelElement>("label");
        if (focusableElements.length > 0) {
          focusableElements[0]?.focus();
        }
      });
    }

    this.onOpened();
  }

  hide(realUserIntent = false): void {
    if (this.hidden) return;

    this.hidden = true;
    this.element.classList.add("hidden");
    if (this._outsideClickHandler) {
      document.removeEventListener("mousedown", this._outsideClickHandler, {
        capture: true,
      });
      this._outsideClickHandler = null;
    }
    if (this._keydownHandler) {
      document.removeEventListener("keydown", this._keydownHandler);
      this._keydownHandler = null;
    }

    this.onClosed?.(realUserIntent);
  }

  remove(): void {
    this.element?.remove();
    this.hidden = true;
  }
}
// TO DO: Add this for theme sharing and make it have no fullscreen button and be small
export class Dialog extends BaseWindow {
  constructor(id: string, hidden = true) {
    super(id, hidden);
  }

  override async create(): Promise<void> {
    this.element = await this.renderContent();
    this.element.id = this.id;
    this.element.classList.add("base-window", "base-dialog");
    this.wrapper.classList.add("window-wrapper");
    if (this.hidden) this.element.classList.add("hidden");

    // Create controls container
    const controls = document.createElement("div");
    controls.classList.add("window-controls");

    const closeBtn = document.createElement("button");
    closeBtn.classList.add("window-button", "window-close");
    closeBtn.title = "Sluiten";
    closeBtn.innerHTML = closeIconSVG;

    controls.appendChild(closeBtn);
    this.element.appendChild(controls);

    this.wrapper.appendChild(this.element);
    document.body.appendChild(this.wrapper);

    closeBtn.addEventListener("click", () => this.hide(true));
  }
}
