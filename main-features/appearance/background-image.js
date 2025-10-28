async function setBackground(appearance) {
  function displayBackgroundImage(image) {
    document.documentElement.style.setProperty(
      "--background-color",
      `transparent`
    );
    let img =
      document.getElementById("background_image") ||
      document.createElement("img");
    img.id = "background_image";
    img.style.backgroundColor = "var(--color-base00)";
    img.style.position = "absolute";
    img.style.top = "0";
    img.style.left = "0";
    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.zIndex = -1;
    img.style.display = "block";
    if (image) img.src = image;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  }
  let result = await browser.runtime.sendMessage({
    action: "getImage",
    id: "backgroundImage",
  });

  if (result.type == "default") {
    result.imageData = await getExtensionImage(
      "/theme-backgrounds/" + appearance.theme + ".jpg"
    );
  }
  displayBackgroundImage(result.imageData);
}
