class Tutorial extends WidgetBase {
  async createContent() {
    let plantDiv = document.createElement("div");
    plantDiv.id = "plantWidget";
    plantDiv = await createPlantWidget(plantDiv);
    return plantDiv;
  }
  async createPreview() {
    let plantPreviewDiv = document.createElement("div");
    plantPreviewDiv.id = "plantPreviewWidget";
    let plantData = await browser.runtime.sendMessage({
      action: "getPlantAppData",
    });
    let plantTitle = document.createElement("div");
    plantTitle.id = "plant-preview-title";
    plantTitle.innerText = "Plant";
    plantPreviewDiv.appendChild(plantTitle);
    let plantPreviewImg = document.createElement("div");
    if (plantData.age == null || plantData.age == 0) {
      plantPreviewImg.appendChild(createPlantThePlantVisual());
    } else {
      plantPreviewImg.innerHTML = getPlantHTML(plantData);
    }
    plantPreviewDiv.appendChild(plantPreviewImg);
    return plantPreviewDiv;
  } 
}