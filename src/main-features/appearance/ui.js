export function createButton(id = "") {
  let outerSwitch = document.createElement("label");
  outerSwitch.classList.add("switch");
  let innerButton = document.createElement("input");
  innerButton.classList.add("popupinput");
  innerButton.tabIndex = "-1";
  innerButton.type = "checkbox";
  innerButton.id = id;
  let innerSwitch = document.createElement("span");
  innerSwitch.classList.add("slider", "round");
  outerSwitch.appendChild(innerButton);
  outerSwitch.appendChild(innerSwitch);
  return outerSwitch;
}

export function createButtonWithLabel(id = "", text) {
  let container = document.createElement("label");
  container.classList.add("smpp-input-with-label");
  container.htmlFor = id;
  container.dataset.for = id;

  let label = document.createElement("span");
  label.innerText = text;
  let button = createButton(id);

  // Add keyboard support
  container.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault(); // Prevent page scroll on Space
      button.click(); // Trigger the checkbox
      container.focus();
    }
  });

  container.appendChild(label);
  container.appendChild(button);
  return container;
}

export function createTextInput(id = "", placeholder = "") {
  let textInput = document.createElement("input");
  textInput.id = id;
  textInput.type = "text";
  textInput.placeholder = placeholder;
  textInput.spellcheck = false;
  textInput.classList.add("smpp-text-input");
  return textInput;
}
