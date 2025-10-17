function createButton(id) {
  let outerSwitch = document.createElement("label");
  outerSwitch.classList.add("switch");
  let innerButton = document.createElement("input");
  innerButton.classList.add("popupinput");
  innerButton.type = "checkbox";
  innerButton.id = id;
  let innerSwitch = document.createElement("span");
  innerSwitch.classList.add("slider", "round");
  outerSwitch.appendChild(innerButton);
  outerSwitch.appendChild(innerSwitch);
  return outerSwitch;
}

function createButtonWithLabel(id, text) {
  let container = document.createElement("label");
  container.classList.add("smpp-button-with-label");
  container.for = id;

  let label = document.createElement("span");
  label.innerText = text;
  let button = createButton(id);
  container.appendChild(label);
  container.appendChild(button);
  return container;
}
