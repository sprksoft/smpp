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
    img.style.width = "101%";
    img.style.height = "101%";
    img.style.objectFit = "cover";
    img.style.zIndex = -1;
    img.style.display = "block";
    if (image) img.src = image;
    if (!document.getElementById("background_image")) {
      document.body.appendChild(img);
    }
  }
  let backgroundImageData = await browser.runtime.sendMessage({
    action: "getImage",
    id: "backgroundImage",
  });

  switch (backgroundImageData.type) {
    case "link":
    case "file":
      displayBackgroundImage(backgroundImageData.imageData);
      break;
    default:
      displayBackgroundImage(
        getImage("/theme-backgrounds/" + appearance.theme + ".jpg")
      );
      break;
  }
}
