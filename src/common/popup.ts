export interface PopupOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  checkboxLabel?: string;
  hideCancel?: boolean;
}

export interface PopupResult {
  confirmed: boolean;
  dontShowAgain: boolean;
}

let activePopupClose: ((confirmed: boolean) => void) | null = null;

export function showPopup(options: PopupOptions): Promise<PopupResult> {
  return new Promise((resolve) => {
    activePopupClose?.(false);

    const overlay = document.createElement("div");
    overlay.className = "smpp-popup";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");

    const card = document.createElement("div");
    card.className = "smpp-popup-card";

    const title = document.createElement("h3");
    title.className = "smpp-popup-title";
    title.textContent = options.title;

    const message = document.createElement("p");
    message.className = "smpp-popup-message";
    message.textContent = options.message;

    card.append(title, message);

    let checkbox: HTMLInputElement | null = null;
    if (options.checkboxLabel) {
      const label = document.createElement("label");
      label.className = "smpp-popup-check";

      checkbox = document.createElement("input");
      checkbox.type = "checkbox";

      const checkText = document.createElement("span");
      checkText.textContent = options.checkboxLabel;

      label.append(checkbox, checkText);
      card.appendChild(label);
    }

    const buttons = document.createElement("div");
    buttons.className = "smpp-popup-buttons";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "smpp-popup-btn smpp-popup-cancel";
    cancelButton.textContent = options.cancelText || "Cancel";

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "smpp-popup-btn smpp-popup-confirm";
    confirmButton.textContent = options.confirmText;

    if (!options.hideCancel) buttons.appendChild(cancelButton);
    buttons.appendChild(confirmButton);
    card.appendChild(buttons);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    let settled = false;
    const close = (confirmed: boolean) => {
      if (settled) return;
      settled = true;
      if (activePopupClose === close) activePopupClose = null;
      document.removeEventListener("keydown", onKeydown, true);
      overlay.remove();
      resolve({
        confirmed,
        dontShowAgain: confirmed && !!checkbox?.checked,
      });
    };
    activePopupClose = close;

    const onKeydown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      close(false);
    };

    cancelButton.addEventListener("click", () => close(false));
    confirmButton.addEventListener("click", () => close(true));
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) close(false);
    });
    document.addEventListener("keydown", onKeydown, true);

    confirmButton.focus();
  });
}
