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
