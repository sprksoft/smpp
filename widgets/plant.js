const plantVersion = 2;
class PlantWidget extends WidgetBase {
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
registerWidget(new PlantWidget());

async function createPlantWidget(plantDiv) {
  if (window.localStorage.getItem("current_plant_conditions")) {
    await migratePlantData();
  }
  let plantData = await browser.runtime.sendMessage({
    action: "getPlantAppData",
  });
  console.log("Plant data: \n", plantData);
  let outdated = checkIfOutdated(plantData.plantVersion);
  plantDiv.innerHTML = "";
  if (outdated) {
    plantDiv.appendChild(createUpdatePrompt(plantData));
    return plantDiv;
  }
  if (plantData.age == 0) {
    plantDiv.appendChild(createPlantThePlantVisual());
    return plantDiv;
  }
  plantData = calculateGrowth(plantData);
  if (plantData.birthday != null)
    plantDiv.appendChild(createPlantStreak(plantData));
  plantDiv.appendChild(createPlantVisual(plantData));
  plantDiv.appendChild(await createPlantBottomUI(plantData));
  return plantDiv;
}

function createPlantVisual(data) {
  let plantVisualContainer = document.createElement("div");
  plantVisualContainer.id = "plant_image_container";
  plantVisualContainer.innerHTML = getPlantHTML(data);
  return plantVisualContainer;
}

async function createPlantBottomUI(data) {
  let currentTime = new Date();
  let lastWaterTime = new Date(data.lastWaterTime);
  let timeSinceLastWater = currentTime - lastWaterTime;
  let bottomUIContainer = document.createElement("div");
  bottomUIContainer.id = "buttondivforplant";
  let topUIContainer = document.createElement("div");
  topUIContainer.id = "top-plant-button-div";
  let UIContainer = document.createElement("div");
  UIContainer.id = "fullbuttondivforplant";

  let waterAmountContainer = document.createElement("div");
  waterAmountContainer.id = "glass-container";

  let waterAmount = document.createElement("div");
  waterAmount.id = "glass-fill";
  waterAmount.style.height =
    calculatePercentile(timeSinceLastWater / 1000) + `%`;
  waterAmountContainer.appendChild(waterAmount);

  let waterButton = document.createElement("button");
  waterButton.id = "watering_button";
  waterButton.innerHTML = waterPlantSvg;
  if (data.isAlive) {
    waterButton.addEventListener("click", userWateredPlant);
  } else {
    waterButton.classList.add("disabled");
  }

  let lastWaterTimeContainer = document.createElement("div");
  lastWaterTimeContainer.id = "time_difference_last_watered";

  let lastWaterTimeTitle = document.createElement("span");
  lastWaterTimeTitle.id = "water_title";
  lastWaterTimeTitle.innerText = "Watered";

  let lastWaterTimeElement = document.createElement("span");
  lastWaterTimeElement.id = "water_time";
  lastWaterTimeElement.innerText = getTimeInCorrectFormat(timeSinceLastWater);
  lastWaterTimeContainer.appendChild(lastWaterTimeTitle);
  lastWaterTimeContainer.appendChild(lastWaterTimeElement);

  if (!data.isAlive) {
    let removeButton = createRemoveButton(false);
    topUIContainer.appendChild(removeButton);
  } else if (data.age == 8) {
    let removeButton = createRemoveButton(true);
    topUIContainer.appendChild(removeButton);
  }

  bottomUIContainer.appendChild(waterAmountContainer);
  bottomUIContainer.appendChild(waterButton);
  bottomUIContainer.appendChild(lastWaterTimeContainer);

  UIContainer.appendChild(topUIContainer);
  UIContainer.appendChild(bottomUIContainer);
  return UIContainer;
}
async function updatePlantBottomUI(data) {
  let currentTime = new Date();
  let lastWaterTime = new Date(data.lastWaterTime);
  let timeSinceLastWater = currentTime - lastWaterTime;
  document.getElementById("glass-fill").style.height =
    calculatePercentile(timeSinceLastWater / 1000) + `%`;
  document.getElementById("water_time").innerText =
    getTimeInCorrectFormat(timeSinceLastWater);
}
function createPlantStreak(data) {
  let plantStreak = document.createElement("h2");
  plantStreak.id = "plant_streak";
  plantStreak.innerText = `${data.daysSinceBirthday} ${
    data.daysSinceBirthday + 1 == 1 ? "Day" : "Days"
  }`;
  return plantStreak;
}

function checkIfOutdated(version) {
  return Boolean(!version || version != plantVersion);
}

function createUpdatePrompt(data) {
  let updatePromptContainer = document.createElement("div");
  updatePromptContainer.id = "update-prompt-container";
  let updatePromptTitle = document.createElement("h1");
  updatePromptTitle.innerText = `Update Required!`;
  let updatePromptDescription = document.createElement("p");
  updatePromptDescription.innerHTML = `You have to reset to be up to date \nYour version: <b>${data.plantVersion}</b> is not the newest available version`;
  let resetButton = document.createElement("button");
  resetButton.innerText = "Reset Plant";
  resetButton.id = "removeplantButton";
  resetButton.addEventListener("click", resetPlant);
  updatePromptContainer.appendChild(updatePromptTitle);
  updatePromptContainer.appendChild(updatePromptDescription);
  updatePromptContainer.appendChild(resetButton);
  return updatePromptContainer;
}

async function resetPlant() {
  await browser.runtime.sendMessage({
    action: "setPlantAppData",
    data: null,
  });
  createPlantWidget(document.getElementById("plantWidget"));
}
function calculatePercentile(t) {
  const totalTime = 259200;
  // Total seconds in 3 days
  return Math.max(0, 100 * (1 - t / totalTime));
}

function getTimeInCorrectFormat(t) {
  if (t / 60 / 1000 < 1) return "Now";
  // check if time is less than 1 minute
  if (t / 60 / 60 / 1000 < 1) return Math.round(t / 60 / 1000) + "min ago";
  // check if time is less than 1 hour
  if (t / 60 / 60 / 1000 / 24 < 1)
    return Math.round(t / 60 / 60 / 1000) + "h ago";
  // check if time is less than 1 day
  return Math.round(t / 60 / 60 / 1000 / 24) + "d ago";
  // time is more than 1 day
}

function createRemoveButton(isAlive) {
  let removeButtonDiv = document.createElement("div");
  removeButtonDiv.id = "remove-button-div";

  let removeButtonBottomDiv = document.createElement("div");
  removeButtonBottomDiv.id = "remove-button-bottom-div";

  let removeButtonTopDiv = document.createElement("div");
  removeButtonTopDiv.id = "remove-button-top-div";

  let removeButton = document.createElement("button");
  removeButton.id = "removeplantButton";
  removeButton.innerText = "Remove plant";

  let removeInfoButton = document.createElement("div");
  removeInfoButton.id = "remove_button_info";
  removeInfoButton.innerText = "?";

  removeInfoButton.addEventListener("mouseover", function () {
    removeInfo.style.opacity = "1";
  });
  removeInfoButton.addEventListener("mouseout", function () {
    removeInfo.style.opacity = "0";
  });

  let removeInfo = document.createElement("div");
  removeInfo.id = "plant_remove_info_text";
  if (isAlive) {
    removeInfo.innerText =
      "Your plant is fully grown, remove it to plant a new one (optional)";
    removeButton.addEventListener("click", displayConfirmButton);
  } else {
    removeInfo.innerText = "Your plant has died, remove it to plant a new one";
    removeButton.addEventListener("click", resetPlant);
  }

  removeButtonTopDiv.appendChild(removeInfo);

  removeButtonBottomDiv.appendChild(removeButton);
  removeButtonBottomDiv.appendChild(removeInfoButton);

  removeButtonDiv.appendChild(removeButtonTopDiv);
  removeButtonDiv.appendChild(removeButtonBottomDiv);
  return removeButtonDiv;
}

function displayConfirmButton() {
  let removeplantButton = document.getElementById("removeplantButton");
  removeplantButton.innerText = "Are you sure?";
  removeplantButton.classList.add("plantConfirmationButton");
  removeplantButton.addEventListener("click", resetPlant);
}
//plant logic

async function userWateredPlant() {
  let data = await browser.runtime.sendMessage({
    action: "getPlantAppData",
  });
  data.lastWaterTime = new Date();
  await browser.runtime.sendMessage({
    action: "setPlantAppData",
    data: data,
  });
  updatePlantBottomUI(data);
}

function calculateGrowth(data) {
  const currentTime = new Date();
  const lastGrowTime = new Date(data.lastGrowTime);
  const lastWaterTime = new Date(data.lastWaterTime);
  const msIn1Day = 1000 * 60 * 60 * 24;
  const daysSinceLastGrow = (currentTime - lastGrowTime) / msIn1Day;
  const daysSinceLastWater = (currentTime - lastWaterTime) / msIn1Day;
  if (daysSinceLastGrow >= 2 && data.age != 8) {
    // check if plant should grow
    data.age += 1;
    data.lastGrowTime = currentTime;
  }
  if (data.age > 8) data.age = 8;
  // some bug in previous code
  if (daysSinceLastWater > 3 && data.age != 1) data.isAlive = false;
  // check if plant should die
  if (data.age > 1 && data.birthday == null) data.birthday = currentTime;
  // check if plant is no longer a seed
  if (data.birthday != null && data.isAlive) {
    data.daysSinceBirthday = Math.round(
      (currentTime - new Date(data.birthday)) / (1000 * 60 * 60 * 24) + 1
    );
  }
  browser.runtime.sendMessage({
    action: "setPlantAppData",
    data: data,
  });
  return data;
}
function plantThePlant() {
  const colorArray = [
    "#fcb528",
    "#00adfe",
    "#f474d8",
    "#c9022b",
    "#ff6000",
    "#ff596e",
    "#6024c9",
    "#de51c1",
    "#d8d475",
    "#f5cb04",
  ];
  let plantData = {
    age: 1,
    lastWaterTime: new Date(),
    lastGrowTime: new Date(),
    uniqueColor: colorArray[Math.floor(Math.random() * colorArray.length)],
    plantVersion: plantVersion,
    birthday: null,
    daysSinceBirthday: 0,
    isAlive: true,
  };
  browser.runtime.sendMessage({
    action: "setPlantAppData",
    data: plantData,
  });
  createPlantWidget(document.getElementById("plantWidget"));
}
function createPlantThePlantVisual() {
  let plantThePlantButton = document.createElement("button");
  plantThePlantButton.classList.add("planttheplantbutton");
  plantThePlantButton.addEventListener("click", plantThePlant);
  plantThePlantButton.innerHTML = plantThePlantSvg;
  return plantThePlantButton;
}
function getPlantHTML(data) {
  let age = Number(data.age);
  let isAlive = Boolean(data.isAlive);
  var style = document.documentElement.style;
  switch (age) {
    case 0:
      if (isAlive) {
        return `<div id="planttheplantbutton">
                <svg xmlns="http://www.w3.org/2000/svg" id="plant_the_plant_svg" data-name="Laag 2" viewBox="0 0 50.16 37.5">
                    <defs>
                    <!-- Clip-path for the rising effect -->
                    <clipPath id="riseClip">
                        <rect id="riseMask" x="0" width="100%" height="100%" />
                    </clipPath>
                    </defs>

                    <g id="Laag_1-2" data-name="Laag 1">
                    <!-- Hand (always visible) -->
                    <path id="hand" d="M37.9,25.86c2.24-1.84,4.46-3.51,6.49-5.38,1.57-1.44,3.22-1.07,4.86-.54,1.07.34,1.12,1.48.58,2.21-2.73,3.64-4.62,8.04-9.33,9.89-2.34.93-4.56,2.24-6.72,3.56-2.61,1.59-5.29,1.7-8.12.9-2.57-.73-5.15-1.45-7.72-2.19-2.4-.7-4.72-.6-7.01.49-1.83.87-3.73,1.61-5.56,2.48-.82.39-1.41.26-1.95-.4C1.57,34.61.42,32.03.02,29.12c-.11-.84.18-1.37,1.02-1.7,2.88-1.15,5.54-2.61,8.02-4.54,3.43-2.67,7.51-3.01,11.44-1.45,4.87,1.94,9.81,3.47,14.99,4.29.96.15,1.97.58,1.98,1.79.02,1.18-.96,1.64-1.89,1.92-.64.19-1.37.23-2.03.13-2.15-.3-4.27-.82-6.42-1.01-1.67-.14-3.38.05-5.07.19-.35.03-.67.47-1.1.8.34.2.44.3.49.28,3.91-1.26,7.65.28,11.47.65,1.15.11,2.43.04,3.49-.35,2.12-.78,2.55-2.32,1.48-4.26Z" />

                    <!-- Base layer (accent color) -->
                    <g id="plant-base">
                        <path id="soil-base" d="m24.225089,22.317825c0.83-1.16,1.91-1.43,3.18-1.42,1.22,0.01,2.43-0.1,3.6-0.16l0.815625,-0.14875c0.259688,-0.09078,0.537085,-0.372564,1.034375,-0.03125,0.497285,0.341314,2.57,1.29,2.57,1.29,0.32,0.14,0.77,0.09,1.13,0,1.58-0.38,3-0.16,4.43,1.09-1.24,0.87-2.39,1.69-3.56,2.48-0.21,0.14-0.54,0.25-0.77,0.19-3.81-0.91-7.61-1.85-11.4-2.8-0.34-0.09-0.64-0.31-1.02-0.5z" fill="var(--color-base03)" />
                        <path id="wood-base" d="m35.708097,21.989494c0.358125,-4.223436-2.914655,-7.323267-7.892862,-8.568891-1.348738,-0.337475,3.204784,-0.117303,4.590755,0.780337,1.385971,0.897639,2.382995,1.655288,2.822995,2.405288,1.6,-4.22,0.724749,-11.761929-1.07,-13.588125,2.677757,0.114623,2.618859,8.712593,2.62,11.948125,0.78,-0.32,1.521188,-1.122515,2.665175,-1.684349,1.143986,-0.561834,4.073575,-1.273776,4.073575,-1.273776,1.407048,0.11677-3.52875,1.788125-4.55875,2.448125-2.31,1.48-3,3.67-2.05,6.21,0.08,0.21-0.06107,1.282613-0.422272,1.295496z" fill="var(--color-base03)" />
                        <g class="leaves-base" transform="translate(4.5187525,0.85580096)">
                        <path d="m28.971165,15.089889c-9.708358,-5.5826936-1.103783,-2.20042-0.245054,-0.132915-1.78,1.79-4.468796,1.955165-6.038796,0.08516-0.82,-0.98-1.49,-2.09-2.25,-3.17,1.83,-1.17,3.79,-1.82,5.99,-1.54,1.88,0.24,2.83,2.125,2.95,3.06,0.127187,0.991001-0.40615,1.637511-0.40615,1.697755z" fill="var(--color-base03)" />
                        <path d="m30.787204,6.3513591c-2.92,-0.08-3.52,-1.81-2.38,-6.48999995,1.72,0.38,3.18,1.16999995,4.24,2.59999995,0.96,1.3,0.92,2.23-0.1,3.48-0.322286,0.3350855-1.159736,0.366831-1.76,0.41z" fill="var(--color-base03)" />
                        <path d="m33.560677,11.842939c-0.025,-0.72,0.84,-2.2799998,2.19,-2.6499998,2.41,-0.65,4.54,0.09,6.68,1.3699998-0.8,1.13-1.5,2.31-2.39,3.33-1.54,1.75-3.58,1.79-5.53,0.09l-0.518796,-0.674272c0,0-0.406204,-0.745728-0.431204,-1.465728z" fill="var(--color-base03)" />
                        </g>
                    </g>

                    <!-- Animated layer (real colors, clipped) -->
                    <g id="plant-animated" style="clip-path: url(#riseClip);">
                        <path id="soil" d="m24.225089,22.317825c0.83-1.16,1.91-1.43,3.18-1.42,1.22,0.01,2.43-0.1,3.6-0.16l0.815625,-0.14875c0.259688,-0.09078,0.537085,-0.372564,1.034375,-0.03125,0.497285,0.341314,2.57,1.29,2.57,1.29,0.32,0.14,0.77,0.09,1.13,0,1.58-0.38,3-0.16,4.43,1.09-1.24,0.87-2.39,1.69-3.56,2.48-0.21,0.14-0.54,0.25-0.77,0.19-3.81-0.91-7.61-1.85-11.4-2.8-0.34-0.09-0.64-0.31-1.02-0.5z" fill="#9d8a71" />
                        <path id="wood" d="m35.708097,21.989494c0.358125,-4.223436-2.914655,-7.323267-7.892862,-8.568891-1.348738,-0.337475,3.204784,-0.117303,4.590755,0.780337,1.385971,0.897639,2.382995,1.655288,2.822995,2.405288,1.6,-4.22,0.724749,-11.761929-1.07,-13.588125,2.677757,0.114623,2.618859,8.712593,2.62,11.948125,0.78,-0.32,1.521188,-1.122515,2.665175,-1.684349,1.143986,-0.561834,4.073575,-1.273776,4.073575,-1.273776,1.407048,0.11677-3.52875,1.788125-4.55875,2.448125-2.31,1.48-3,3.67-2.05,6.21,0.08,0.21-0.06107,1.282613-0.422272,1.295496z" fill="#5b4511" />
                        <g class="leaves" transform="translate(4.5187525,0.85580096)">
                        <path d="m28.971165,15.089889c-9.708358,-5.5826936-1.103783,-2.20042-0.245054,-0.132915-1.78,1.79-4.468796,1.955165-6.038796,0.08516-0.82,-0.98-1.49,-2.09-2.25,-3.17,1.83,-1.17,3.79,-1.82,5.99,-1.54,1.88,0.24,2.83,2.125,2.95,3.06,0.127187,0.991001-0.40615,1.637511-0.40615,1.697755z"  />
                        <path d="m30.787204,6.3513591c-2.92,-0.08-3.52,-1.81-2.38,-6.48999995,1.72,0.38,3.18,1.16999995,4.24,2.59999995,0.96,1.3,0.92,2.23-0.1,3.48-0.322286,0.3350855-1.159736,0.366831-1.76,0.41z"  />
                        <path d="m33.560677,11.842939c-0.025,-0.72,0.84,-2.2799998,2.19,-2.6499998,2.41,-0.65,4.54,0.09,6.68,1.3699998-0.8,1.13-1.5,2.31-2.39,3.33-1.54,1.75-3.58,1.79-5.53,0.09l-0.518796,-0.674272c0,0-0.406204,-0.745728-0.431204,-1.465728z"  />
                        </g>
                    </g>
                    </g>
                </svg>
                </div>`;
      }
      return `Stage 0 died, how? How have you done this? This is the stage before the plant is planted and you've already managed to kill it????`;
    case 1:
      if (isAlive) {
        return `<svg class="plant1" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 11.84 21.54">
                    <g id="Laag_1-2" data-name="Laag 1">
                        <path style="fill: #9d8a71" d="M2.01.08C-.23.84-.06,6.65.07,11.26c.14,4.89.26,7.69,2.43,9.23,2.18,1.55,5.8,1.38,7.78-.49,2.72-2.56,1.24-7.3.49-9.72C9.05,4.83,4.48-.75,2.01.08Z"/>
                    </g>
                    </svg>`;
      }
      return `HOW DID YOU KILL A SEED???`;
    case 2:
      if (isAlive) {
        return `<svg class="plant2" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 38.55 66.25">
                    <defs>
                        <style>
                        .cls-1 {
                            fill: #457604!important;
                        }

                        .cls-1, .cls-2, .cls-3 {
                            stroke-width: 0px;
                        }

                        .cls-2 {
                            fill: #9d8a71 !important;
                        }

                        .cls-3 {
                            fill: #604725!important;
                        }
                        </style>
                    </defs>
                    <g id="Laag_1-2" data-name="Laag 1">
                        <path class="cls-2" d="M26.14,66.22l-.43.03c-.92-4.95-3.11-9.79-7.87-11.89-2.81-.97-5.73-4.6-5.08-7.89.43-3.22,2.03-5.7,4.24-7.54l.38.19c-.05,4.87-1.97,9.3,2.24,12.35,4.89,3.08,6.95,9.27,6.51,14.76Z"/>
                        <path class="cls-3" d="M19.81,27.16c-.35.3-1.03.84-1.35,1.35.97,2.92.08,9.27-.11,10.6l-2.68-.41c.57-3.7.78-8.38.16-9.49-.97-1.65-3-2.27-3.03-2.27l.24-.81-.38.95-.76-7.46c1.76,3.19,1.89,4.54,1.89,4.54l-.08.22c.43.16,1.84.68,3.11,1.84.46-.51.95-.92,1.3-1.19.11-.08.22-.16.27-.22l.89.92,1.22-.92c.84,1.11-.32,2.03-.7,2.35Z"/>
                        <g>
                        <path class="cls-1" d="M13.25,27.05l1.39-2.29S16.08,12.1.22,12.24c0,0-2.99,11.88,13.03,14.81Z"/>
                        <path class="cls-1" d="M18.4,24.81l1.73,2.06S44,17.12,37.4.12c0,0-17.96-3.33-18.99,24.69Z"/>
                        </g>
                    </g>
                    </svg>`;
      }
      return `<svg class="plant2" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 38.55 66.25">
  <defs>
    <style>
      .cls-1 {
        fill: #457604!important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #9d8a71 !important;
      }

      .cls-3 {
        fill: #604725!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-2" d="M26.14,66.22l-.43.03c-.92-4.95-3.11-9.79-7.87-11.89-2.81-.97-5.73-4.6-5.08-7.89.43-3.22,2.03-5.7,4.24-7.54l.38.19c-.05,4.87-1.97,9.3,2.24,12.35,4.89,3.08,6.95,9.27,6.51,14.76Z" id="path1"/>
<path class="cls-3" d="m 19.81,27.16 c -0.35,0.3 -1.03,0.84 -1.35,1.35 0.97,2.92 1.033125,11.348125 -0.11,10.6 L 15.67,38.7 c -1.539375,0.534375 0.78,-8.38 0.16,-9.49 -0.97,-1.65 -2.562287,-2.171162 -2.592287,-2.171162 L 13.04,26.13 l 0.04453,-0.01416 0.09672,-1.402089 c 0.127188,0.05719 0.507188,-0.280313 0.507188,-0.280313 L 13.71,24.38 c 0.43,0.16 1.84,0.68 3.11,1.84 0.46,-0.51 0.95,-0.92 1.3,-1.19 0.11,-0.08 0.22,-0.16 0.27,-0.22 L 19.397187,24.081563 20.5,24.81 c 0.84,1.11 -0.32,2.03 -0.7,2.35 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccc"/>
<g id="g4"/>
<path style="fill:#f4f2ef;fill-opacity:1;stroke:none;stroke-width:1.431;stroke-miterlimit:5.6;paint-order:fill markers stroke" d="m 12.0625,19.6875 c -0.136785,-0.102589 -0.08817,-0.05692 -0.15625,-0.125" id="path5"/>
<path style="fill:#f4f2ef;fill-opacity:1;stroke:none;stroke-width:1.431;stroke-miterlimit:5.6;paint-order:fill markers stroke" d="M 11.90625,19.59375 8.65625,18.5" id="path6"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:7.631;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 17.169437,26.770621 c -2.559246,4.463369 -17.73916973,-9.930403 -12.0707041,-8.49214 0.9287846,0.235661 5.3973831,3.8628 5.3973831,3.8628 m 11.026447,-2.474874" id="path14" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:7.631;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 30.328979,19.163999 c 1.224717,-8.441955 -17.326258,9.561684 -11.657792,8.123421 0.928784,-0.235661 7.583457,-5.766323 7.583457,-5.766323" id="path14-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:5.16583;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 7.8841287,23.009148 c 1.6772356,3.121029 11.6255993,-6.943875 7.9106953,-5.938163 -0.608691,0.164787 -3.537246,2.701078 -3.537246,2.701078 M 5.0312501,18.041498" id="path14-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:5.16583;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 25.321629,19.134007 c 1.677235,-3.121029 11.625599,6.943875 7.910695,5.938163 -0.608691,-0.164787 -3.537246,-2.701078 -3.537246,-2.701078 m -7.226328,1.730565" id="path14-2-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:5.16583;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 25.691215,21.767008 c -2.909202,2.022494 -7.218185,-11.457302 -4.362028,-8.877702 0.467985,0.42267 1.9297,4.01051 1.9297,4.01051 m 7.226205,1.731078" id="path14-2-4-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
<path style="fill:#5b4511;fill-opacity:1;stroke:none;stroke-width:5.16583;stroke-miterlimit:5.6;stroke-dasharray:none;paint-order:stroke fill markers" d="m 14.834057,26.075254 c 0.178028,-3.538679 -13.5413244,-0.06714 -9.8415113,0.992747 0.6062184,0.173662 4.4243081,-0.483146 4.4243081,-0.483146 m 5.2907142,5.217567" id="path14-2-49" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csc"/>
</g>
</svg>`;
    case 3:
      if (isAlive) {
        return `<svg class="plant3" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 62.54 117.42">
  <defs>
    <style>
      .cls-1 {
        fill: #457604!important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #9d8a71 !important;
      }

      .cls-3 {
        fill: #604725!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-2" d="m 38.14,93.55 c -1.81,5.33 -3.46,9.27 2.43,12.16 2.19,1.46 4.49,2.51 6.92,3.89 1.38,0.65 2.22,2.27 1.97,3.81 -0.11,1.41 -0.46,2.7 -0.89,4 l -0.41,-0.14 c 0.32,-1.78 0.76,-3.92 0,-5.57 -2.27,-2 -5.92,-2.49 -8.65,-4.16 -2.57,-1.16 -5.68,-3.3 -5.81,-6.54 -0.49,-4.65 1.7,-8.41 1.92,-12.62 -4.87,4.49 -10.38,14.43 -17.03,8.22 l 0.24,-0.32 c 2.27,0.87 4.7,0.7 6.11,-1.35 1.92,-2.32 7.048197,-7.682046 11.250089,-8.375077 l 2.649093,0.03128 c 0,0.49 0.05636,1.112615 0.690818,1.553795 1.95,2 3.048434,6.108792 4.876958,6.635392 C 48.7917,96.142257 50.535,101.45187 51.45,104.12 l -0.38,0.22 c -2.46,-2.59 -3.467961,-4.890281 -8.3,-6.540002 -2.346175,-1.115761 -4.10625,-3.590625 -4.53875,-5.005625 L 38.12,93.549998 Z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccccccccccccccc"/>
<path class="cls-3" d="m 44.81,27.73 c -1.32,0.62 -3.57,5.43 -5.54,14.89 -0.27,1.3 -0.41,2.62 -0.41,3.95 V 86.6 h -2.7 V 57.49 c 0,-2 -8.11,-10.6 -15.6,-17.41 l 1.81,-2 c 2.73,2.49 9.87,9.11 13.79,14.25 v -5.76 c 0,-0.87 0.05,-1.76 0.16,-2.62 l -0.105313,1.233125 C 35.434687,38.503125 34.29,29.79 33.84,28.82 l 2.35,-1.35 c 0.51,0.89 1.19,4.97 1.76,9.08 1.76,-6.54 3.7,-10.33 5.76,-11.27 l 1.11,2.46 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccsccscccscccccccc"/>
<g id="g5">
  <path class="cls-1" d="m 22.391049,38.123146 -1.804476,1.955805 C 20.586573,40.078951 0.91,40.7 0,16.4 c 0,0 23.081049,-0.816854 22.391049,21.723146 z" id="path3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccc"/>
  <path class="cls-1" d="m 36.19,27.49125 -2.35,1.357813 c 0,0 -12.94,-7.719063 -5.65,-21.319063 0,0 14.49,7.76125 8,19.96125 z" id="path4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccc"/>
  <path class="cls-1" d="m 43.7,25.27 c 0,0 -2.88,-23.87 14.74,-25.27 0,0 15.432656,10.643906 -13.647344,27.733906 l -1.090469,-2.424844 z" id="path5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccc"/>
</g>
</g>
</svg>`;
      }
      return `<svg class="plant3" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 62.54 117.42">
  <defs>
    <style>
      .cls-1 {
        fill: #457604!important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #9d8a71 !important;
      }

      .cls-3 {
        fill: #604725!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-2" d="m 38.14,93.55 c -1.81,5.33 -3.46,9.27 2.43,12.16 2.19,1.46 4.49,2.51 6.92,3.89 1.38,0.65 2.22,2.27 1.97,3.81 -0.11,1.41 -0.46,2.7 -0.89,4 l -0.41,-0.14 c 0.32,-1.78 0.76,-3.92 0,-5.57 -2.27,-2 -5.92,-2.49 -8.65,-4.16 -2.57,-1.16 -5.68,-3.3 -5.81,-6.54 -0.49,-4.65 1.7,-8.41 1.92,-12.62 -4.87,4.49 -10.38,14.43 -17.03,8.22 l 0.24,-0.32 c 2.27,0.87 4.7,0.7 6.11,-1.35 1.92,-2.32 5.078046,-6.700651 11.157348,-8.319628 l 2.81642,0.01963 c 0,0.49 -0.128512,0.744837 0.616232,1.51 1.95,2 3.19,4.41 4.7,6.6 3.73,1.65 5.68,5.79 7.22,9.38 l -0.38,0.22 c -2.46,-2.59 -4.7,-5.81 -8.3,-6.54 -2.24,-1.16 -3.7,-2.7 -4.57,-4.49 l -0.08,0.24 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccccccccccccccc"/>
<path class="cls-3" d="m 44.81,27.73 c -1.32,0.62 -3.57,5.43 -5.54,14.89 -0.27,1.3 -0.41,2.62 -0.41,3.95 V 86.668698 L 36.150186,86.64907 36.16,57.49 c 6.73e-4,-2 -8.074608,-10.529217 -15.564608,-17.339217 L 22.37,38.08 c 2.73,2.49 9.87,9.11 13.79,14.25 v -5.76 c 0,-0.87 -0.01939,-1.773879 0.16,-2.62 l -0.09061,0.918257 C 35.449395,38.188257 34.29,29.79 33.84,28.82 l 2.35,-1.35 c 0.51,0.89 1.19,4.97 1.76,9.08 1.76,-6.54 3.7,-10.33 5.76,-11.27 l 1.11,2.46 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccsccscccscccccccc"/>
<path style="fill:#5b4511;stroke-width:4.46097;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 22.339884,41.778417 c -7.678986,-5.926778 -7.499151,-9.663743 -7.499151,-9.663743 l 0.161853,-0.547454 c 0,0 0.686492,-1.782728 2.158029,0.0238 1.240865,1.523348 1.824056,3.951263 4.262106,5.73636 2.535685,1.85658 2.421002,2.012374 2.21198,3.451336 -0.230207,1.584801 -1.294817,0.999698 -1.294817,0.999698 z" id="path5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:4.46097;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 43.86795,28.77585 c 7.678986,-5.926778 7.499151,-9.663743 7.499151,-9.663743 l -0.161853,-0.547454 c 0,0 -0.686492,-1.782728 -2.158029,0.0238 -1.240865,1.523348 -1.824056,3.951263 -4.262106,5.73636 -2.535685,1.85658 -2.421002,2.012374 -2.21198,3.451336 0.230207,1.584801 1.294817,0.999698 1.294817,0.999698 z" id="path5-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:4.46097;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 32.718845,18.582469 c 5.205076,8.185397 3.764823,11.638355 3.764823,11.638355 l -0.33842,0.459754 c 0,0 -1.251956,1.442911 -2.021249,-0.756441 -0.648701,-1.854596 -0.371254,-4.336108 -2.056716,-6.84407 -1.75296,-2.608394 -1.592122,-2.715888 -0.906096,-3.997946 0.755555,-1.411993 1.557657,-0.499649 1.557657,-0.499649 z" id="path5-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.2777;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 24.826682,44.609806 c -6.975583,-1.471232 -8.045741,-4.0003 -8.045741,-4.0003 l -0.06697,-0.413715 c 0,0 -0.112404,-1.398065 1.437822,-0.672467 1.307219,0.611858 2.466454,2.031755 4.65042,2.434951 2.271425,0.419339 2.245003,0.558957 2.564444,1.577379 0.351815,1.12164 -0.539979,1.074149 -0.539979,1.074149 z" id="path5-7-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.2777;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 52.226508,28.193686 c -6.869466,1.906232 -8.984021,0.154067 -8.984021,0.154067 L 42.992531,28.01135 c 0,0 -0.743572,-1.189252 0.966639,-1.259029 1.442127,-0.05884 3.124988,0.667737 5.249285,0.01994 2.209365,-0.673738 2.250204,-0.537637 3.002735,0.219281 0.828798,0.833632 0.01531,1.202139 0.01531,1.202139 z" id="path5-7-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.2777;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 35.251155,26.980539 c 4.544881,-5.492481 3.808783,-8.138153 3.808783,-8.138153 l -0.205029,-0.365525 c 0,0 -0.78201,-1.164337 -1.543979,0.368339 -0.642525,1.292422 -0.666378,3.125278 -2.125059,4.79995 -1.517096,1.741733 -1.409531,1.834582 -1.025835,2.830576 0.422585,1.096937 1.091119,0.50481 1.091119,0.50481 z" id="path5-7-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.36229;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 21.296964,38.752476 c 1.955474,-6.855839 0.10686,-9.020797 0.10686,-9.020797 l -0.353972,-0.258926 c 0,0 -1.250515,-0.774676 -1.313236,0.941593 -0.05289,1.447234 0.718576,3.154618 0.05277,5.273339 -0.692532,2.203547 -0.549627,2.247766 0.247978,3.021347 0.878443,0.851982 1.259595,0.04345 1.259595,0.04345 z" id="path5-7-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
</g>
</svg>`;
    case 4:
      if (isAlive) {
        return `<svg class="plant4" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 45.58 126.74">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
  <g id="Laag_1-2" data-name="Laag 1">
    <path class="cls-1" d="M43.68,112.12c-1.18-1.16-2.31-2.35-3.39-3.58.27.78.36,1.62.02,2.46-.19.47-.5,1.25-1.18,1.16-.16-.72-.78-1.3-1.02-2.07-.3-.66-.14-1.43-.24-2.18-.09-.82-.19-1.65-.3-2.48-2.62-3.11-5.13-6.29-7.78-9.35-.75-.82-1.58-1.52-2.56-2.05-.39-.25-.91-.56-1.47-.91.16.72.42,1.43.78,2.01.91,1.16,2.04,2.27,2.51,3.7.56,1.22.86,3.06,1.16,4.36.69,3.84,2.23,7.5,2.71,11.37.38-.13.86-.13,1.19.02,1.77.41,2.82,1.76,3.75,3.14,1.27,1.68,2.45,3.4,3.47,5.24l-.19.16c-1.6-1.33-3.14-2.73-4.71-4.03-1.21-.89-2.37-1.76-3.17-3-.09-.16-.27-.31-.19-.42.09-.17.03-.2-.06-.14.02.17.03.36.03.53.36,2.48-1.05,6.73,2.26,7.42l.02.25c-3.61-.41-2.56-5.11-3-7.61-.27-2.93-1.3-5.55-2.27-8.34-.44-1.41-.82-2.82-1.21-4.25-.47-1.91-.97-4.22-2.26-5.74-.33-.28-.63-.58-.88-.91.08,3.04.16,6.34.11,7.43.06,1.8-1.33,3.28-1.77,4.94-.2.72-.22,1.41-.24,2.34-.25,1.44-.56,2.81-1.04,4.19-.45,1.35-1,2.76-2.13,3.92-1.66,1.84-2.6,4.67-3.53,7.04l-.25-.06c.16-1.38.44-2.73.8-4.08.49-2.62,2.64-4.58,3.14-7.39.27-1.02.6-3.25.64-3.73,0-.08-.02-.17,0-.27-.47.19-1.05.27-1.66-.03l-.08-.24c.28-1.52.38-1.93,1.63-2.62.17-.14.33-.27.5-.42.35-.99.91-1.84,1.29-2.81.31-1.08.22-2.21.25-3.43l.13-4.94c-.11.11-.22.2-.35.28-2.74,1.35-4.8,3.06-7.04,5.14-.82,2.65-3.47,8.7-5.76,12.06-1.73,2.2-4.23,3.53-6.56,4.99l-.13-.2c1.54-1.1,3.2-2.2,4.58-3.51-.82.19-1.62.36-2.4.53-.53.09-1.05.42-1.58.27-.53-.16-1.05-.38-1.65-1l-.03-.25c.89-1.29,1.98-1.47,3.26-.99.99.22,1.99.47,2.95.88.35-.35.64-.74.93-1.13,2.29-3.92,3.7-8.31,5.19-12.58,2.05-2.1,4.5-4.39,7.14-5.77.44-.35.75-.82.97-1.33-1.24.72-2.62,1.25-3.86,1.85-3.18,1.1-7.07,3.36-10.46,2.13-1.07-.3-1.62-.27-2.67.27-1.98.97-3.94,2.2-5.9,3.36l-.16-.19c2.49-2.16,5.38-6.12,9.11-5.4,1.19.2,1.98.24,2.85-.08,3.06-1.16,6.31-2.38,9.32-3.75.58-.28,1.16-.55,1.69-.89h6.98c2.59.89,4.99,2.43,7.21,4.05.06.05.14.08.2.11,1.02-.08,1.65.24,2.12.94.58.19,1.18.35,1.79.49l-.06.24c-.5-.03-.99-.11-1.46-.22,0,.02.02.05.03.08.55.86,1.1,1.74,1.54,2.71l-.16.17c-.99-.42-1.88-.94-2.76-1.47-.42-.28-1-.41-1.24-.88-.14-.25-.45-1.08-.33-1.65-1.35-.64-2.64-1.43-3.87-2.13-1.52-.75-3.22-1.27-4.94-1.49.42.22.77.41.93.49,2.87,1.82,5.13,4.52,7.29,7.04,1.51,1.91,2.92,3.89,4.23,5.94.47-.05.94-.08,1.4-.09.39-.02.83-.22,1.15.05.25.2.91.93.74,1.6-.53.56-.97.72-1.38.78-.27.05-.47-.11-.69-.28.78,1.33,1.52,2.71,2.2,4.11l-.2.14Z"/>
    <path class="cls-2" d="M34.85,29.4c.14.11.31.11.36.09-.45.13-1.76,1.47-3.11,3.15-.5,2.45-1.04,4.96-1.57,7.39.55-.52,1.07-.99,1.44-1.21l.8,1.33c-.55.33-1.87,1.68-2.89,2.81-1.38,6.26-2.7,11.67-3.54,13.79v34.63h-2.46v-33.14c-.28-.91-.66-2.09-1.08-3.4-.8-2.49-1.77-5.52-2.65-8.42l-.38-.44.11-.09-.13.02s0,.05.02.08c-.35-.35-2.09-.8-3.76-.99l.16-1.55c1.11.13,2.32.3,3.28.66-.42-1.47-.82-2.87-1.11-4.08-1.44-1.66-3.94-3.81-5.05-3.39l-.56-1.46c1.58-.63,3.59.71,5.05,2.02-.03-.17-.05-.33-.06-.47-.25-3.54-5.13-7.28-5.19-7.32l.96-1.25c.16.13,3.12,2.38,4.75,5.29l.06-.44,1.55.25-.55,3.48c.27,2.87,3.22,12.09,5,17.65.05.16.09.3.14.44,1.43-4.45,3.94-16.14,5.91-25.77l-.25.17c-.38-.56-1.14-1.36-1.6-1.41l.16-1.57c.78.08,1.51.66,2.02,1.21,1.44-7.09,2.51-12.7,2.54-12.85l2.42.45c-.13.61-1.33,6.9-2.89,14.46.83-.83,1.65-1.47,2.24-1.57.3-.05.61.05.83.22l-.97,1.24Z"/>
    <g>
      <path class="cls-3" d="M16.17,43.44c-3.51-3.32-6.82.23-6.82.23,3.07,3.49,6.67,1.32,6.67,1.32l.16-1.55Z"/>
      <path class="cls-3" d="M13.28,36.63s-8.15,2.92-9.72-2.51c0,0,6.62-3.92,9.15,1.05l.56,1.46Z"/>
      <path class="cls-3" d="M12.51,29.4s-10.45.22-8.7-6.35c0,0,3.56-1.16,5.92-.35,0,0-1.29-7.98,1.76-8.49,0,0,8.37,2.27,5.5,12.97,0,0-3.12,2.27-4.48,2.23Z"/>
      <path class="cls-3" d="M18.29,32.99s-.34-4.78,4.24-5.43c0,0,3.03,4.75-2.69,5.68l-1.55-.25Z"/>
      <path class="cls-3" d="M28.5,27.8s-8.35-2.9-7.06-8.1c0,0,5.96-3.4,7.22,6.53l-.16,1.57Z"/>
      <path class="cls-3" d="M32.13,20.17s-12.34-3.78-8.8-14.36c0,0,6.91.93,9.21,12.26l-.41,2.1Z"/>
      <path class="cls-3" d="M33.22,14.59s-4.4-9.36,3.06-14.59c0,0,5.91,5.41-.64,15.05l-2.42-.45Z"/>
      <path class="cls-3" d="M34.54,20.61s1.21-6.96,8.5-5.56c0,0,5.69,4.21-8.84,7.27l.34-1.71Z"/>
      <path class="cls-3" d="M34.99,27.94s.76-7.17,10.59-4.47c0,0-2.87,8.87-10.37,6.02l-.22-1.55Z"/>
      <path class="cls-3" d="M31.98,38.83s1.84-5.04,6.74-3.4c0,0,.5,4.35-5.94,4.74l-.8-1.33Z"/>
    </g>
  </g>
</svg>`;
      }
      return `<svg class="plant4" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 45.58 126.74">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="M43.68,112.12c-1.18-1.16-2.31-2.35-3.39-3.58.27.78.36,1.62.02,2.46-.19.47-.5,1.25-1.18,1.16-.16-.72-.78-1.3-1.02-2.07-.3-.66-.14-1.43-.24-2.18-.09-.82-.19-1.65-.3-2.48-2.62-3.11-5.13-6.29-7.78-9.35-.75-.82-1.58-1.52-2.56-2.05-.39-.25-.91-.56-1.47-.91.16.72.42,1.43.78,2.01.91,1.16,2.04,2.27,2.51,3.7.56,1.22.86,3.06,1.16,4.36.69,3.84,2.23,7.5,2.71,11.37.38-.13.86-.13,1.19.02,1.77.41,2.82,1.76,3.75,3.14,1.27,1.68,2.45,3.4,3.47,5.24l-.19.16c-1.6-1.33-3.14-2.73-4.71-4.03-1.21-.89-2.37-1.76-3.17-3-.09-.16-.27-.31-.19-.42.09-.17.03-.2-.06-.14.02.17.03.36.03.53.36,2.48-1.05,6.73,2.26,7.42l.02.25c-3.61-.41-2.56-5.11-3-7.61-.27-2.93-1.3-5.55-2.27-8.34-.44-1.41-.82-2.82-1.21-4.25-.47-1.91-.97-4.22-2.26-5.74-.33-.28-.63-.58-.88-.91.08,3.04.16,6.34.11,7.43.06,1.8-1.33,3.28-1.77,4.94-.2.72-.22,1.41-.24,2.34-.25,1.44-.56,2.81-1.04,4.19-.45,1.35-1,2.76-2.13,3.92-1.66,1.84-2.6,4.67-3.53,7.04l-.25-.06c.16-1.38.44-2.73.8-4.08.49-2.62,2.64-4.58,3.14-7.39.27-1.02.6-3.25.64-3.73,0-.08-.02-.17,0-.27-.47.19-1.05.27-1.66-.03l-.08-.24c.28-1.52.38-1.93,1.63-2.62.17-.14.33-.27.5-.42.35-.99.91-1.84,1.29-2.81.31-1.08.22-2.21.25-3.43l.13-4.94c-.11.11-.22.2-.35.28-2.74,1.35-4.8,3.06-7.04,5.14-.82,2.65-3.47,8.7-5.76,12.06-1.73,2.2-4.23,3.53-6.56,4.99l-.13-.2c1.54-1.1,3.2-2.2,4.58-3.51-.82.19-1.62.36-2.4.53-.53.09-1.05.42-1.58.27-.53-.16-1.05-.38-1.65-1l-.03-.25c.89-1.29,1.98-1.47,3.26-.99.99.22,1.99.47,2.95.88.35-.35.64-.74.93-1.13,2.29-3.92,3.7-8.31,5.19-12.58,2.05-2.1,4.5-4.39,7.14-5.77.44-.35.75-.82.97-1.33-1.24.72-2.62,1.25-3.86,1.85-3.18,1.1-7.07,3.36-10.46,2.13-1.07-.3-1.62-.27-2.67.27-1.98.97-3.94,2.2-5.9,3.36l-.16-.19c2.49-2.16,5.38-6.12,9.11-5.4,1.19.2,1.98.24,2.85-.08,3.06-1.16,6.31-2.38,9.32-3.75.58-.28,1.16-.55,1.69-.89h6.98c2.59.89,4.99,2.43,7.21,4.05.06.05.14.08.2.11,1.02-.08,1.65.24,2.12.94.58.19,1.18.35,1.79.49l-.06.24c-.5-.03-.99-.11-1.46-.22,0,.02.02.05.03.08.55.86,1.1,1.74,1.54,2.71l-.16.17c-.99-.42-1.88-.94-2.76-1.47-.42-.28-1-.41-1.24-.88-.14-.25-.45-1.08-.33-1.65-1.35-.64-2.64-1.43-3.87-2.13-1.52-.75-3.22-1.27-4.94-1.49.42.22.77.41.93.49,2.87,1.82,5.13,4.52,7.29,7.04,1.51,1.91,2.92,3.89,4.23,5.94.47-.05.94-.08,1.4-.09.39-.02.83-.22,1.15.05.25.2.91.93.74,1.6-.53.56-.97.72-1.38.78-.27.05-.47-.11-.69-.28.78,1.33,1.52,2.71,2.2,4.11l-.2.14Z" id="path1"/>
<path class="cls-2" d="M34.85,29.4c.14.11.31.11.36.09-.45.13-1.76,1.47-3.11,3.15-.5,2.45-1.04,4.96-1.57,7.39.55-.52,1.07-.99,1.44-1.21l.8,1.33c-.55.33-1.87,1.68-2.89,2.81-1.38,6.26-2.7,11.67-3.54,13.79v34.63h-2.46v-33.14c-.28-.91-.66-2.09-1.08-3.4-.8-2.49-1.77-5.52-2.65-8.42l-.38-.44.11-.09-.13.02s0,.05.02.08c-.35-.35-2.09-.8-3.76-.99l.16-1.55c1.11.13,2.32.3,3.28.66-.42-1.47-.82-2.87-1.11-4.08-1.44-1.66-3.94-3.81-5.05-3.39l-.56-1.46c1.58-.63,3.59.71,5.05,2.02-.03-.17-.05-.33-.06-.47-.25-3.54-5.13-7.28-5.19-7.32l.96-1.25c.16.13,3.12,2.38,4.75,5.29l.06-.44,1.55.25-.55,3.48c.27,2.87,3.22,12.09,5,17.65.05.16.09.3.14.44,1.43-4.45,3.94-16.14,5.91-25.77l-.25.17c-.38-.56-1.14-1.36-1.6-1.41l.16-1.57c.78.08,1.51.66,2.02,1.21,1.44-7.09,2.51-12.7,2.54-12.85l2.42.45c-.13.61-1.33,6.9-2.89,14.46.83-.83,1.65-1.47,2.24-1.57.3-.05.61.05.83.22l-.97,1.24Z" id="path2"/>
<path style="fill:#5b4511;stroke-width:2.56274;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 12.959856,29.915911 C 9.2371339,25.881215 9.3243173,23.337252 9.3243173,23.337252 l 0.078461,-0.372685 c 0,0 0.3328069,-1.213604 1.0461987,0.01621 0.601563,1.03703 0.88429,2.689849 2.06624,3.905067 1.229282,1.263879 1.173686,1.369936 1.072353,2.349519 -0.111599,1.078864 -0.627718,0.680551 -0.627718,0.680551 z" id="path5-7-14" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 20.526691,28.085345 c 0.09572,4.619641 -1.385329,6.068173 -1.385329,6.068173 l -0.258561,0.172697 c 0,0 -0.890925,0.515868 -0.65333,-0.638823 0.200348,-0.973685 0.947711,-2.118923 0.880451,-3.546828 -0.06996,-1.485086 0.02469,-1.514221 0.637888,-2.031239 0.675345,-0.56942 0.778885,-0.02398 0.778885,-0.02398 z" id="path5-7-14-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.55417;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 30.023984,29.971532 c -4.877067,-5.923563 -4.762849,-9.658498 -4.762849,-9.658498 l 0.102786,-0.547159 c 0,0 0.436006,-1.781762 1.370604,0.02379 0.788097,1.522521 1.158493,3.949118 2.706941,5.733248 1.610461,1.855571 1.537625,2.011279 1.404871,3.44946 -0.146204,1.583942 -0.822362,0.999155 -0.822362,0.999155 z" id="path5-7-14-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.107995,26.068441 c -2.779241,3.69135 -4.838774,3.915116 -4.838774,3.915116 l -0.310005,-0.02398 c 0,0 -1.019249,-0.144905 -0.11895,-0.905973 0.759169,-0.641766 2.054433,-1.080413 2.88386,-2.244667 0.862639,-1.21088 0.955056,-1.175306 1.756654,-1.202913 0.882839,-0.03041 0.627216,0.462424 0.627216,0.462424 z" id="path5-7-14-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.7637;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 38.089241,35.593564 c -3.616712,4.56424 -6.387077,4.90196 -6.387077,4.90196 l -0.419072,-0.01906 c 0,0 -1.380218,-0.142748 -0.19301,-1.094351 1.001099,-0.802432 2.732711,-1.375954 3.80982,-2.813996 1.12024,-1.495632 1.246193,-1.455494 2.326592,-1.514833 1.189897,-0.06536 0.862754,0.54029 0.862754,0.54029 z" id="path5-7-14-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 16.106542,45.022437 C 12.016419,42.872755 11.464478,40.87598 11.464478,40.87598 l -0.02616,-0.309828 c 0,0 -0.02083,-1.029288 0.875067,-0.263046 0.755461,0.646127 1.396626,1.85403 2.679075,2.485506 1.333806,0.656762 1.313551,0.753696 1.469663,1.54043 0.171936,0.866469 -0.355581,0.693397 -0.355581,0.693397 z" id="path5-7-14-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 8.1076113,33.539617 c 4.6037547,0.394574 5.8871107,2.020841 5.8871107,2.020841 l 0.144336,0.275399 c 0,0 0.418507,0.940594 -0.704487,0.581921 -0.946959,-0.302444 -2.00651,-1.167009 -3.433499,-1.251507 -1.484157,-0.08787 -1.5030939,-0.185067 -1.9521894,-0.849623 -0.4946084,-0.73191 0.058731,-0.777037 0.058731,-0.777037 z" id="path5-7-14-76" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.53278;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 32.900688,15.885601 c 1.904566,-6.9979271 4.977419,-8.4882339 4.977419,-8.4882339 l 0.500677,-0.1394805 c 0,0 1.689844,-0.3614113 0.785328,1.2659054 -0.762723,1.3722229 -2.498201,2.747823 -3.025168,4.928394 -0.548065,2.267895 -0.716128,2.267655 -1.951473,2.760182 -1.360543,0.542449 -1.286792,-0.326771 -1.286792,-0.326771 z" id="path5-7-14-70" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 33.363388,16.506035 c -3.251083,-3.283398 -3.174945,-5.353652 -3.174945,-5.353652 l 0.06852,-0.303287 c 0,0 0.290643,-0.9876205 0.913653,0.01319 0.52535,0.843925 0.772258,2.188974 1.804464,3.177907 1.073543,1.028533 1.02499,1.114841 0.936495,1.912017 -0.09746,0.87797 -0.548191,0.553826 -0.548191,0.553826 z" id="path5-7-14-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 27.404932,46.360694 c -3.251083,-3.283398 -3.174945,-5.353652 -3.174945,-5.353652 l 0.06852,-0.303287 c 0,0 0.290643,-0.98762 0.913653,0.01319 0.52535,0.843925 0.772258,2.188974 1.804464,3.177907 1.073543,1.028533 1.02499,1.114841 0.936495,1.912017 -0.09746,0.87797 -0.548191,0.553826 -0.548191,0.553826 z" id="path5-7-14-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.18801;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 14.042477,29.333066 c 2.609461,-4.195771 2.548349,-6.841296 2.548349,-6.841296 l -0.05499,-0.387563 c 0,0 -0.233282,-1.262054 -0.733338,0.01685 -0.421669,1.078431 -0.619848,2.797235 -1.448341,4.060967 -0.861672,1.314336 -0.822701,1.424627 -0.751672,2.443318 0.07822,1.121936 0.440003,0.70772 0.440003,0.70772 z" id="path5-7-14-54" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 32.879898,22.042692 c 2.484326,-3.895943 4.520276,-4.278899 4.520276,-4.278899 l 0.310931,-1.52e-4 c 0,0 1.027422,0.06535 0.188915,0.894006 -0.707064,0.698758 -1.964371,1.236622 -2.700924,2.461746 -0.766045,1.274186 -0.860945,1.245893 -1.657981,1.335639 -0.877815,0.09885 -0.661218,-0.412343 -0.661218,-0.412343 z" id="path5-7-14-63" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 14.222602,36.327473 C 9.985127,38.169767 8.0827862,37.349494 8.0827862,37.349494 L 7.8248608,37.175849 c 0,0 -0.8154688,-0.628392 0.3429786,-0.846936 0.9768522,-0.184287 2.3200756,0.07236 3.6155536,-0.531932 1.347355,-0.628498 1.410239,-0.551999 2.121339,-0.180978 0.783173,0.40862 0.317869,0.711474 0.317869,0.711474 z" id="path5-7-14-95" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.193841,39.387105 c -4.408971,1.382468 -6.213582,0.365055 -6.213582,0.365055 l -0.238053,-0.200021 c 0,0 -0.744221,-0.711338 0.430872,-0.805782 0.990888,-0.07964 2.299314,0.318028 3.651578,-0.145459 1.406415,-0.482051 1.46083,-0.399313 2.128568,0.04504 0.735416,0.48938 0.240616,0.741175 0.240616,0.741175 z" id="path5-7-14-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.92463;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 24.120299,30.148897 c 5.070696,3.1927 5.747598,6.141665 5.747598,6.141665 l 0.03116,0.45727 c 0,0 0.02144,1.518766 -1.087976,0.383626 -0.935503,-0.957199 -1.726625,-2.742681 -3.316713,-3.680961 -1.653765,-0.975853 -1.628192,-1.118772 -1.818689,-2.280355 -0.20981,-1.279309 0.444624,-1.021249 0.444624,-1.021249 z" id="path5-7-14-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.73432;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 26.099724,33.604097 c -1.260152,-3.742835 -0.475649,-4.982513 -0.475649,-4.982513 l 0.157534,-0.151383 c 0,0 0.563142,-0.457382 0.67396,0.489585 0.09345,0.798523 -0.196119,1.760114 0.222798,2.915356 0.435693,1.201504 0.369284,1.229274 0.02325,1.675444 -0.381102,0.491393 -0.601896,0.05351 -0.601896,0.05351 z" id="path5-7-14-84" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.71056;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 35.223803,11.401533 C 33.798023,7.1534889 34.31469,5.6236639 34.31469,5.6236639 l 0.113889,-0.1931216 c 0,0 0.415822,-0.5924004 0.605406,0.5036443 0.159867,0.9242314 0.02153,2.0782902 0.486263,3.3864053 0.48334,1.3604991 0.431584,1.3997591 0.193231,1.9568631 -0.262508,0.613569 -0.489681,0.12407 -0.489681,0.12407 z" id="path5-7-14-31" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 12.002969,27.992898 C 7.4280336,27.344663 6.2364546,25.649999 6.2364546,25.649999 L 6.1075737,25.367036 c 0,0 -0.3659214,-0.962272 0.7355503,-0.542127 0.9288086,0.354284 1.9389936,1.276046 3.359138,1.439228 1.477014,0.169714 1.490554,0.267812 1.902261,0.956156 0.453437,0.758106 -0.101556,0.772608 -0.101556,0.772608 z" id="path5-7-14-67" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.60932;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 18.508556,22.848075 C 16.670312,26.048664 15.43116,26.09908 15.43116,26.09908 l -0.183693,-0.04571 c 0,0 -0.600723,-0.211323 -0.02654,-0.846355 0.48417,-0.535487 1.278083,-0.842537 1.829751,-1.855585 0.573758,-1.053619 0.627127,-1.013722 1.106507,-0.978367 0.527964,0.03894 0.351378,0.475011 0.351378,0.475011 z" id="path5-7-14-10" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.76186;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 26.610872,23.000569 c -3.307558,-2.210601 -3.833565,-3.965744 -3.833565,-3.965744 l -0.03498,-0.266871 c 0,0 -0.06438,-0.880517 0.673893,-0.14417 0.622546,0.620916 1.18169,1.710868 2.216782,2.367674 1.076542,0.683104 1.065184,0.763989 1.224321,1.449885 0.175269,0.755409 -0.246457,0.559229 -0.246457,0.559229 z" id="path5-7-14-61" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 28.268151,25.881247 c -0.375169,-4.605376 1.015484,-6.1409 1.015484,-6.1409 l 0.247633,-0.188031 c 0,0 0.858066,-0.568849 0.6908,0.598106 -0.141044,0.984027 -0.817715,2.172402 -0.664147,3.593618 0.15972,1.478129 0.06701,1.512939 -0.513767,2.066126 -0.63964,0.609254 -0.776006,0.07108 -0.776006,0.07108 z" id="path5-7-14-33" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 22.453795,24.637335 c 4.614049,0.246571 5.948953,1.830799 5.948953,1.830799 l 0.153079,0.270638 c 0,0 0.44849,0.926673 -0.685441,0.60424 -0.956179,-0.271887 -2.042941,-1.10199 -3.471907,-1.140633 -1.48619,-0.04019 -1.508237,-0.13673 -1.978436,-0.786525 -0.517857,-0.71565 0.03375,-0.778523 0.03375,-0.778523 z" id="path5-7-14-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.39203;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 35.885009,20.543724 c 3.407365,0.364514 3.892569,-0.434092 3.892569,-0.434092 l 0.02621,-0.14474 c 0,0 0.03251,-0.504003 -0.71824,-0.437111 -0.633059,0.0564 -1.180157,0.431888 -2.247894,0.296458 -1.110495,-0.140854 -1.095225,-0.08561 -1.235763,0.250529 -0.154792,0.370202 0.283123,0.468968 0.283123,0.468968 z" id="path5-7-14-55" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 41.759214,11.120231 c -3.891078,2.491939 -5.899553,1.984224 -5.899553,1.984224 L 35.57743,12.97398 c 0,0 -0.904924,-0.490896 0.204108,-0.89066 0.935182,-0.3371 2.302119,-0.297048 3.485173,-1.099432 1.230428,-0.834518 1.304664,-0.768978 2.065667,-0.515609 0.838131,0.279044 0.426836,0.651957 0.426836,0.651957 z" id="path5-7-14-22" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
</g>
</svg>`;
    case 5:
      if (isAlive) {
        return `<svg class="plant5" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 59.61 138.61">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1" transform="translate(-2.2664769,-1.6815797)">
<path class="cls-2" d="m 48.949676,40.810673 -0.19,1.25 c -1.57,-0.24 -3.61,0.58 -4.87,1.18 -0.84,1.2 -1.8,2.55 -2.91,4.08 -2.49,3.46 -4.74,6.49 -5.45,7.45 v 43.53 h -2.33 v -42.29 c -2.25,-3.93 -4.95,-7.89 -5.76,-8.06 -1.64,0.39 -4.88,-0.6 -5.25,-0.72 l 0.38,-1.21 c 0.91,0.29 3.49,0.97 4.66,0.69 0.58,-0.14 1.37,0.43 2.25,1.41 -4.8,-6.67 -6.58,-7.07 -7.04,-7.04 l -0.13,-1.26 c 0.72,-0.08 2.88,-0.28 9.59,9.58 0.65,0.97 1.25,1.88 1.72,2.62 -0.48,-10.94 -1.42,-22.04 -2.3,-23.04 l 0.62,-1.08 c 1.59,0.72 2.47,12.8 2.93,23.83 1.06,-1.42 2.58,-3.51 4.22,-5.78 0.33,-0.45 0.64,-0.89 0.93,-1.32 1.12,-3.4 3.46,-10.85 4.14,-15.13 l 1.23,0.2 c -0.49,3.15 -1.82,7.85 -2.96,11.53 4.25,-6.1 5.14,-7.88 5.31,-8.38 l 2.2,0.76 c -0.16,0.47 -0.58,1.69 -4.74,7.73 1.18,-0.42 2.54,-0.7 3.74,-0.53 z" id="path2"/>
<g id="g5" transform="translate(2.5996761,1.8906735)">
  <path class="cls-3" d="m 19.59,45.35 c 0,0 -4.39,1.22 -6.13,-2.09 0,0 4.91,-4.35 6.51,0.88 z" id="path3"/>
  <path class="cls-3" d="m 19.85,39.21 c 0,0 -2.73,1.59 -4.09,0 0,0 -2.33,3.5 -4.16,0 0,0 -2.14,3.3 -3.93,0.49 C 7.3,39.12 6.64,38.79 5.95,38.74 3.83,38.6 -0.03,37.91 2.37,34.52 2.79,33.93 2.68,33.12 2.15,32.62 1.29,31.8 0.69,30.44 3.54,29.01 c 0,0 -5.6,-6.11 3.82,-5.94 0,0 1.41,-2.2 3.5,-0.93 0.95,0.58 2.2,0.5 2.91,-0.35 0.39,-0.47 0.48,-0.99 -0.31,-1.43 -1.95,-1.1 -1.48,-3.52 0,-3.48 0,0 -5.13,-4.54 0.59,-6.96 0,0 -0.85,-3.9 3.99,-4.07 0,0 -1,-8.86 4.92,-4.48 0.47,0.35 1.13,0.24 1.46,-0.25 0.73,-1.07 2.21,-2.23 4.31,1 0,0 4.45,-5.3 6.19,2.29 0,0 5.18,0 1.87,4.07 0,0 5.01,-1.44 6.87,5.85 0,0 3.86,-4.41 4.67,0.85 0,0 6.32,-1.74 2.72,3.31 0,0 4.54,3.27 0.76,3.82 0,0 5.09,5.85 -1.44,5.09 0,0 2.67,5.09 -3.02,4.33 l -2.2,-0.76 c 0,0 -2.5,-1.41 -2.35,-3.15 l -1.23,-0.2 c 0,0 -2.27,0.41 -3.07,-0.73 0,0 -3.31,1.91 -3.14,-2.04 0,0 -3.73,3.73 -5.35,0.17 l -1.28,2.08 c 0,0 -2.33,2.03 -3.3,0.46 0,0 2.76,4.62 -2.12,3.99 0,0 2.88,4.71 -3.71,4.24 l 0.25,3.41 z" id="path4"/>
  <path class="cls-3" d="m 44.7,38.94 c 0,0 1.56,-4.92 6.69,-2.29 0,0 0.7,2.89 -5.23,3.52 z" id="path5"/>
</g>
<path class="cls-1" d="m 49.814191,104.87397 c 0.88,-0.1 1.28,-0.24 2.08,-0.15 1.35,0.13 2.76,0.47 4.1,0.86 l -0.11,-0.1 0.2,0.13 c 0,0 -0.06,-0.01 -0.09,-0.03 l 2.66,2.29 c 0.92,0.87 2.34,1.03 3.55,1.03 v -0.2 c -0.58,-0.08 -1.17,-0.21 -1.71,-0.42 -0.57,-0.21 -1.01,-0.44 -1.4,-0.93 l -2.44,-2.63 c -1.41,-0.7 -2.96,-1.13 -4.56,-1.49 -1.41,-0.3 -2.82,0.18 -4.1,-0.54 -2.25,-1.25 -4.74,-2.14 -7.33,-2.52 -0.14,-0.11 -0.737897,-0.303856 -0.877897,-0.403856 -2.616658,-1.144232 -4.134205,-0.97523 -4.254205,-1.54523 l -2.272536,0.02775 c -1.04,0.14 -3.930916,0.719337 -4.900916,1.039337 -3.12,1.059999 -6.124446,2.421999 -8.914446,4.101999 -3.25,1.01 -6.87,1.09 -10.2500001,1.6 v 0.19 c 2.3700001,0.11 4.7300001,0.21 7.1000001,0.13 -3.79,2.29 -10.3700002,6.44 -13.7100002,8.66 l 0.1,0.18 15.0000002,-7.83 c 0.99,-0.52 1.99,-1.01 3,-1.5 0.14,0 0.29,0 0.42,0.03 0.03,-0.06 0.05,-0.1 0.05,-0.11 0.03,0.03 0.05,0.1 0.09,0.15 0.1,0.03 0.13,0.09 0.04,0.04 -0.01,-0.01 -0.03,-0.01 -0.04,-0.04 -0.04,-0.01 -0.09,-0.03 -0.14,-0.04 -0.13,0.25 -0.47,0.84 -0.82,1.31 -0.88,1.21 -1.9,2.44 -2.78,3.84 l 0.13,0.15 c 1.93,-0.84 3.69,-2.05 4.97,-3.76 0.72,-1.07 0.69,-2.01 0.24,-2.62 0.81,-0.4 1.6,-0.82 2.37,-1.27 l 3.672223,-1.93155 c 0.53,-0.29 0.521102,-0.33355 1.181102,-0.703555 0.365229,-0.197452 0.983238,0.150325 0.576671,0.525105 v 0 c -2.15,2.33 -4.17,4.73 -6.12,7.21 l 0.08,0.49 c 0.24,1.96 0.67,4.54 -0.1,6.44 -1.33,0.65 -2.57,1.17 -3.94,1.62 -3.39,0.45 -6.41,1.84 -8.84,4.26999 l 0.13,0.15 c 2.14,-1.22999 4.59,-2.39999 7.05,-2.49999 0.35,0.06 0.7,0.09 1.07,0.09 -3.39,2.61999 -5.94,6.60999 -8.26,9.98999 l 0.15,0.11 c 3.28,-3.51 6.49,-7.45 10.67,-9.82999 0.01,0 0.04,-0.01 0.05,-0.01 0.31,-0.08 0.6,-0.18 0.88,-0.3 3.78,-1.55 3.8,-6.31 3.18,-9.97 1.2,-1.56 2.39,-3.11 3.62,-4.63 0.57,-0.68 1.16,-1.41 1.76,-2.11 0.25,-0.03 0.48,-0.08 0.6,-0.04 0.38,0.11 0.768115,0.54356 0.914658,1.0216 0.214178,0.69868 0.875342,1.0184 1.275342,1.0284 0.03,3.05 -1.77,6.13 -3.06,8.78 -0.04,0.14 -0.09,0.26 -0.13,0.4 -1.75,2.37 -3.94,4.58 -6.05,6.71 l 0.13,0.15 c 1.6,-1.18 3.4,-2.44 4.95,-3.8 -0.5,1.69 -0.88,3.41 -0.89,5.20999 0.04,0.35 0.03,0.69 0.3,1.23 -0.53,0.21 -0.99,0.48 -1.45,0.78 -0.42,0.29 -0.86,0.86 -0.99,1.36 -0.67,2.32 -0.31,4.77 0.35,6.92 l 0.19,-0.04 c 0.06,-1.69 0.19,-3.47 0.7,-5.05 0.48,-1.3 1.49,-2.05 2.08,-3.25 0.03,0.03 0.04,0.03 0.05,0.03 0.81,0.28 1.47,1.12 2,1.99 -0.11,3.93 0.87,8.03 -0.11,11.87 -0.37,1.27 -0.97,2.52 -1.72,3.64 l 0.15,0.14 c 4.39,-4.18 3.22,-10.66 3.6,-16.14 -0.68,-1.3 -1.55,-2.68 -3.08,-3.32 v 0.08 c 0,0 -0.08,-0.1 -0.14,-0.13 0,-0.01 -0.01,-0.01 -0.03,-0.03 0.06,0.01 0.11,0.04 0.16,0.08 -0.13,-1.94999 0.72,-4.84999 1.26,-6.85999 0.65,2.34 1.25,4.68 2.4,6.90999 l 0.19,-0.03 c 0.28,-1.71999 0.19,-3.40999 -0.06,-5.07999 -0.16,-0.92 -0.69,-3.28 -1.67,-4.24 1.11,-2.45 2.28,-5.03 2.34,-7.69 1.84,2.2 3.81,4.38 5.05,6.93 0.21,0.79 0.24,1.61 0.19,2.44 -0.62,0.34 -1.2,0.78 -1.74,1.32 -0.64,0.64 -0.86,1.74 -1.02,2.62 -0.15,0.86 -0.43,1.71 -0.29,2.57999 0.19,0.93 0.38,1.86 1.16,2.54 l 0.18,-0.1 c 0.29,-0.83 0.54,-1.64 0.64,-2.44 0.15,-1.19999 -0.23,-2.44999 -0.13,-3.65999 0.05,-0.86 0.57,-1.59 1.15,-2.25 -0.14,1.4 -0.47,2.82 -0.57,4.18 -0.39,3.90999 2.37,7.29999 4.74,10.06999 l 0.14,-0.14 c -1.57,-1.9 -2.98,-4 -3.83,-6.31 -0.77,-1.83 -0.39,-3.68999 0,-5.62999 0.19,0.76 0.58,1.46 0.93,2.14 0.65,1.08 1.33,2.15999 2.27,3.00999 2.27,1.33 4.59,2.67 6.63,4.32 1.52,1.32 1.47,3.57 1.13,5.45 l 0.19,0.06 c 0.63,-1.71 0.94,-3.78 0.04,-5.49 -1.02,-1.55 -2.66,-2.64 -4.03,-3.83 -0.91,-0.73 -1.77,-1.47 -2.73,-2.14 -1.01,-1.16999 -2.28,-2.38999 -3.34,-3.54999 -0.31,-0.37 -0.65,-0.72 -0.87,-1.13 0.03,-0.14 0.05,-0.29 0.08,-0.43 0.2,-1.23 0.39,-2.57 0.04,-3.91 -0.34,-1.31 -1.22,-2.32 -1.95,-3.4 -0.99,-1.4 -2.1,-2.87 -3.22,-4.34 0.13,-0.09 0.339668,-0.74879 0.369668,-0.84879 0.23,-0.63 0.235372,-0.62056 1.075372,-1.20056 0.597255,-0.18359 1.134964,0.20935 1.494964,0.50935 1.56,1.51 3.05,3.64 4.32,5.45 0.52,0.54 1.01,1.11 1.47,1.7 -0.1,0.64 -0.34,1.18 -0.48,1.84 -0.23,0.81 -0.15,1.72 -0.21,2.64 -0.05,0.98 -0.23,2.06 0.25,3 0.53,0.96 1.35,1.55 2.23,1.89 l 0.09,-0.18 c -0.67,-0.57 -1.25,-1.31 -1.38,-2.05 -0.19,-0.79 0.16,-1.59 0.37,-2.38 0.24,-0.86 0.67,-1.71 0.63,-2.69 0.62,0.94 1.18,1.91 1.72,2.91 1.8,2.11 4.58,3.49 6.85,4.52 2.08,1.49999 4.09,3.78999 3.95,6.50999 l 0.2,0.03 c 0.21,-2.11 -0.92,-4.08 -2.32,-5.57999 -0.49,-0.5 -1.01,-0.98 -1.57,-1.41 -2.3,-1.18 -4.82,-2.55 -6.42,-4.58 -1.09,-2.34 -2.91,-5.16 -4.42,-6.75 -0.1,-0.15 -0.2,-0.31 -0.3,-0.47 2.15,1.03 4.73,1.59 6.57,2.89 l 0.09,0.18 c 0.16,-0.13 0.09,-0.25 0.06,-0.33 -0.53,-0.89 -1.51,-1.42 -2.33,-2.04 -2.5,-1.41 -4.42,-3.25 -6.97,-4.41 -0.01,-0.04 -0.05,-0.08 -0.09,-0.11 0.93,0.52 1.86,1.01 2.77,1.52 1.31,0.81 3.01,1.55 4.64,1.35 z m -29.95,-0.02 c 0.03,-0.06 0.05,-0.1 0.05,-0.11 0.03,0.03 0.05,0.1 0.09,0.15 -0.04,-0.01 -0.09,-0.03 -0.14,-0.04 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccccccsscccccccccccccccccscccccccccccccccccccccccccccccccccsccccscccccccccccccccccccccccccccccccccccccccccccccccccccccccc" style="fill:#9d8a71;stroke-width:0px"/>
</g>
</svg>`;
      }
      return `<svg class="plant5" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 59.61 138.61">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="m 47.21,102.99 c 0.88,-0.1 1.28,-0.24 2.08,-0.15 1.35,0.13 2.76,0.47 4.1,0.86 l -0.11,-0.1 0.2,0.13 c 0,0 -0.06,-0.01 -0.09,-0.03 l 2.66,2.29 c 0.92,0.87 2.34,1.03 3.55,1.03 v -0.2 c -0.58,-0.08 -1.17,-0.21 -1.71,-0.42 -0.57,-0.21 -1.01,-0.44 -1.4,-0.93 l -2.44,-2.63 c -1.41,-0.7 -2.96,-1.13 -4.56,-1.49 -1.41,-0.3 -2.82,0.18 -4.1,-0.54 -2.25,-1.25 -4.74,-2.14 -7.33,-2.52 -0.14,-0.11 -0.737897,-0.303854 -0.877897,-0.403854 -2.616658,-1.144232 -4.134205,-0.97523 -4.254205,-1.54523 l -2.272536,0.02775 c -1.04,0.14 -3.930916,0.719337 -4.900916,1.039337 -3.12,1.06 -6.124446,2.421997 -8.914446,4.101997 -3.25,1.01 -6.87,1.09 -10.25,1.6 v 0.19 c 2.37,0.11 4.73,0.21 7.1,0.13 -3.79,2.29 -10.37,6.44 -13.71,8.66 l 0.1,0.18 15,-7.83 c 0.99,-0.52 1.99,-1.01 3,-1.5 0.14,0 0.29,0 0.42,0.03 0.03,-0.06 0.05,-0.1 0.05,-0.11 0.03,0.03 0.05,0.1 0.09,0.15 0.1,0.03 0.13,0.09 0.04,0.04 -0.01,-0.01 -0.03,-0.01 -0.04,-0.04 -0.04,-0.01 -0.09,-0.03 -0.14,-0.04 -0.13,0.25 -0.47,0.84 -0.82,1.31 -0.88,1.21 -1.9,2.44 -2.78,3.84 l 0.13,0.15 c 1.93,-0.84 3.69,-2.05 4.97,-3.76 0.72,-1.07 0.69,-2.01 0.24,-2.62 0.81,-0.4 1.6,-0.82 2.37,-1.27 l 3.672223,-1.931553 c 0.53,-0.29 0.521102,-0.33355 1.181102,-0.70355 0.365229,-0.197452 0.983238,0.150325 0.576671,0.525103 v 0 c -2.15,2.33 -4.17,4.73 -6.12,7.21 l 0.08,0.49 c 0.24,1.96 0.67,4.54 -0.1,6.44 -1.33,0.65 -2.57,1.17 -3.94,1.62 -3.39,0.45 -6.41,1.84 -8.84,4.27 l 0.13,0.15 c 2.14,-1.23 4.59,-2.4 7.05,-2.5 0.35,0.06 0.7,0.09 1.07,0.09 -3.39,2.62 -5.94,6.61 -8.26,9.99 l 0.15,0.11 c 3.28,-3.51 6.49,-7.45 10.67,-9.83 0.01,0 0.04,-0.01 0.05,-0.01 0.31,-0.08 0.6,-0.18 0.88,-0.3 3.78,-1.55 3.8,-6.31 3.18,-9.97 1.2,-1.56 2.39,-3.11 3.62,-4.63 0.57,-0.68 1.16,-1.41 1.76,-2.11 0.25,-0.03 0.48,-0.08 0.6,-0.04 0.38,0.11 0.768115,0.54356 0.914658,1.0216 0.214178,0.69868 0.875342,1.0184 1.275342,1.0284 0.03,3.05 -1.77,6.13 -3.06,8.78 -0.04,0.14 -0.09,0.26 -0.13,0.4 -1.75,2.37 -3.94,4.58 -6.05,6.71 l 0.13,0.15 c 1.6,-1.18 3.4,-2.44 4.95,-3.8 -0.5,1.69 -0.88,3.41 -0.89,5.21 0.04,0.35 0.03,0.69 0.3,1.23 -0.53,0.21 -0.99,0.48 -1.45,0.78 -0.42,0.29 -0.86,0.86 -0.99,1.36 -0.67,2.32 -0.31,4.77 0.35,6.92 l 0.19,-0.04 c 0.06,-1.69 0.19,-3.47 0.7,-5.05 0.48,-1.3 1.49,-2.05 2.08,-3.25 0.03,0.03 0.04,0.03 0.05,0.03 0.81,0.28 1.47,1.12 2,1.99 -0.11,3.93 0.87,8.03 -0.11,11.87 -0.37,1.27 -0.97,2.52 -1.72,3.64 l 0.15,0.14 c 4.39,-4.18 3.22,-10.66 3.6,-16.14 -0.68,-1.3 -1.55,-2.68 -3.08,-3.32 v 0.08 c 0,0 -0.08,-0.1 -0.14,-0.13 0,-0.01 -0.01,-0.01 -0.03,-0.03 0.06,0.01 0.11,0.04 0.16,0.08 -0.13,-1.95 0.72,-4.85 1.26,-6.86 0.65,2.34 1.25,4.68 2.4,6.91 l 0.19,-0.03 c 0.28,-1.72 0.19,-3.41 -0.06,-5.08 -0.16,-0.92 -0.69,-3.28 -1.67,-4.24 1.11,-2.45 2.28,-5.03 2.34,-7.69 1.84,2.2 3.81,4.38 5.05,6.93 0.21,0.79 0.24,1.61 0.19,2.44 -0.62,0.34 -1.2,0.78 -1.74,1.32 -0.64,0.64 -0.86,1.74 -1.02,2.62 -0.15,0.86 -0.43,1.71 -0.29,2.58 0.19,0.93 0.38,1.86 1.16,2.54 l 0.18,-0.1 c 0.29,-0.83 0.54,-1.64 0.64,-2.44 0.15,-1.2 -0.23,-2.45 -0.13,-3.66 0.05,-0.86 0.57,-1.59 1.15,-2.25 -0.14,1.4 -0.47,2.82 -0.57,4.18 -0.39,3.91 2.37,7.3 4.74,10.07 l 0.14,-0.14 c -1.57,-1.9 -2.98,-4 -3.83,-6.31 -0.77,-1.83 -0.39,-3.69 0,-5.63 0.19,0.76 0.58,1.46 0.93,2.14 0.65,1.08 1.33,2.16 2.27,3.01 2.27,1.33 4.59,2.67 6.63,4.32 1.52,1.32 1.47,3.57 1.13,5.45 l 0.19,0.06 c 0.63,-1.71 0.94,-3.78 0.04,-5.49 -1.02,-1.55 -2.66,-2.64 -4.03,-3.83 -0.91,-0.73 -1.77,-1.47 -2.73,-2.14 -1.01,-1.17 -2.28,-2.39 -3.34,-3.55 -0.31,-0.37 -0.65,-0.72 -0.87,-1.13 0.03,-0.14 0.05,-0.29 0.08,-0.43 0.2,-1.23 0.39,-2.57 0.04,-3.91 -0.34,-1.31 -1.22,-2.32 -1.95,-3.4 -0.99,-1.4 -2.1,-2.87 -3.22,-4.34 0.13,-0.09 0.339668,-0.74879 0.369668,-0.84879 0.23,-0.629996 0.235372,-0.620563 1.075372,-1.200563 C 36.562291,98.837062 37.1,99.23 37.46,99.53 c 1.56,1.51 3.05,3.64 4.32,5.45 0.52,0.54 1.01,1.11 1.47,1.7 -0.1,0.64 -0.34,1.18 -0.48,1.84 -0.23,0.81 -0.15,1.72 -0.21,2.64 -0.05,0.98 -0.23,2.06 0.25,3 0.53,0.96 1.35,1.55 2.23,1.89 l 0.09,-0.18 c -0.67,-0.57 -1.25,-1.31 -1.38,-2.05 -0.19,-0.79 0.16,-1.59 0.37,-2.38 0.24,-0.86 0.67,-1.71 0.63,-2.69 0.62,0.94 1.18,1.91 1.72,2.91 1.8,2.11 4.58,3.49 6.85,4.52 2.08,1.5 4.09,3.79 3.95,6.51 l 0.2,0.03 c 0.21,-2.11 -0.92,-4.08 -2.32,-5.58 -0.49,-0.5 -1.01,-0.98 -1.57,-1.41 -2.3,-1.18 -4.82,-2.55 -6.42,-4.58 -1.09,-2.34 -2.91,-5.16 -4.42,-6.75 -0.1,-0.15 -0.2,-0.31 -0.3,-0.47 2.15,1.03 4.73,1.59 6.57,2.89 L 49.1,107 c 0.16,-0.13 0.09,-0.25 0.06,-0.33 -0.53,-0.89 -1.51,-1.42 -2.33,-2.04 -2.5,-1.41 -4.42,-3.25 -6.97,-4.41 -0.01,-0.04 -0.05,-0.08 -0.09,-0.11 0.93,0.52 1.86,1.01 2.77,1.52 1.31,0.81 3.01,1.55 4.64,1.35 z m -29.95,-0.02 c 0.03,-0.06 0.05,-0.1 0.05,-0.11 0.03,0.03 0.05,0.1 0.09,0.15 -0.04,-0.01 -0.09,-0.03 -0.14,-0.04 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccccccsscccccccccccccccccscccccccccccccccccccccccccccccccccsccccscccccccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
<path class="cls-2" d="m 46.35,38.92 -0.19,1.25 c -1.57,-0.24 -3.61,0.58 -4.87,1.18 -0.84,1.2 -1.8,2.55 -2.91,4.08 -2.49,3.46 -3.737319,5.236649 -5.45,7.45 V 96.41 H 30.6 V 54.12 c -2.25,-3.93 -4.95,-7.89 -5.76,-8.06 -1.64,0.39 -4.88,-0.6 -5.25,-0.72 l 0.38,-1.21 c 0.91,0.29 3.49,0.97 4.66,0.69 0.58,-0.14 1.37,0.43 2.25,1.41 -4.8,-6.67 -6.58,-7.07 -7.04,-7.04 l -0.13,-1.26 c 0.72,-0.08 2.88,-0.28 9.59,9.58 0.65,0.97 1.25,1.88 1.72,2.62 C 30.54,39.19 29.6,28.09 28.72,27.09 l 0.62,-1.08 c 1.59,0.72 2.47,12.8 2.93,23.83 1.06,-1.42 2.58,-3.51 4.22,-5.78 0.33,-0.45 0.64,-0.89 0.93,-1.32 1.12,-3.4 3.46,-10.85 4.14,-15.13 l 1.23,0.2 c -0.49,3.15 -1.82,7.85 -2.96,11.53 4.25,-6.1 5.14,-7.88 5.31,-8.38 l 2.2,0.76 c -0.16,0.47 -0.58,1.69 -4.74,7.73 1.18,-0.42 2.54,-0.7 3.74,-0.53 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccccccccccccccc"/>
<path style="fill:#5b4511;stroke-width:2.28084;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 20.574391,45.743463 c -4.79287,-1.287122 -5.788375,-3.177755 -5.788375,-3.177755 l -0.09121,-0.306078 c 0,0 -0.232494,-1.031013 0.877695,-0.451926 0.936155,0.488305 1.865441,1.566228 3.35954,1.926993 1.55393,0.37521 1.55218,0.477066 1.879103,1.235111 0.360061,0.834873 -0.236804,0.773674 -0.236804,0.773674 z" id="path5-7-14" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.29516;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 14.235255,36.318294 c 3.91209,3.271734 5.889328,2.911504 5.889328,2.911504 l 0.276454,-0.118154 c 0,0 0.884703,-0.461709 -0.223036,-1.039593 -0.93409,-0.487298 -2.286935,-0.59105 -3.477426,-1.636884 C 15.46241,35.347451 15.390426,35.414188 14.64269,35.620346 13.819171,35.847395 14.235255,36.3183 14.235255,36.3183 Z" id="path5-7-14-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 28.98598,27.640903 c -2.580351,-3.833019 -2.118741,-5.85259 -2.118741,-5.85259 L 26.99122,21.50317 c 0,0 0.470055,-0.915923 0.895099,0.183667 0.358417,0.927222 0.349663,2.294717 1.178917,3.459095 0.862463,1.211005 0.798639,1.286721 0.562756,2.053324 -0.259787,0.844299 -0.642016,0.441647 -0.642016,0.441647 z" id="path5-7-14-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.09871;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 42.894692,23.847714 c -2.40818,5.727383 -1.490175,6.279466 -1.490175,6.279466 l 0.200228,-0.0017 c 0,0 0.729389,-0.102574 1.041728,-1.318905 0.263398,-1.025648 0.0066,-1.810795 0.792686,-3.612108 0.817551,-1.873449 0.727275,-1.831169 0.305968,-1.958604 -0.46401,-0.140322 -0.850466,0.6118 -0.850466,0.6118 z" id="path5-7-14-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 51.311927,38.880587 c -4.211348,1.901262 -6.124953,1.107623 -6.124953,1.107623 l -0.260323,-0.170028 c 0,0 -0.82416,-0.61695 0.331128,-0.851641 0.974184,-0.197904 2.32086,0.03997 3.607777,-0.582347 1.338451,-0.647244 1.402396,-0.57163 2.118606,-0.21057 0.7888,0.397648 0.327769,0.706968 0.327769,0.706968 z" id="path5-7-14-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:3.31365;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 49.667405,25.06151 c -1.422355,7.36535 -3.793782,8.099894 -3.793782,8.099894 l -0.387198,0.0021 c 0,0 -1.307692,-0.117246 -0.618934,-1.685661 0.580786,-1.322557 1.915944,-2.344786 2.307582,-4.660642 0.407316,-2.408597 0.537653,-2.355775 1.491846,-2.529801 1.050894,-0.191674 1.000491,0.774097 1.000491,0.774097 z" id="path5-7-14-63" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:transform-center-x="-0.18058606" inkscape:transform-center-y="0.10098732"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 30.002101,32.765021 c 1.073483,-4.494205 2.872213,-5.52198 2.872213,-5.52198 l 0.29378,-0.101838 c 0,0 0.992291,-0.274272 0.470921,0.783052 -0.439641,0.891582 -1.451886,1.811082 -1.74724,3.209725 -0.307179,1.454654 -0.406113,1.458955 -1.129962,1.804444 -0.79721,0.380509 -0.759715,-0.173406 -0.759715,-0.173406 z" id="path5-7-14-06" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.13564;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 29.188413,26.756798 c 3.176834,-3.283398 3.102435,-5.353652 3.102435,-5.353652 l -0.06696,-0.303287 c 0,0 -0.284006,-0.98762 -0.892787,0.01319 -0.513352,0.843925 -0.754621,2.188974 -1.763253,3.177907 -1.049025,1.028533 -1.001581,1.114841 -0.915107,1.912017 0.09523,0.87797 0.535671,0.553826 0.535671,0.553826 z" id="path5-7-14-48" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 30.625664,38.510004 c -3.251083,-3.283398 -3.174945,-5.353652 -3.174945,-5.353652 l 0.06852,-0.303287 c 0,0 0.290643,-0.98762 0.913653,0.01319 0.52535,0.843925 0.772258,2.188974 1.804464,3.177907 1.073543,1.028533 1.02499,1.114841 0.936495,1.912017 -0.09746,0.87797 -0.548191,0.553826 -0.548191,0.553826 z" id="path5-7-14-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 29.91551,30.445143 C 25.605405,28.77984 24.827607,26.859742 24.827607,26.859742 l -0.0616,-0.304767 c 0,0 -0.139003,-1.020071 0.839032,-0.361885 0.824722,0.555009 1.600478,1.681208 2.94701,2.161091 1.400456,0.499096 1.391478,0.597716 1.636984,1.361292 0.270392,0.840962 -0.273522,0.729673 -0.273522,0.729673 z" id="path5-7-14-04" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.939395,34.343805 c -1.655374,-4.313929 -0.752759,-6.17861 -0.752759,-6.17861 l 0.184749,-0.250092 c 0,0 0.663425,-0.787231 0.831141,0.379659 0.141426,0.983972 -0.173674,2.314698 0.373439,3.635344 0.569024,1.373531 0.48985,1.433012 0.08811,2.127221 -0.442452,0.764569 -0.724685,0.286477 -0.724685,0.286477 z" id="path5-7-14-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 17.83705,32.704762 c 3.16684,3.364724 3.038267,5.432384 3.038267,5.432384 l -0.07618,0.301453 c 0,0 -0.315576,0.979939 -0.913026,-0.03634 -0.503796,-0.856966 -0.716542,-2.20784 -1.723358,-3.222611 -1.047136,-1.055405 -0.996411,-1.140455 -0.887745,-1.935133 0.119676,-0.875218 0.562049,-0.539757 0.562049,-0.539757 z" id="path5-7-14-60" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 20.971325,45.792161 C 17.720242,42.508763 17.79638,40.438509 17.79638,40.438509 l 0.06852,-0.303287 c 0,0 0.290643,-0.98762 0.913653,0.01319 0.52535,0.843925 0.772258,2.188974 1.804464,3.177907 1.073543,1.028533 1.02499,1.114841 0.936495,1.912017 -0.09746,0.87797 -0.548191,0.553826 -0.548191,0.553826 z" id="path5-7-14-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 28.377328,49.960572 c -4.6193,0.110966 -6.072713,-1.365292 -6.072713,-1.365292 l -0.173549,-0.25799 c 0,0 -0.518806,-0.889218 0.636663,-0.655436 0.974341,0.197134 2.122039,0.940713 3.549715,0.86874 1.484847,-0.07486 1.514294,0.01969 2.033333,0.63118 0.571646,0.673462 0.02655,0.778802 0.02655,0.778802 z" id="path5-7-14-49" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:transform-center-x="1.3589216" inkscape:transform-center-y="-0.11816709"/>
<path style="fill:#5b4511;stroke-width:1.87908;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 25.07897,46.039529 c -3.455143,-2.337156 -3.374226,-3.810784 -3.374226,-3.810784 l 0.07282,-0.215882 c 0,0 0.308886,-0.702998 0.971001,0.0094 0.558324,0.600715 0.82073,1.558134 1.917725,2.262067 1.140926,0.73212 1.089325,0.793555 0.995276,1.360993 -0.103578,0.624948 -0.5826,0.394219 -0.5826,0.394219 z" id="path5-7-14-99" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 43.615843,44.576143 c -4.276216,1.75049 -6.160427,0.889386 -6.160427,0.889386 l -0.254121,-0.179167 c 0,0 -0.801728,-0.645831 0.361163,-0.839343 0.980599,-0.16318 2.317976,0.122377 3.626183,-0.453843 1.360595,-0.599298 1.421814,-0.521461 2.124749,-0.135192 0.774179,0.425414 0.302453,0.718163 0.302453,0.718163 z" id="path5-7-14-61" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.0842;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 46.457605,32.354509 c 4.105423,-1.755214 4.889135,-3.672704 4.889135,-3.672704 l 0.06611,-0.302786 c 0,0 0.15797,-1.011733 -0.781036,-0.336404 -0.791811,0.569465 -1.552593,1.702236 -2.834113,2.210677 -1.332838,0.5288 -1.326987,0.626045 -1.578527,1.386966 -0.277039,0.838038 0.238431,0.714253 0.238431,0.714253 z" id="path5-7-14-53" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 48.09154,27.804912 C 44.840457,24.521514 44.916595,22.45126 44.916595,22.45126 l 0.06852,-0.303287 c 0,0 0.290643,-0.98762 0.913653,0.01319 0.52535,0.843925 0.772258,2.188974 1.804464,3.177907 1.073543,1.028533 1.02499,1.114841 0.936495,1.912017 -0.09746,0.87797 -0.548191,0.553826 -0.548191,0.553826 z" id="path5-7-14-27" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16045;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 49.79439,18.996549 c -1.511664,4.366361 -3.403022,5.21165 -3.403022,5.21165 l -0.302395,0.07235 c 0,0 -1.01451,0.175031 -0.391363,-0.825694 0.525463,-0.843854 1.623491,-1.658995 2.055401,-3.021673 0.449202,-1.417248 0.548078,-1.411767 1.302483,-1.684153 0.830862,-0.299995 0.738899,0.247518 0.738899,0.247518 z" id="path5-7-14-34" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:2.16332;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 49.028175,27.131196 c 3.422458,-3.127276 3.342308,-5.099092 3.342308,-5.099092 l -0.07213,-0.288866 c 0,0 -0.305964,-0.94066 -0.961815,0.01256 -0.553043,0.803797 -0.812967,2.084891 -1.899584,3.026801 -1.130132,0.979627 -1.07902,1.061831 -0.98586,1.821103 0.102595,0.836223 0.577088,0.527492 0.577088,0.527492 z" id="path5-7-14-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.66788;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 30.288388,24.514766 c 3.508753,-0.763445 4.141656,-2.086855 4.141656,-2.086855 l 0.05011,-0.216594 c 0,0 0.112991,-0.732063 -0.683138,-0.353659 -0.671345,0.319113 -1.302725,1.061552 -2.398911,1.270502 -1.140085,0.217314 -1.132758,0.29046 -1.332501,0.823492 -0.219992,0.587055 0.222813,0.563086 0.222813,0.563086 z" id="path5-7-14-74" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.93786;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 24.11575,41.29359 c -0.09709,-4.196782 -1.471168,-5.7465 -1.471168,-5.7465 l -0.236725,-0.197443 c 0,0 -0.812553,-0.608136 -0.555743,0.481321 0.216553,0.918675 0.926276,2.078379 0.922788,3.369753 -0.0036,1.343086 0.08168,1.38429 0.647323,1.950508 0.622971,0.623607 0.693527,0.142361 0.693527,0.142361 z" id="path5-7-14-499" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
<path style="fill:#5b4511;stroke-width:1.88866;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 19.457704,35.201636 c 0.353601,-4.102278 -0.798477,-5.82334 -0.798477,-5.82334 l -0.205883,-0.228774 c 0,0 -0.714087,-0.717502 -0.583891,0.383115 0.109786,0.928088 0.666608,2.166922 0.525824,3.424075 -0.146424,1.307494 -0.06904,1.36077 0.412849,1.999394 0.530732,0.703352 0.649576,0.245532 0.649576,0.245532 z" id="path5-7-14-92" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:transform-center-x="0.083556753" inkscape:transform-center-y="-0.37600539"/>
<path style="fill:#5b4511;stroke-width:1.97381;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 23.62895,21.589911 c 3.754562,4.032177 4.674387,3.468157 4.674387,3.468157 l 0.09569,-0.166448 c 0,0 0.265651,-0.640664 -0.628228,-1.332098 -0.753779,-0.583037 -1.55318,-0.649635 -2.720113,-1.941543 -1.213662,-1.343647 -1.221114,-1.253828 -1.535011,-0.950179 -0.345717,0.334417 0.113301,0.922104 0.113301,0.922104 z" id="path5-7-14-76" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsssc"/>
</g>
</svg>`;
    case 6:
      if (isAlive) {
        return `<svg class="plant6" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 85.57 145.53">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="m 85.57,115.18 c -2.76,0.71 -5.67,1.29 -8.51,0.44 -1.4,-0.53 -2.59,-1.31 -3.78,-2.11 -1.19,-0.81 -2.31,-1.69 -3.4,-2.64 l -0.18,-0.51 c -0.01,0.2 0.01,0.14 0,0.17 -0.44,-0.45 -1.12,-0.63 -1.75,-0.82 -2.03,-0.44 -4.13,-0.71 -6.21,-1.02 0.23,0.23 0.44,0.5 0.62,0.81 0.12,0.22 0.18,0.53 0.19,0.79 0.18,0.88 0.97,1.56 1.67,2.27 1.87,1.79 4,3.3 6.09,4.85 l -0.08,0.14 c -2.39,-1.13 -4.69,-2.46 -6.8,-4.09 -0.9,-0.79 -2.2,-1.74 -2.33,-3.16 -0.08,-0.3 -0.35,-0.5 -0.73,-0.76 -2.17,-1.23 -4.79,-1.8 -7.23,-2.38 -0.79,-0.27 -2.34,-0.79 -4.09,-1.39 1.87,1.28 3.6,2.77 4.97,4.6 0.61,0.93 1.13,1.91 1.61,2.91 2.2,1.5 4.2,3.23 6.26,4.85 1.34,0.96 2.84,1.86 4.37,2.48 1.13,0.5 2.42,0.48 3.38,1.32 0.96,0.87 1.43,1.79 2.55,2.38 0.98,0.88 1.06,2.14 1.78,3.11 0.65,0.88 1.69,1.51 2.79,1.81 l -0.03,0.15 c -1.16,-0.21 -2.29,-0.75 -3.13,-1.67 -0.82,-0.92 -1.11,-2.23 -1.9,-2.79 -1.08,-0.43 -1.85,-1.52 -2.68,-2.18 -0.91,-0.65 -2.16,-0.54 -3.18,-0.95 -2.28,-0.76 -4.59,-1.8 -6.29,-3.52 -1.14,-1.11 -2.23,-2.25 -3.22,-3.47 0.33,0.74 0.65,1.49 0.98,2.22 1.42,2.93 4.37,4.71 6.95,6.52 0.51,0.28 1.1,0.74 1.4,1.29 1.39,2.32 1.8,5.07 2.17,7.7 l -0.15,0.02 c -0.52,-2.72 -0.95,-5.73 -2.72,-7.94 -2.94,-2.16 -6.59,-3.81 -8.34,-7.22 -1.06,-2.2 -2.01,-4.46 -3.38,-6.46 -1.7,-2.16 -3.95,-3.8 -6.35,-5.18 -0.42,0.29 -0.74,0.61 -0.98,0.91 0.15,0.34 0.31,0.68 0.46,1.02 1.69,1.21 2.8,2.97 4.18,4.53 1.06,1.04 2.28,2.14 2.89,3.53 l -0.13,0.08 c -1.29,-1.5 -3.06,-2.57 -4.65,-3.86 0.01,0.02 0.02,0.03 0.03,0.05 2.84,4 3.84,9.2 6.4,13.42 1.66,2.89 3.2,6.23 2.73,9.66 -0.22,1.69 -0.65,3.32 -1.32,4.85 l -0.14,-0.06 c 2.39,-7.87 -1.21,-11.14 -4.43,-17.36 -0.17,0.54 -0.45,1.04 -0.8,1.5 -0.53,0.83 -1.49,0.89 -1.96,1.81 -0.68,1.68 -0.53,3.8 -0.39,5.63 l -0.16,0.04 c -0.69,-2.39 -1.71,-5.67 0.38,-7.71 0.88,-0.72 1.65,-1.42 2.44,-2.27 -1.34,-2.96 -2.17,-5.95 -4.08,-8.71 -0.96,-1.67 -1.77,-3.38 -2.5,-5.12 -0.21,0.07 -0.46,0.13 -0.73,0.18 -0.04,0.68 -0.12,1.25 -0.23,1.59 0.07,1.7 0.24,3.4 0.42,5.09 0.22,1.43 0.3,3.67 0.84,4.98 l -0.11,0.11 c -1.6,-3.11 -1.86,-6.67 -2.7,-10.04 0.03,-0.53 0.08,-1.05 0.15,-1.58 h -0.33 c -0.09,2.39 -0.29,4.76 -0.85,7.08 -0.27,2.14 -0.54,4.52 -0.61,6.08 -0.27,2.5 0.45,4.86 0.3,7.33 -0.05,1.28 -0.16,2.54 -0.33,3.8 -0.55,1.07 -1.08,2.16 -1.59,3.25 -0.67,1.59 -1.57,3.2 -1.66,4.94 0.03,1.75 0.76,3.43 1.63,4.94 l -0.13,0.09 c -0.98,-1.51 -1.81,-3.2 -1.95,-5.02 0.1,-2.79 1.94,-6.42 2.83,-8.38 0.17,-2.4 0.33,-4.84 -0.21,-7.19 -0.15,-1.03 -0.23,-2.03 -0.25,-3.03 -0.56,1.35 -1.19,2.67 -1.99,3.9 -1.16,1.8 -2.64,3.58 -3.94,5.27 -0.37,0.54 -0.94,1.15 -1,1.79 l -0.15,0.05 c -0.12,-0.44 0.07,-0.79 0.19,-1.14 1.03,-2.33 2.54,-4.45 3.71,-6.67 0.67,-1.25 1.22,-2.58 1.74,-3.92 -1.74,1.18 -3.6,2.1 -5.54,2.84 l -0.06,-0.14 c 2.12,-1.23 4.7,-2.51 6.29,-4.46 0.3,-0.77 0.61,-1.53 0.95,-2.27 l 0.24,-0.57 c 0.05,-0.41 0.09,-0.82 0.12,-1.03 0.39,-2.74 0.44,-5.56 1,-8.26 -0.2,-0.21 -0.46,-0.45 -0.73,-0.65 -0.05834,-0.0533 -0.127803,-0.0913 -0.14,-0.1 -0.1,-0.07 -0.2,-0.14 -0.29,-0.19 -2.97,3.94 -5.97,7.83 -9.59,11.25 -0.69,0.64 -1.47,1.28 -2.36,1.68 0.86,1.35 1.03,2.91 0.81,4.5 -0.12,1.77 -0.8,3.71 -2.33,4.72 l -0.1,-0.13 c 2.27,-2.59 0.51,-5.79 0.89,-8.82 -0.19,0.05 -0.39,0.09 -0.6,0.12 -1.01,0.2 -2.06,0.17 -3.02,0.1 -1.18,0.88 -2.4,1.72 -3.71,2.44 -0.63,0.32 -1.05,0.51 -1.17,0.85 -0.15,0.51 -0.38,1.44 -0.87,1.87 -1.5,1.29 -3.35,1.87 -5.28,2.31 l -0.07,-0.13 c 1.22,-1.41 2.74,-2.38 4.28,-3.3 0.17,-0.13 0.3,-0.26 0.41,-0.46 0.12,-0.21 0.21,-0.53 0.44,-0.9 0.48,-0.8 1.37,-0.98 1.83,-1.16 1.18,-0.48 2.32,-1.03 3.46,-1.59 -0.12,0 -0.24,-0.02 -0.35,-0.03 -2.47,-0.25 -4.98,0.88 -7.49,1.11 l -0.05,-0.15 c 1.17,-0.6 2.37,-1.14 3.59,-1.63 2.65,-1.51 5.9,-0.43 8.65,-1 3.08,-1.43 5.37,-4.33 7.8,-6.72 1.58,-1.65 3.13,-3.34 4.63,-5.05 -0.13,-0.07 -0.24,-0.12 -0.32,-0.14 -0.5,-0.1 -2.11,0.51 -2.63,-0.91 -0.02,-0.05 -0.04,-0.11 -0.05,-0.17 -1.74,1.59 -3.66,2.98 -5.85,3.95 -0.36,0.14 -0.72,0.27 -1.08,0.39 -0.19,0.88 -0.48,1.72 -0.84,2.55 -0.33,1.1 -1.16,2.22 -2.52,2 l -0.06,-0.14 c 0.37,-1.15 0.66,-1.73 1.51,-2.51 0.46,-0.55 0.9,-1.13 1.34,-1.72 -1.63,0.53 -3.27,0.9 -4.96,1.16 -1.38,1.58 -2.8,3.1 -4.51,4.37 -2.02,1.28 -4.21,1.88 -6.43,2.64 -0.79,-0.18 -1.73,-0.26 -2.46,-0.1 -0.75,0.13 -1.21,0.65 -1.81,1.09 -1.38,1.06 -2.81,2.08 -4.35,2.93 l -0.1,-0.12 c 1.36,-1.81 2.8,-3.33 4.44,-4.84 1.24,-0.96 2.88,-0.82 4.25,-0.39 -0.06,0.01 -0.13,0.03 -0.19,0.04 h 0.38 c -0.06,-0.01 -0.13,-0.03 -0.19,-0.04 2.01,-0.48 4.21,-0.97 6.01,-1.92 1.63,-1 3.14,-2.29 4.57,-3.6 -0.7,0.11 -1.4,0.2 -2.12,0.28 l -0.17,0.02 c -0.4,-0.22 -0.85,-0.43 -1.37,-0.5 -1.26,-0.25 -2.55,0.58 -3.64,1.13 -1.37,0.63 -2.78,1.28 -4.29,1.51 -0.5,0.06 -1.1,0.14 -1.57,-0.22 l 0.09,-0.13 c 0.91,0.18 1.8,-0.49 2.59,-0.89 1.22,-0.68 2.54,-1.55 3.73,-2.29 1.42,-0.94 3.33,-1.03 4.81,-0.14 -0.08,0.01 -0.15,0.01 -0.23,0.01 l 0.45,0.13 c -0.07,-0.05 -0.14,-0.09 -0.22,-0.14 2.86,-0.06 5.89,-0.53 8.62,-1.39 2.21,-0.82 4.27,-2.07 6.15,-3.53 0,0 -1.23,-2.49 1.84,-2.45 3.06,0.03 11.62,-0.14 12.87,0 0.78,0.08 2.35,0.51 3.3,0.83 l 2.01,0.09 c 3.56,-0.09 7.79,-0.51 10.89,1.89 l -0.09,0.13 c -3.2,-2.22 -7.16,-1.59 -10.82,-1.35 l -6.34,-0.02 h -0.34 c -0.08,0.02 -0.13,0.02 -0.13,0.02 0.03,0.26 -0.02,0.51 -0.24,0.74 l 4.13,1.21 c 0.59,0.09 1.38,0.26 2.22,0.47 1.67,0.26 3.32,0.53 4.71,0.74 1.29,0.22 2.62,0.4 3.94,0.63 3.08,-0.48 6.24,-0.01 9.23,0.82 1.19,0.35 2.38,0.71 3.55,1.12 l -0.04,0.15 c -2.15,-0.23 -5.14,-0.9 -7.28,-0.78 -0.19,0.02 -0.38,0.03 -0.57,0.04 0.47,0.22 0.91,0.49 1.25,0.91 0.09,0.16 0.15,0.23 0.19,0.36 2.95,2.7 6.26,5.75 10.55,5.37 1.4,-0.03 2.8,-0.21 4.17,-0.51 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
<path class="cls-2" d="m 58.94,49.49 c -2.16,2.14 -4.878388,5.685981 -7.398388,8.265981 -0.77,1.89 -0.667729,1.811262 -2.437418,4.441436 -0.744932,0.668951 -1.279589,2.221357 -1.432116,5.233767 0,0 0.0051,-0.126174 -0.0021,-0.0012 -0.06845,1.194075 0.81,22.05 0.88,23.06 0.06,1.01 0.44514,10.701076 1.49139,11.794826 l -13.053426,0.23081 c 0,0 2.084536,-10.515636 -0.05796,-33.765636 -0.4,-4.03 -1.295223,-6.254757 -1.295223,-6.254757 0,0 -0.275243,-0.697418 -0.974777,-1.745243 C 29.06,55.61 21.859375,52.483125 21.799375,52.453125 L 23.77,51.03 c 0.24,0.1 4.92,2.1 9.96,6.12 -2,-2.51 -5.131864,-6.345495 -7.531864,-9.195495 L 28.49,47.37 c 5.05,6.03 6.732813,7.8925 8.292813,10.0225 0.452812,0.955625 1.390937,0.944688 1.239687,0.135625 -1.31,-3.42 -3.645083,-8.734339 -5.865083,-13.034339 L 34.19,43.8 c 0.63,1.21 5.06195,8.926669 6.62195,13.356669 0.163125,0.66625 0.843182,0.688353 0.99555,0.698543 0.66838,-0.191391 0.538107,-0.759886 0.614358,-1.350511 0.01,-4.09 0.708142,-8.115109 0.628142,-12.515109 L 45.18,44.26 c 0.08,4.45 0.345728,10.679029 0.315728,14.969029 0.234913,1.483728 1.069029,0.687262 1.68266,0.561612 1.109767,-0.498952 0.98,-0.643301 1.401612,-1.240641 2.59,-5.67 4.46,-12.46 4.49,-12.57 l 2.06,0.56 c -0.08,0.3 -1.06,3.84 -2.59,7.96 2.75,-2.79 5.09,-5.12 5.7,-5.72 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccscccccccccccccccccccccccccccc"/>
<path class="cls-3" d="M75.96,47.85c-1.15.2-2.11,1.04-2.38,2.18-.56,2.35-2.46,5.3-8.86-1.02-.02-.02-.05-.05-.07-.07-.01.02-.02.04-.03.05-.69,1.34-5.68.51-5.68.51l-.7-.71s-1.06-.78-1.3-1.73h-.01s-.05-.01-.05-.01c-1,.07-1.75-.5-1.75-.5l-.29-.08c-.99-.27-2.01-.33-3.03-.27-.92.05-2.12-.09-2.8-1.04-.87-1.21-1.81-2-2.27-2.35-.08-.06-.19.02-.16.12.12.48.12,1.31-1.39,1.34l-2.1.05s-.04,0-.06-.02c-.17-.11-1.09-.77-1.28-1.52-.02-.1-.15-.12-.19-.03-.25.48-.7,1.06-1.44,1.06-.32,0-1.61-.42-2.76-.83-.86-.31-1.77,0-2.4.65-.21.22-.46.32-.77.18l-1.86.95s-.05.02-.08,0c-.02,0-.04-.01-.06-.02-1.17-.37-2.4.27-2.73,1.46-.29,1.04-.63,1.78-.97,1.17l-.39.33c-.83.69-1.93.97-2.99.76h0c-.59-.17-1.13.37-1,.96.18.81.2,1.57-.34,1.61-.54,1.28-1.78,2.12-3.16,2.16-.77.02-1.54-.02-1.94-.19-.95-.41-.59,6.45-5.28,3.58-.59-.36-1.29-.49-1.95-.3-2.01.59-6.15,1.35-4.93-2.89.26-.9-.19-1.86-1.03-2.27-1.06-.53-2.12-1.59-1.63-3.73.19-.83-.28-1.7-1.08-2-1.86-.71-4.28-2.52-1.54-6.98.83-1.35.92-3.03.37-4.52-.33-.88-.29-1.86.88-2.53.92-.53,1.3-1.65.84-2.61-1.27-2.68-2.46-7.14,3.56-7.19.92,0,1.65-.8,1.57-1.71-.08-.85.22-1.75,1.61-2.14.75-.21,1.19-.97,1.06-1.73-.55-3.09-.77-9.51,7.77-6.62.93.31,1.88-.3,2.01-1.27.13-1.05.76-1.98,2.73-1.49.91.22,1.81-.35,1.98-1.27.47-2.48,2.01-6.06,7.13-2.51.82.57,1.92.56,2.7-.05.71-.55,1.68-.9,2.68,0,.71.63,1.77.69,2.57.17,1.28-.84,3.1-1.55,4.43-.1.6.65,1.64.65,2.25,0,2.16-2.28,6.44-5.49,9.2,1.04.43,1.01,1.61,1.4,2.61.96.91-.39,1.91-.33,2.38,1.39.27,1.01,1.34,1.59,2.35,1.34,3.18-.77,8.55-1.15,5.48,6.27-.39.94.32,1.99,1.34,1.98,2.16-.02,5,.77,5.09,5.01.03,1.4,1.07,2.58,2.46,2.71,2.27.21,4.65,1.23,1.38,5.15-.73.87-.5,2.2.52,2.71,1.74.88,3.34,2.55.27,5.39-.75.69-.82,1.86-.18,2.65,1.9,2.36,4.28,6.95-4.3,8.41Z" id="path3"/>
</g>
</svg>`;
      }
      return `<svg class="plant6" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 85.57 145.53">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="M85.57,115.18c-2.76.71-5.67,1.29-8.51.44-1.4-.53-2.59-1.31-3.78-2.11-1.19-.81-2.31-1.69-3.4-2.64l-.18-.51c-.01.2.01.14,0,.17-.44-.45-1.12-.63-1.75-.82-2.03-.44-4.13-.71-6.21-1.02.23.23.44.5.62.81.12.22.18.53.19.79.18.88.97,1.56,1.67,2.27,1.87,1.79,4,3.3,6.09,4.85l-.08.14c-2.39-1.13-4.69-2.46-6.8-4.09-.9-.79-2.2-1.74-2.33-3.16-.08-.3-.35-.5-.73-.76-2.17-1.23-4.79-1.8-7.23-2.38-.79-.27-2.34-.79-4.09-1.39,1.87,1.28,3.6,2.77,4.97,4.6.61.93,1.13,1.91,1.61,2.91,2.2,1.5,4.2,3.23,6.26,4.85,1.34.96,2.84,1.86,4.37,2.48,1.13.5,2.42.48,3.38,1.32.96.87,1.43,1.79,2.55,2.38.98.88,1.06,2.14,1.78,3.11.65.88,1.69,1.51,2.79,1.81l-.03.15c-1.16-.21-2.29-.75-3.13-1.67-.82-.92-1.11-2.23-1.9-2.79-1.08-.43-1.85-1.52-2.68-2.18-.91-.65-2.16-.54-3.18-.95-2.28-.76-4.59-1.8-6.29-3.52-1.14-1.11-2.23-2.25-3.22-3.47.33.74.65,1.49.98,2.22,1.42,2.93,4.37,4.71,6.95,6.52.51.28,1.1.74,1.4,1.29,1.39,2.32,1.8,5.07,2.17,7.7l-.15.02c-.52-2.72-.95-5.73-2.72-7.94-2.94-2.16-6.59-3.81-8.34-7.22-1.06-2.2-2.01-4.46-3.38-6.46-1.7-2.16-3.95-3.8-6.35-5.18-.42.29-.74.61-.98.91.15.34.31.68.46,1.02,1.69,1.21,2.8,2.97,4.18,4.53,1.06,1.04,2.28,2.14,2.89,3.53l-.13.08c-1.29-1.5-3.06-2.57-4.65-3.86.01.02.02.03.03.05,2.84,4,3.84,9.2,6.4,13.42,1.66,2.89,3.2,6.23,2.73,9.66-.22,1.69-.65,3.32-1.32,4.85l-.14-.06c2.39-7.87-1.21-11.14-4.43-17.36-.17.54-.45,1.04-.8,1.5-.53.83-1.49.89-1.96,1.81-.68,1.68-.53,3.8-.39,5.63l-.16.04c-.69-2.39-1.71-5.67.38-7.71.88-.72,1.65-1.42,2.44-2.27-1.34-2.96-2.17-5.95-4.08-8.71-.96-1.67-1.77-3.38-2.5-5.12-.21.07-.46.13-.73.18-.04.68-.12,1.25-.23,1.59.07,1.7.24,3.4.42,5.09.22,1.43.3,3.67.84,4.98l-.11.11c-1.6-3.11-1.86-6.67-2.7-10.04.03-.53.08-1.05.15-1.58h-.33c-.09,2.39-.29,4.76-.85,7.08-.27,2.14-.54,4.52-.61,6.08-.27,2.5.45,4.86.3,7.33-.05,1.28-.16,2.54-.33,3.8-.55,1.07-1.08,2.16-1.59,3.25-.67,1.59-1.57,3.2-1.66,4.94.03,1.75.76,3.43,1.63,4.94l-.13.09c-.98-1.51-1.81-3.2-1.95-5.02.1-2.79,1.94-6.42,2.83-8.38.17-2.4.33-4.84-.21-7.19-.15-1.03-.23-2.03-.25-3.03-.56,1.35-1.19,2.67-1.99,3.9-1.16,1.8-2.64,3.58-3.94,5.27-.37.54-.94,1.15-1,1.79l-.15.05c-.12-.44.07-.79.19-1.14,1.03-2.33,2.54-4.45,3.71-6.67.67-1.25,1.22-2.58,1.74-3.92-1.74,1.18-3.6,2.1-5.54,2.84l-.06-.14c2.12-1.23,4.7-2.51,6.29-4.46.3-.77.61-1.53.95-2.27l.24-.57c.05-.41.09-.82.12-1.03.39-2.74.44-5.56,1-8.26-.2-.21-.46-.45-.73-.65.04-.06.09-.11.13-.17l-.12-.1c-.05.06-.1.11-.15.17-.1-.07-.2-.14-.29-.19-2.97,3.94-5.97,7.83-9.59,11.25-.69.64-1.47,1.28-2.36,1.68.86,1.35,1.03,2.91.81,4.5-.12,1.77-.8,3.71-2.33,4.72l-.1-.13c2.27-2.59.51-5.79.89-8.82-.19.05-.39.09-.6.12-1.01.2-2.06.17-3.02.1-1.18.88-2.4,1.72-3.71,2.44-.63.32-1.05.51-1.17.85-.15.51-.38,1.44-.87,1.87-1.5,1.29-3.35,1.87-5.28,2.31l-.07-.13c1.22-1.41,2.74-2.38,4.28-3.3.17-.13.3-.26.41-.46.12-.21.21-.53.44-.9.48-.8,1.37-.98,1.83-1.16,1.18-.48,2.32-1.03,3.46-1.59-.12,0-.24-.02-.35-.03-2.47-.25-4.98.88-7.49,1.11l-.05-.15c1.17-.6,2.37-1.14,3.59-1.63,2.65-1.51,5.9-.43,8.65-1,3.08-1.43,5.37-4.33,7.8-6.72,1.58-1.65,3.13-3.34,4.63-5.05-.13-.07-.24-.12-.32-.14-.5-.1-2.11.51-2.63-.91-.02-.05-.04-.11-.05-.17-1.74,1.59-3.66,2.98-5.85,3.95-.36.14-.72.27-1.08.39-.19.88-.48,1.72-.84,2.55-.33,1.1-1.16,2.22-2.52,2l-.06-.14c.37-1.15.66-1.73,1.51-2.51.46-.55.9-1.13,1.34-1.72-1.63.53-3.27.9-4.96,1.16-1.38,1.58-2.8,3.1-4.51,4.37-2.02,1.28-4.21,1.88-6.43,2.64-.79-.18-1.73-.26-2.46-.1-.75.13-1.21.65-1.81,1.09-1.38,1.06-2.81,2.08-4.35,2.93l-.1-.12c1.36-1.81,2.8-3.33,4.44-4.84,1.24-.96,2.88-.82,4.25-.39-.06.01-.13.03-.19.04h.38c-.06-.01-.13-.03-.19-.04,2.01-.48,4.21-.97,6.01-1.92,1.63-1,3.14-2.29,4.57-3.6-.7.11-1.4.2-2.12.28l-.17.02c-.4-.22-.85-.43-1.37-.5-1.26-.25-2.55.58-3.64,1.13-1.37.63-2.78,1.28-4.29,1.51-.5.06-1.1.14-1.57-.22l.09-.13c.91.18,1.8-.49,2.59-.89,1.22-.68,2.54-1.55,3.73-2.29,1.42-.94,3.33-1.03,4.81-.14-.08.01-.15.01-.23.01l.45.13c-.07-.05-.14-.09-.22-.14,2.86-.06,5.89-.53,8.62-1.39,2.21-.82,4.27-2.07,6.15-3.53,0,0-1.23-2.49,1.84-2.45,3.06.03,11.62-.14,12.87,0,.78.08,2.35.51,3.3.83l2.01.09c3.56-.09,7.79-.51,10.89,1.89l-.09.13c-3.2-2.22-7.16-1.59-10.82-1.35l-6.34-.02h-.34c-.08.02-.13.02-.13.02.03.26-.02.51-.24.74l4.13,1.21c.59.09,1.38.26,2.22.47,1.67.26,3.32.53,4.71.74,1.29.22,2.62.4,3.94.63,3.08-.48,6.24-.01,9.23.82,1.19.35,2.38.71,3.55,1.12l-.04.15c-2.15-.23-5.14-.9-7.28-.78-.19.02-.38.03-.57.04.47.22.91.49,1.25.91.09.16.15.23.19.36,2.95,2.7,6.26,5.75,10.55,5.37,1.4-.03,2.8-.21,4.17-.51l.04.16Z" id="path1"/>
<path class="cls-2" d="m 58.94,49.49 c -2.16,2.14 -3.29,3.99875 -5.81,6.57875 -1.77,1.35875 -3.14,4.58125 -4.07,6.26125 -0.358233,0.657903 -0.437748,1.145806 -0.437748,1.145806 0,0 -0.889844,1.022874 -0.952252,3.954194 -0.02546,1.195764 0.81,22.05 0.88,23.06 0.06,1.01 0.3539,12.58371 1.183734,11.93237 l -12.741701,-0.031 c 0,0 0.267967,-30.39135 -0.06203,-33.64135 -0.4,-4.03 -2.61,-6.31 -2.61,-6.31 0,0 0.0094,-0.0698 -0.258763,-0.406366 C 28.461238,56.893634 23,53.03 22.94,53 l 0.83,-1.97 c 0.24,0.1 6.408798,3.774898 11.448798,7.794898 C 33.218798,56.314898 29.25,51.6 26.85,48.75 l 1.64,-1.38 c 5.05,6.03 7.85,9.58 9.41,11.71 0.32,-0.06 0.68,-0.11 1.06,-0.13 -1.31,-3.42 -4.45,-9.88 -6.67,-14.18 l 1.9,-0.97 c 0.63,1.21 5.47,10.68 7.03,15.11 0.21,0.01 0.43,0.02 0.65,0.03 0.48,0.03 0.92,0.07 1.34,0.12 0.01,-4.09 -0.08,-10.35 -0.16,-14.75 l 2.13,-0.05 c 0.08,4.45 0.18,10.9 0.15,15.19 0.71,0.18 1.29,0.4 1.76,0.65 0.48,-0.51 0.98,-1.03 1.49,-1.55 2.59,-5.67 4.46,-12.46 4.49,-12.57 l 2.06,0.56 c -0.08,0.3 -1.06,3.84 -2.59,7.96 2.75,-2.79 5.09,-5.12 5.7,-5.72 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccscccccccccccccccccccccccccccc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 22.936776,52.988814 C 8.6620581,42.514795 8.6178639,38.095378 9.3691648,37.741824 c 0.7513012,-0.353553 1.3258262,0 1.7235732,0.618718 0.397748,0.618719 3.852935,7.008569 12.69177,12.709617 8.838835,5.701048 -0.847732,1.918655 -0.847732,1.918655 z" id="path18" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 26.9375,48.875 C 16.25,36.6875 14.75,22.5625 16.9375,22.8125 c 2.1875,0.25 1.5,-0.125 1.8125,1.5625 0.3125,1.6875 -2.625,3.8125 9.75,23.0625 12.375,19.25 -1.5625,1.4375 -1.5625,1.4375 z" id="path19" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 32.215228,44.575602 C 25.121478,19.981852 29.28125,21.125 29.28125,21.125 c 0,0 1.5,-0.9375 1.53125,0.5625 0.0651,3.124947 -0.800476,9.246859 4.949524,25.371859 5.75,16.125 -3.546796,-2.483757 -3.546796,-2.483757 z" id="path20" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccssc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 42.543544,44.25 c -0.6875,-14.3125 -0.682586,-26.300964 1.119369,-26.095971 0.71317,0.08113 1.230711,-0.02016 1.563582,0.451039 0.678156,0.959969 -0.16564,-0.960837 0.08601,25.457432 0.286632,30.091319 -3.433394,12.770294 -2.768956,0.1875 z" id="path21" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 55.09375,46.71875 c 7.875,-20.6875 6.453148,-23.392061 6.489546,-23.692862 C 61.823199,21.043282 58.970359,21.467829 59.25,22.5 c 0,0 0.745055,2.977496 -1.875,10.0625 -0.5894,1.593822 -4.34375,13.5625 -4.34375,13.5625 z" id="path22" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 50.691495,58.099558 c 11.479743,-8.758883 23.218927,-24.438597 23.218927,-24.438597 0,0 -0.222922,-2.285961 -1.660422,-0.535961 -1.4375,1.75 -1.06315,3.715879 -13.875,15.59532 -12.800553,11.868968 -7.683505,9.379238 -7.683505,9.379238 z" id="path23" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccssc"/>
<path style="fill:#5b4511;stroke-width:3.98684;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 18.598286,40.877464 c 3.788642,6.986624 2.536328,9.189 2.076217,9.271064 -0.460112,0.08206 -0.887317,0.400416 -0.8987,0.04326 -0.01138,-0.35716 0.437356,-4.530125 -2.134568,-8.466281 -2.571925,-3.936158 0.957052,-0.848041 0.957052,-0.848041 z" id="path18-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 23.97196,28.587728 c -0.206727,6.801774 -2.651484,8.34761 -3.144703,8.304107 -0.493219,-0.0435 -1.086051,0.119751 -0.898182,-0.183382 0.18787,-0.303133 2.948693,-3.702617 2.639679,-7.641604 -0.309015,-3.938988 1.403205,-0.479125 1.403205,-0.479125 z" id="path18-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 49.922475,25.58998 c -3.309912,5.9457 -6.19164,6.194881 -6.609677,5.929547 -0.418038,-0.265333 -1.019573,-0.392833 -0.713395,-0.575697 0.306178,-0.182864 4.320604,-1.933014 5.856652,-5.573297 1.536048,-3.640285 1.466421,0.219443 1.466421,0.219443 z" id="path18-5-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 63.194868,35.764064 c -3.694235,5.714848 -6.586117,5.773736 -6.985775,5.48145 -0.39966,-0.292282 -0.991493,-0.459115 -0.673939,-0.621421 0.317555,-0.162307 4.438511,-1.64432 6.210927,-5.175559 1.772416,-3.53124 1.448784,0.315546 1.448784,0.315546 z" id="path18-5-12" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 77.513849,37.497673 c -5.545121,3.944428 -8.253928,2.930127 -8.51723,2.510806 -0.263304,-0.419318 -0.751545,-0.793111 -0.396485,-0.826534 0.355059,-0.03342 4.731956,0.112901 7.684189,-2.513013 2.952234,-2.625917 1.229528,0.828738 1.229528,0.828738 z" id="path18-5-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 32.708579,18.533854 c -0.206727,6.801774 -2.651484,8.34761 -3.144703,8.304107 -0.493219,-0.0435 -1.086051,0.119751 -0.898182,-0.183382 0.18787,-0.303133 2.948693,-3.702617 2.639679,-7.641604 -0.309015,-3.938988 1.403205,-0.479125 1.403205,-0.479125 z" id="path18-5-10" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 17.355287,31.360936 c -5.615227,-3.843968 -5.597672,-6.736396 -5.294927,-7.12819 0.302742,-0.391796 0.485157,-0.979015 0.639015,-0.657282 0.153858,0.321734 1.526451,4.480414 5.009618,6.345529 3.483169,1.865115 -0.353702,1.439945 -0.353702,1.439945 z" id="path18-5-11" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.781685,29.050041 c 4.985386,4.631716 4.540504,7.489779 4.183175,7.832522 -0.357328,0.342746 -0.624533,0.896552 -0.729147,0.555612 -0.104614,-0.340941 -0.84745,-4.656822 -4.016683,-7.016287 -3.169234,-2.359464 0.562651,-1.371849 0.562651,-1.371849 z" id="path18-5-18" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:3.8943;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 42.71724,26.195717 c -4.696787,-4.924131 -4.080238,-7.750137 -3.702875,-8.070692 0.377359,-0.320557 0.677499,-0.857228 0.761347,-0.510597 0.08385,0.346633 0.564877,4.699476 3.585945,7.245897 3.021069,2.546421 -0.644414,1.335394 -0.644414,1.335394 z" id="path18-5-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:4.40149;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 53.87212,27.967442 c 5.22023,5.45193 4.473249,8.662799 4.041101,9.034616 -0.432145,0.371818 -0.780866,0.986108 -0.869461,0.596215 -0.08859,-0.389893 -0.554826,-5.300133 -3.923619,-8.104841 -3.368794,-2.804709 0.751976,-1.525992 0.751976,-1.525992 z" id="path18-5-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="csssc"/>
<path style="fill:#5b4511;stroke-width:4.37661;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 59.708986,31.843194 c 8.464907,-7.428638 8.175062,-9.144925 8.253648,-9.276681 0.51797,-0.868407 -1.188878,-1.533972 -1.228084,-0.958907 0,0 -0.148202,1.64016 -3.003403,4.207692 -0.642298,0.577585 -5.082927,5.119078 -5.082927,5.119078 z" id="path22-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.31783;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 31.405695,34.42001 c 6.342608,-8.223536 5.197434,-9.298633 5.226749,-9.418205 0.19322,-0.788111 -2.104487,-0.619348 -1.879261,-0.209047 0,0 0.600075,1.183591 -1.510146,3.999968 -0.474709,0.633564 -3.498502,5.391262 -3.498502,5.391262 z" id="path22-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.00161;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 30.928104,33.460835 C 25.97547,23.000554 24.326567,22.333688 24.222647,22.203918 c -0.684946,-0.855332 -1.682716,0.128535 -1.160862,0.458208 0,0 1.480205,0.968615 3.207808,4.529032 0.388636,0.800941 3.581472,6.623557 3.581472,6.623557 z" id="path22-19" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:7.631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 45.290403,52.852141 c 1,2.65625 5.625762,-0.157281 5.625762,-0.157281 L 51.90192,51.510236 50.15625,58.031255 47.40625,62 41.25,61.71875 34.96875,60.90625 c 0,0 -2,-1.84375 -2.0625,-1.96875 -0.0625,-0.125 -1.375,-1.90625 -1.375,-1.90625 l -1.34375,-1.125 c 0,0 -0.5,-0.9375 1.53125,-0.03125 2.03125,0.90625 -0.25,-1.03125 0.28125,-1.28125 0.53125,-0.25 1.75,-0.71875 1.75,-0.71875 0,0 2.03033,1.038071 2.392116,-1.171145 0.566377,-3.458532 9.148287,0.148286 9.148287,0.148286 z" id="path24" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccsccsscsc"/>
<path style="fill:#5b4511;stroke-width:3.98631;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 28.77302,25.569011 C 24.631328,15.139492 25.660516,14.389834 25.650338,14.257744 c -0.06707,-0.870614 1.742241,0.01731 1.517967,0.36927 0,0 -0.607477,1.030713 0.761652,4.583319 0.307996,0.799184 2.19049,6.632396 2.19049,6.632396 z" id="path22-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:5.06895;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 44.781172,28.379561 c 6.02,-11.940859 4.933073,-13.501936 4.960897,-13.675559 0.183393,-1.144364 -1.997445,-0.899314 -1.783675,-0.303544 0,0 0.569553,1.718616 -1.433333,5.808092 -0.450564,0.919957 -3.320556,7.828298 -3.320556,7.828298 z" id="path22-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.1644;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 24.522248,53.798457 c -6.312325,0.82148 -5.48858,0.06797 -5.527822,0.05248 -0.258651,-0.10207 1.082713,-0.61998 0.94525,-0.424767 0,0 0.243407,0.09738 2.35347,-0.156926 0.474672,-0.05721 3.587361,-0.250923 3.587361,-0.250923 z" id="path22-8-2-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.9966;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 44.30936,42.989017 c 5.715282,-4.395569 4.683373,-4.97022 4.709788,-5.034133 0.17411,-0.421253 -1.192359,-0.0972 -0.98941,0.122111 0,0 -0.163255,0.398794 -2.064761,1.904178 C 45.53722,40.31982 42.8125,42.862861 42.8125,42.862861 Z" id="path22-8-2-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.8588;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 58.101768,50.657434 c 6.443516,-0.669142 6.448567,-1.774255 6.515578,-1.816409 0.441674,-0.277837 -0.478186,-0.769113 -0.569947,-0.456533 0,0 -0.417386,0.263923 -2.59786,0.525035 -0.490513,0.05874 -3.944543,0.778677 -3.944543,0.778677 z" id="path22-8-2-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.44122;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 35.74556,47.402266 c 3.800597,-9.957984 2.250696,-10.416765 2.240743,-10.534695 -0.0656,-0.777283 -1.433115,0.404718 -1.061195,0.670256 0,0 0.06391,0.735097 -1.173457,4.119018 -0.278354,0.761237 -1.807798,6.246676 -1.807798,6.246676 z" id="path22-8-2-0" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.69424;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 25.580233,45.301517 c 2.692708,-7.541843 2.206533,-8.52782 2.218979,-8.63748 0.08203,-0.72278 -0.561771,-0.166773 -0.466153,0.209516 0,0 -0.07692,0.684243 -0.972795,3.267156 C 26.158729,40.721753 24.875,45.08506 24.875,45.08506 Z" id="path22-8-2-83" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.1644;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 54.553107,54.20049 c 6.115908,-1.765206 5.415386,-0.895952 5.456517,-0.886565 0.271098,0.06184 -0.976684,0.776358 -0.870273,0.562626 0,0 -0.255321,-0.05951 -2.302791,0.510495 -0.460593,0.128224 -3.508339,0.789729 -3.508339,0.789729 z" id="path22-8-2-6-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.1644;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 44.44825,47.944705 c 3.760823,-5.135805 3.737855,-4.019648 3.776144,-4.037365 0.252346,-0.11679 -0.298304,1.211469 -0.344756,0.977276 0,0 -0.238433,0.108992 -1.510279,1.811768 -0.286108,0.383052 -2.293612,2.769741 -2.293612,2.769741 z" id="path22-8-2-6-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.84623;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 16.630101,47.946257 c -6.022568,-1.545116 -5.075723,-2.473624 -5.108036,-2.519245 -0.212985,-0.300651 1.15229,-0.572694 0.976988,-0.296271 0,0 0.200102,0.285249 2.208253,0.837235 0.451747,0.124164 3.368928,1.255689 3.368928,1.255689 z" id="path22-8-2-6-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
</g>
</svg>`;
    case 7:
      if (isAlive) {
        return `<svg class="plant7" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 132.59 173.99">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="m 107.74,134.09 c 4.33,1.12 8.78,1.21 13.16,0.86 l -0.02,-0.15 c -5.42,0.13 -11.01,-0.25 -15.89,-2.69 -1.01,-0.54 -2.1,-0.89 -3.22,-1.17 1.36,-0.02 2.71,-0.14 4.08,-0.27 2.88,-0.16 5.84,0.17 8.74,0.17 v -0.15 c -2.91,-0.49 -5.76,-1.13 -8.74,-1.28 -2.69,-0.22 -5.35,-0.12 -7.92,0.68 -1.32,-0.32 -2.6,-0.71 -3.77,-1.37 -1.36,-0.92 -2.79,-1.95 -4.33,-2.6 -1.86,-0.88 -4.530625,-0.88156 -6.566719,-1.2 l -0.682343,-0.1875 C 82.25375,124.62703 82.02,124.54 82.02,124.54 c -0.771875,-0.17594 -1.062656,-0.38156 -1.3,-0.64 h -12.1 v 0.05 c -0.260231,-1.25106 -4.158977,-0.63041 -4.648977,-0.56041 L 57.39,123.9 c 0,0 -0.65,1.21 -1.39,1.95 -0.55,0.04 -1.1,0.07 -1.67,0.1 -3.38,0.59 -6.03,2.7 -8.98,4.23 -2.94,1.41 -6.39,1.05 -9.58,1.26 v 0.15 c 2.62,0.02 5.25,0.05 7.88,-0.34 3.74,-0.94 6.87,-4.06 10.74,-4.52 0.2,-0.01 0.41,-0.01 0.61,-0.02 -0.23,0.6 0.08,1.7 0.25,2.2 l -3.68,1.77 c -2.64,1.47 -6.52,2.05 -7.81,5.24 -0.02,0.05 -0.04,0.09 -0.05,0.14 -1.37,0.95 -2.88,1.7 -4.44,2.21 -2.32,0.56 -7.91,2.62 -10.25,2.54 -1.2,0.02 -2.35,-0.46 -3.6,-0.39 -2.56,0.16 -4.45,2.29 -5.9,4.19 l 0.13,0.09 c 0.78,-0.9 1.66,-1.73 2.63,-2.4 0.97,-0.68 2.04,-1.15 3.16,-1.09 1.08,0 2.22,0.55 3.53,0.62 0.72,0.05 1.44,0.02 2.14,-0.08 -0.5,0.2 -1.01,0.38 -1.54,0.55 -3.39,1.69 -5.97,4.63 -8.55,7.29 l 0.1,0.11 c 2.11,-1.6 4.23,-3.24 6.46,-4.64 2.08,-1.25 4.72,-1.76 6.12,-3.8 2.02,-0.42 4.08,-0.7 6.1,-1.52 1.16,-0.48 2.26,-1.14 3.22,-1.94 -0.33,0.85 -0.66,1.7 -0.98,2.55 -2.66,2.36 -4.93,5.06 -7.44,7.53 -3.34,2.55 -6.42,4.47 -9.4,7.64 l 0.1,0.12 c 2.79,-2.21 5.65,-4.23 8.8,-5.89 2.72,-1.8 5.08,-4.06 6.99,-6.68 -0.72,2.3 -1.49,4.71 -2.66,6.75 -1.53,2.32 -4.12,4.05 -5.3,6.67 l 0.14,0.07 c 1.55,-2.47 4.18,-3.83 5.96,-6.16 1.68,-2.37 2.67,-5.45 3.54,-7.9 0.86,-1.97 1.68,-4 2.49,-5.99 1.23,-2.58 4.63,-3.06 6.96,-4.51 l 3.37,-1.76 0.21,-0.11 -0.17,0.17 c -0.68,0.7 -1.3,1.47 -1.96,2.15 -0.93,0.93 -2.49,1.91 -2.82,3.7 -0.13,0.86 0.02,1.57 -0.06,2.23 -0.69,3.43 -4.07,5.98 -6.45,8.37 l 0.1,0.12 c 1.17,-0.9 2.29,-1.85 3.37,-2.86 1.57,-1.54 3.48,-3.19 3.87,-5.51 0.13,-0.8 0.04,-1.58 0.17,-2.16 0.3,-1.31 1.7,-2.11 2.66,-2.97 0.92,-0.74 1.71,-1.73 2.49,-2.39 1.65,-0.19 3.6,-0.6 4.68,0.01 1.08,0.61 1.05,1.69 2.23,2.56 0.19,0.14 0.39,0.23 0.61,0.28 l -0.57,0.66 c -1.35,1.47 -2.67,2.96 -3.98,4.49 -1.43,0.68 -2.8,1.37 -4.26,1.99 -0.27,0.09 -0.52,0.15 -0.73,0.16 -0.15,0.01 -0.39,0.02 -0.5,0.07 -1.79,0.8 -2.97,2.4 -4.21,3.81 l 0.11,0.11 c 1.28,-1 2.6,-2.12 4.06,-2.78 0.16,-0.07 0.29,-0.1 0.42,-0.09 0.41,0.05 0.8,0 1.14,-0.06 0.55,-0.09 1.09,-0.22 1.62,-0.4 -0.51,0.61 -1,1.23 -1.49,1.85 -5.09,6.07 -8.2,14.17 -15.54,17.93 l 0.06,0.15 c 1.88,-0.78 3.52,-1.99 5.04,-3.32 2.61,-2.3 4.67,-5.1 6.7,-7.91 -0.91,2.53 -1.62,5.06 -2.09,7.78 -0.27,1.22 -0.32,2.59 -0.57,3.77 -0.89,1.72 -2.53,3.46 -4.39,4.11 v 0.16 c 0.92,-0.1 1.7,-0.56 2.42,-1.06 1.43,-1.05 3.01,-2.34 3.16,-4.23 0.82,-3.97 2.77,-7.76 2.48,-11.92 1.18,-1.61 2.38,-3.19 3.7,-4.66 2.59,-3.03 5.47,-5.81 8.04,-8.92 0.43,-0.56 0.89,-1.12 1.34,-1.7 0.47,-0.05 0.86,-0.04 1.07,0.2 0.2,0.22 0.38,0.42 0.58,0.57 -0.21,1.31 -0.53,2.58 -0.98,3.79 -0.5,1.48 -1.09,2.98 -1.78,4.34 -0.17,0.48 -0.34,0.95 -0.49,1.43 -1.27,1.35 -2.35,2.79 -3.49,4.25 -1.81,2.56 -3.28,5.31 -4.66,8.08 l 0.14,0.08 c 1.61,-2.19 3.19,-4.45 4.92,-6.52 0.57,-0.67 1.27,-1.28 1.87,-1.94 -0.24,0.8 -0.46,1.6 -0.68,2.4 -0.92,3.68 -1.94,7.55 -2.11,11.39 -0.35,0.24 -0.63,0.41 -0.93,0.66 -1.02,1.18 -2.02,2.47 -3.18,3.61 l 0.08,0.13 c 1.05,-0.42 2.02,-0.96 2.96,-1.6 0.38,-0.21 0.77,-0.49 1.07,-0.83 0.09,2.25 0.53,4.46 1.53,6.59 0.54,1.25 1.18,2.44 2.02,3.51 l 0.13,-0.09 c -2.01,-3.42 -2.91,-7.43 -2.64,-11.36 0.77,-6.55 2.96,-12.94 4.95,-19.2 1.09,-2.18 2.17,-5.43 2.65,-8.31 0.19,-0.02 0.39,0.01 0.59,0.03 0.18,3.67 0.19,7.36 0.57,11.08 0.31,4.07 1.33,8.06 1.61,12.1 -0.16,3.12 -0.68,6.39 -0.73,9.51 l 0.16,-0.02 c 0.1,-2.57 0.58,-5.5 0.85,-8.1 0.08,-0.9 0.26,-1.86 0.1,-2.76 -0.1,-0.71 -0.2,-1.43 -0.3,-2.14 0.32,0.92 0.7,1.83 1.14,2.71 0.94,2.27 3.09,3.84 4.31,5.9 1.21,2.03 2.02,4.34 2.56,6.67 1.03,2.11 3.14,3.54 5.4,4.01 l 0.03,-0.15 c -2.1,-0.6 -4.01,-2.06 -4.85,-4.1 -0.25,-2.02 -1.1,-4.85 -2.23,-6.95 -1.11,-2.2 -3.08,-3.65 -3.89,-6 -1.57,-3.87 -2.49,-7.95 -3.51,-12.02 0,0 -0.01,-0.01 -0.01,-0.02 -0.18,-3.19 -0.15,-6.36 -0.24,-9.52 0.1,0.02 0.2,0.03 0.29,0.03 -0.03,2.24 0.04,4.6 0.22,6.72 0.27,6.36 5.38,10.92 8.54,15.97 1.7,2.98 6.18,3.03 8.01,5.46 0.92,1.43 1.12,3.37 0.42,5.07 l 0.14,0.08 c 1.08,-1.58 1.23,-3.81 0.31,-5.63 -1.38,-2.68 -4.79,-3 -6.76,-4.94 -0.11,-0.14 -0.21,-0.27 -0.32,-0.41 0.52,0.22 1.07,0.37 1.64,0.43 1.2,0.08 2.41,-0.14 3.45,0.34 1.5,0.9 2.62,2.43 3.7,3.83 l 0.13,-0.08 c -1.1,-2.18 -2.52,-5.03 -5.26,-5.31 -2.13,-0.25 -3.68,-0.89 -5.46,-1.62 -0.92,-1.25 -1.85,-2.5 -2.9,-3.7 -2.31,-2.83 -4.41,-5.88 -4.68,-9.6 -0.28,-2.27 -0.4,-4.57 -0.46,-6.87 0.56,-0.62 0.18,-2.13 1.61,-2.86 l 0.06,-0.03 c 0.29,-0.15 0.53,-0.22 0.74,-0.24 0.79,-0.1 1.11,0.48 1.73,0.57 h 0.01 c 0.52,0.84 1.1,1.65 1.76,2.39 0.13,0.15 0.26,0.3 0.4,0.44 -1.62,3.34 -2.89,8.81 1.38,10.33 1.25,0.44 1.87,1.58 2.2,2.79 0,0 0.01,0.02 0.01,0.03 -0.05,0.03 0.16,0.09 0.16,-0.02 h -0.16 c 0,0 -0.01,0 0,-0.03 0.01,-0.06 0.11,-0.05 0.15,-0.03 -0.01,-0.06 -0.02,-0.15 -0.02,-0.2 -0.94,-5.51 -5.29,-1.26 -3.31,-9.55 0.11,-0.88 0.19,-1.78 0.19,-2.7 0.65,0.66 1.34,1.28 2.05,1.88 h 0.01 c 1,0.94 2.03,1.95 2.44,2.6 0.33,0.67 1.06,1.81 0.98,2.54 -0.13,1.08 -0.26,2.25 -0.28,3.34 0,0.83 -0.09,1.73 0.45,2.47 1.04,1.31 2.63,1.29 2.91,3 0.16,0.68 0.18,1.41 0.18,2.14 l 0.16,0.02 c 0.29,-1.45 0.48,-3.37 -0.87,-4.38 -0.58,-0.51 -1.23,-0.9 -1.48,-1.37 -0.38,-1.23 0.11,-2.66 0.23,-3.93 0.11,-0.7 0.32,-1.58 0.13,-2.31 0.98,0.91 1.9,1.88 2.69,2.97 2.46,3.09 2.57,7.32 4.84,10.54 1.07,1.61 2.75,3.21 4.82,3.15 l -0.02,-0.15 c -1.95,-0.06 -3.47,-1.67 -4.41,-3.25 -1.46,-2.4 -1.85,-5.24 -2.81,-7.84 0.83,0.73 1.83,1.29 2.9,1.68 2.35,0.48 3.96,2.18 6.15,3.15 0.17,0.08 0.42,0.11 0.61,0.17 1.82,0.94 3.11,2.75 4.51,4.26 l 0.13,-0.09 c -1.08,-1.67 -2.17,-3.4 -3.72,-4.72 -0.23,-0.19 -0.61,-0.38 -0.94,-0.47 -0.71,-0.29 -1.33,-0.86 -2.02,-1.39 -0.95,-0.76 -1.88,-1.65 -3.08,-2.13 -1.72,-0.4 -3.28,-0.82 -4.97,-1.51 -0.32,-0.69 -0.69,-1.35 -1.16,-1.98 -1.07,-1.55 -2.35,-2.92 -3.71,-4.24 0.57,0.13 1.16,0.2 1.79,0.2 1.56,-0.39 3.19,-0.74 4.84,-0.85 2.48,-0.23 5.14,0.02 7.32,1.25 0.51,0.72 1.26,1.25 2.13,1.62 1.42,1.24 2.76,2.57 3.92,4 2.58,2.26 5.48,4.36 8.87,5.12 l 0.03,-0.16 c -3.26,-0.88 -6.02,-3.08 -8.42,-5.37 -0.85,-1.13 -1.66,-2.12 -2.49,-2.99 2.81,0.61 6.21,0.34 8.38,0.26 v -0.16 c -2.23,-0.27 -4.44,-0.62 -6.57,-1.15 -1.55,-0.53 -3.01,-0.86 -4.5,-1.35 H 101 c -3.38,-2.42 -7.16,-2.9 -12.94,-1.82 -0.66,0.27 -1.27,0.11 -2.03,-0.09 -0.86,-0.22 -1.95,-0.62 -3.06,-1.05 -1.57,-1.44 -3.11,-2.88 -4.4,-4.49 0.35,0.04 0.65,0.01 0.84,-0.13 0.64,-0.47 -0.07,-3.85 1.62,-3.78 1.69,0.07 3.37,0.14 3.64,-0.2 0.17,-0.21 0.51,-0.48 0.75,-0.78 0.45,0.34 0.9,0.67 1.34,1.01 0.2,0.16 0.39,0.33 0.51,0.47 1.4,2.39 4.3,3.57 6.5,5.03 l 0.12,-0.11 c -1.67,-1.6 -3.79,-3.02 -5.09,-4.85 -0.17,-0.27 -0.09,-0.22 -0.33,-0.76 -0.5,-0.94 -1.29,-1.58 -2.16,-2.07 1.01,0.14 1.99,0.34 2.94,0.72 1.97,0.66 3.68,2.23 5.54,2.9 0.68,0.96 1.19,1.88 1.52,2.92 0.31,0.67 0.86,1.01 1.38,1.38 3.09,1.67 6.44,2.71 9.78,3.6 l 0.05,-0.15 c -3.24,-1.59 -6.88,-2.85 -9.57,-5.3 -0.12,-0.1 -0.13,-0.16 -0.16,-0.19 -0.06,-0.03 -0.07,-0.1 -0.1,-0.16 -0.26,-0.61 -0.62,-1.15 -1.06,-1.6 1.67,0.4 3.32,0.67 4.96,0.98 2.14,0.39 4.05,1.61 6.15,2.15 z m -25.26,4.88 0.18,0.15 c -0.07,-0.03 -0.15,-0.05 -0.22,-0.08 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccscccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccsccccccccccccccccccccccccc"/>
<a id="a3">
  <path class="cls-2" d="m 84.27,87.23 c -1.13,0.78 -2.29,1.59 -3.3,2.3 0.07,0.21 -1.643125,0.7425 -2.54,2.175625 -0.99,2.24 -1.27,2.434375 -1.81,4.414375 -0.54,1.98 -1.53,6.56 -1.08,9.89 0.45,3.32 2.85,15.32 5.17,17.9 H 57.38 c 0,0 6.66,-12.24 6.56,-20.06 C 63.89,99.52 63.9,94.37 63.91,90.63 63.807774,88.375483 56.777703,84.536067 53.020155,82.437262 45.118621,78.199029 36.48,75.33 35.08,74.86 c 0.33,-0.07 0.66,-0.13 0.99,-0.17 1.32,-0.17 2.46,-0.46 3.46,-0.85 1.82,0.66 4.15,1.51 6.66,2.52 -2.04,-1.65 -3.65,-2.97 -4.47,-3.65 0.74,-0.49 1.36,-1.04 1.87,-1.59 1.89,1.54 6.48,5.29 11.24,9.04 0.85,0.41 1.68,0.83 2.48,1.26 C 54.48,77.5 51.015961,72.562408 48.575961,69.232408 L 49.2,69.94 c 1.36,1.03 2.141875,0.899375 3.421875,1.059375 4.14,5.65 6.582588,9.760009 8.618213,12.226884 0.91875,1.283125 1.224362,1.355133 2.064621,1.873693 0.391926,0.241874 2.120812,0.267589 1.947816,-0.879668 -0.0609,-0.403839 -4.8925,-10.970312 -6.3925,-13.980312 0.56,-0.34 1.08,-0.7 1.55,-1.08 l 0.447573,-1.671146 c 0.22,0.44 7.589728,17.993095 7.964699,14.706622 L 70.597748,66.63433 70.97,68.41 c 0.73,0.67 1.47,1.12 2.18,1.42 l 0.281301,14.387903 c 0.04289,0.399107 0.690437,0.921359 1.33,0.478524 L 80.22,73.19 c 0.97,0.78 1.89,1.12 2.74,1.18 L 76.9,87.3 76.67,87.79 c 0.24,-0.03 0.57,-0.13 0.99,-0.27 1.19,-0.42 3.06,-1.25 5.37,-2.37 1.01,-0.69 2.13,-1.46 3.36,-2.3 1.62,-1.11 2.96,-2.03 3.54,-2.45 0.69,-0.5 1.9,-1.82 3.86,-5.25 0.84,0.23 1.65,0.31 2.42,0.26 l 0.15,0.09 -0.12,0.23 c -0.86,1.53 -1.64,2.81 -2.37,3.84 3.8,-2.03 7.81,-4.23 11.58,-6.34 l 0.24,-0.13 5.02,-2.84 1.2,2.1 C 108.16,74.5 93.67,82.71 84.27,87.23 Z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsccccccccccccccccccsscccsccccccccccccccccccccccc"/>
</a>
<path class="cls-3" d="m 128.97,64.94 c 0,0 -0.14,3.2 -1.4,3.44 0,0 -0.63,7.17 -7.55,2.31 0,0 -2.92,3.88 -8.11,1.67 -2.34372,1.389452 -4.26479,1.828862 -6.3975,1.1825 0,0 -0.5025,-0.1525 -2.3925,-1.4125 0,0 -2.86,3.13 -6.91,3.28 -0.77,0.05 -1.58,-0.03 -2.42,-0.26 -1.81,-0.48 -3.77,-1.65 -5.77,-3.92 0,0 -2.07,3.34 -5.06,3.14 -0.85,-0.06 -1.77,-0.4 -2.74,-1.18 -0.83,-0.66 -1.68,-1.65 -2.56,-3.04 0,0 -2.08,0.72 -4.51,-0.32 -0.71,-0.3 -1.45,-0.75 -2.18,-1.42 -0.68,-0.61 -1.34,-1.41 -1.96,-2.44 0,0 -1.55,4.59 -5.8,0.41 0,0 -1.06,1.42 -2.8,2.78 -0.47,0.38 -0.99,0.74 -1.55,1.08 -1.6,0.96 -3.55,1.65 -5.66,1.4 -1.28,-0.16 -2.64,-0.67 -4,-1.7 -1.08,-0.8 -2.16,-1.92 -3.24,-3.43 0,0 -0.34,2.39 -2.37,4.61 -0.51,0.55 -1.13,1.1 -1.87,1.59 -0.63,0.42 -1.36,0.81 -2.19,1.13 -1,0.39 -2.14,0.68 -3.46,0.85 -0.33,0.04 -0.66,0.1 -0.99,0.17 -0.39,0.08 -0.78,0.19 -1.16,0.3 -0.88,0.26 -2.2,0.48 -3.18,-0.07 -0.79,-0.44 -1.74,-0.26 -2.46,0.29 -0.68,0.53 -1.74,0.76 -3.36,0.05 0,0 -7.23,6.41 -7.37,-2.94 0,0 -3.5,1.17 -3.33,-1.62 0,0 -4.58,4.14 -4.76,-1.35 0,0 -7.15,3.78 -5.48,-3.59 0,0 -3.78,0.63 -1.62,-3.51 0,0 -4.84,-1.35 -0.67,-5.39 0,0 -1.03,-4.3 1.85,-4.79 0.93,-0.15 1.68,-0.85 1.75,-1.79 0.16,-2.25 1.14,-5.76 5.54,-6.18 1.02,-0.1 1.81,-0.92 1.88,-1.94 0.13,-1.81 0.51,-4.29 1.69,-4.67 0,0 -4.65,-3.98 1.08,-5.8 0,0 -2.42,-4.72 2.83,-3.91 0,0 1.05,-3.54 2.71,-4.34 0.83,-0.41 1.42,-1.2 1.53,-2.12 0.16,-1.43 0.86,-2.88 3.18,-2.17 0,0 0.94,-5.73 6.88,-5.39 0,0 0.06,-2.16 3.1,-2.43 0,0 3.1,-4.58 7.14,-1.48 0,0 -0.15,-6.39 3.81,-4.92 1.27,0.47 2.7,0.07 3.45,-1.06 1.94,-2.92 5.77,-6.87 9.87,-1.03 0,0 4.18,-2.3 5.26,-0.54 0,0 7.68,-4.52 10.92,0 0,0 4.24,1.88 3.37,4.31 0,0 5.8,0.54 5.66,2.97 0,0 15.42,-1.89 15.6,3.59 0,0 4.85,-1.61 4.85,2.16 0,0 10.7,1.62 9.53,5.93 0,0 6.02,2.25 2.34,5.76 0,0 6.2,4.76 3.41,8.8 0,0 3.87,1.53 2.16,4.32 0,0 5.93,1.53 3.77,5.21 0,0 3.42,1.86 1.26,5.29 0,0 6.13,3.61 0.86,6.4 0,0 8.14,4.94 0,7.73 z" id="path3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
</g>
</svg>`;
      }
      return `<svg class="plant7" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 132.59 173.99">
  <defs>
    <style>
      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-1, .cls-2, .cls-3 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="M107.74,134.09c4.33,1.12,8.78,1.21,13.16.86l-.02-.15c-5.42.13-11.01-.25-15.89-2.69-1.01-.54-2.1-.89-3.22-1.17,1.36-.02,2.71-.14,4.08-.27,2.88-.16,5.84.17,8.74.17v-.15c-2.91-.49-5.76-1.13-8.74-1.28-2.69-.22-5.35-.12-7.92.68-1.32-.32-2.6-.71-3.77-1.37-1.36-.92-2.79-1.95-4.33-2.6-1.86-.88-4.64-1.03-6.68-1.2h-.03c-.71-.25-1.1-.38-1.1-.38-.1-.34-.59-.53-1.3-.64h-12.1v.05c-.47.06-.96.13-1.45.2l-9.78-.25s-.65,1.21-1.39,1.95c-.55.04-1.1.07-1.67.1-3.38.59-6.03,2.7-8.98,4.23-2.94,1.41-6.39,1.05-9.58,1.26v.15c2.62.02,5.25.05,7.88-.34,3.74-.94,6.87-4.06,10.74-4.52.2-.01.41-.01.61-.02-.23.6.08,1.7.25,2.2l-3.68,1.77c-2.64,1.47-6.52,2.05-7.81,5.24-.02.05-.04.09-.05.14-1.37.95-2.88,1.7-4.44,2.21-2.32.56-7.91,2.62-10.25,2.54-1.2.02-2.35-.46-3.6-.39-2.56.16-4.45,2.29-5.9,4.19l.13.09c.78-.9,1.66-1.73,2.63-2.4.97-.68,2.04-1.15,3.16-1.09,1.08,0,2.22.55,3.53.62.72.05,1.44.02,2.14-.08-.5.2-1.01.38-1.54.55-3.39,1.69-5.97,4.63-8.55,7.29l.1.11c2.11-1.6,4.23-3.24,6.46-4.64,2.08-1.25,4.72-1.76,6.12-3.8,2.02-.42,4.08-.7,6.1-1.52,1.16-.48,2.26-1.14,3.22-1.94-.33.85-.66,1.7-.98,2.55-2.66,2.36-4.93,5.06-7.44,7.53-3.34,2.55-6.42,4.47-9.4,7.64l.1.12c2.79-2.21,5.65-4.23,8.8-5.89,2.72-1.8,5.08-4.06,6.99-6.68-.72,2.3-1.49,4.71-2.66,6.75-1.53,2.32-4.12,4.05-5.3,6.67l.14.07c1.55-2.47,4.18-3.83,5.96-6.16,1.68-2.37,2.67-5.45,3.54-7.9.86-1.97,1.68-4,2.49-5.99,1.23-2.58,4.63-3.06,6.96-4.51l3.37-1.76.21-.11-.17.17c-.68.7-1.3,1.47-1.96,2.15-.93.93-2.49,1.91-2.82,3.7-.13.86.02,1.57-.06,2.23-.69,3.43-4.07,5.98-6.45,8.37l.1.12c1.17-.9,2.29-1.85,3.37-2.86,1.57-1.54,3.48-3.19,3.87-5.51.13-.8.04-1.58.17-2.16.3-1.31,1.7-2.11,2.66-2.97.92-.74,1.71-1.73,2.49-2.39,1.65-.19,3.6-.6,4.68.01,1.08.61,1.05,1.69,2.23,2.56.19.14.39.23.61.28-.19.22-.38.44-.57.66-1.35,1.47-2.67,2.96-3.98,4.49-1.43.68-2.8,1.37-4.26,1.99-.27.09-.52.15-.73.16-.15.01-.39.02-.5.07-1.79.8-2.97,2.4-4.21,3.81l.11.11c1.28-1,2.6-2.12,4.06-2.78.16-.07.29-.1.42-.09.41.05.8,0,1.14-.06.55-.09,1.09-.22,1.62-.4-.51.61-1,1.23-1.49,1.85-5.09,6.07-8.2,14.17-15.54,17.93l.06.15c1.88-.78,3.52-1.99,5.04-3.32,2.61-2.3,4.67-5.1,6.7-7.91-.91,2.53-1.62,5.06-2.09,7.78-.27,1.22-.32,2.59-.57,3.77-.89,1.72-2.53,3.46-4.39,4.11v.16c.92-.1,1.7-.56,2.42-1.06,1.43-1.05,3.01-2.34,3.16-4.23.82-3.97,2.77-7.76,2.48-11.92,1.18-1.61,2.38-3.19,3.7-4.66,2.59-3.03,5.47-5.81,8.04-8.92.43-.56.89-1.12,1.34-1.7.47-.05.86-.04,1.07.2.2.22.38.42.58.57-.21,1.31-.53,2.58-.98,3.79-.5,1.48-1.09,2.98-1.78,4.34-.17.48-.34.95-.49,1.43-1.27,1.35-2.35,2.79-3.49,4.25-1.81,2.56-3.28,5.31-4.66,8.08l.14.08c1.61-2.19,3.19-4.45,4.92-6.52.57-.67,1.27-1.28,1.87-1.94-.24.8-.46,1.6-.68,2.4-.92,3.68-1.94,7.55-2.11,11.39-.35.24-.63.41-.93.66-1.02,1.18-2.02,2.47-3.18,3.61l.08.13c1.05-.42,2.02-.96,2.96-1.6.38-.21.77-.49,1.07-.83.09,2.25.53,4.46,1.53,6.59.54,1.25,1.18,2.44,2.02,3.51l.13-.09c-2.01-3.42-2.91-7.43-2.64-11.36.77-6.55,2.96-12.94,4.95-19.2,1.09-2.18,2.17-5.43,2.65-8.31.19-.02.39.01.59.03.18,3.67.19,7.36.57,11.08.31,4.07,1.33,8.06,1.61,12.1-.16,3.12-.68,6.39-.73,9.51l.16-.02c.1-2.57.58-5.5.85-8.1.08-.9.26-1.86.1-2.76-.1-.71-.2-1.43-.3-2.14.32.92.7,1.83,1.14,2.71.94,2.27,3.09,3.84,4.31,5.9,1.21,2.03,2.02,4.34,2.56,6.67,1.03,2.11,3.14,3.54,5.4,4.01l.03-.15c-2.1-.6-4.01-2.06-4.85-4.1-.25-2.02-1.1-4.85-2.23-6.95-1.11-2.2-3.08-3.65-3.89-6-1.57-3.87-2.49-7.95-3.51-12.02,0,0-.01-.01-.01-.02-.18-3.19-.15-6.36-.24-9.52.1.02.2.03.29.03-.03,2.24.04,4.6.22,6.72.27,6.36,5.38,10.92,8.54,15.97,1.7,2.98,6.18,3.03,8.01,5.46.92,1.43,1.12,3.37.42,5.07l.14.08c1.08-1.58,1.23-3.81.31-5.63-1.38-2.68-4.79-3-6.76-4.94-.11-.14-.21-.27-.32-.41.52.22,1.07.37,1.64.43,1.2.08,2.41-.14,3.45.34,1.5.9,2.62,2.43,3.7,3.83l.13-.08c-1.1-2.18-2.52-5.03-5.26-5.31-2.13-.25-3.68-.89-5.46-1.62-.92-1.25-1.85-2.5-2.9-3.7-2.31-2.83-4.41-5.88-4.68-9.6-.28-2.27-.4-4.57-.46-6.87.56-.62.18-2.13,1.61-2.86.02-.01.04-.02.06-.03.29-.15.53-.22.74-.24.79-.1,1.11.48,1.73.57h.01c.52.84,1.1,1.65,1.76,2.39.13.15.26.3.4.44-1.62,3.34-2.89,8.81,1.38,10.33,1.25.44,1.87,1.58,2.2,2.79,0,0,.01.02.01.03-.05.03.16.09.16-.02h-.16s-.01,0,0-.03c.01-.06.11-.05.15-.03-.01-.06-.02-.15-.02-.2-.94-5.51-5.29-1.26-3.31-9.55.11-.88.19-1.78.19-2.7.65.66,1.34,1.28,2.05,1.88h.01c1,.94,2.03,1.95,2.44,2.6.33.67,1.06,1.81.98,2.54-.13,1.08-.26,2.25-.28,3.34,0,.83-.09,1.73.45,2.47,1.04,1.31,2.63,1.29,2.91,3,.16.68.18,1.41.18,2.14l.16.02c.29-1.45.48-3.37-.87-4.38-.58-.51-1.23-.9-1.48-1.37-.38-1.23.11-2.66.23-3.93.11-.7.32-1.58.13-2.31.98.91,1.9,1.88,2.69,2.97,2.46,3.09,2.57,7.32,4.84,10.54,1.07,1.61,2.75,3.21,4.82,3.15l-.02-.15c-1.95-.06-3.47-1.67-4.41-3.25-1.46-2.4-1.85-5.24-2.81-7.84.83.73,1.83,1.29,2.9,1.68,2.35.48,3.96,2.18,6.15,3.15.17.08.42.11.61.17,1.82.94,3.11,2.75,4.51,4.26l.13-.09c-1.08-1.67-2.17-3.4-3.72-4.72-.23-.19-.61-.38-.94-.47-.71-.29-1.33-.86-2.02-1.39-.95-.76-1.88-1.65-3.08-2.13-1.72-.4-3.28-.82-4.97-1.51-.32-.69-.69-1.35-1.16-1.98-1.07-1.55-2.35-2.92-3.71-4.24.57.13,1.16.2,1.79.2,1.56-.39,3.19-.74,4.84-.85,2.48-.23,5.14.02,7.32,1.25.51.72,1.26,1.25,2.13,1.62,1.42,1.24,2.76,2.57,3.92,4,2.58,2.26,5.48,4.36,8.87,5.12l.03-.16c-3.26-.88-6.02-3.08-8.42-5.37-.85-1.13-1.66-2.12-2.49-2.99,2.81.61,6.21.34,8.38.26v-.16c-2.23-.27-4.44-.62-6.57-1.15-1.55-.53-3.01-.86-4.5-1.35h-.01c-3.38-2.42-7.16-2.9-12.94-1.82-.66.27-1.27.11-2.03-.09-.86-.22-1.95-.62-3.06-1.05-1.57-1.44-3.11-2.88-4.4-4.49.35.04.65.01.84-.13.64-.47-.07-3.85,1.62-3.78,1.69.07,3.37.14,3.64-.2.17-.21.51-.48.75-.78.45.34.9.67,1.34,1.01.2.16.39.33.51.47,1.4,2.39,4.3,3.57,6.5,5.03l.12-.11c-1.67-1.6-3.79-3.02-5.09-4.85-.17-.27-.09-.22-.33-.76-.5-.94-1.29-1.58-2.16-2.07,1.01.14,1.99.34,2.94.72,1.97.66,3.68,2.23,5.54,2.9.68.96,1.19,1.88,1.52,2.92.31.67.86,1.01,1.38,1.38,3.09,1.67,6.44,2.71,9.78,3.6l.05-.15c-3.24-1.59-6.88-2.85-9.57-5.3-.12-.1-.13-.16-.16-.19-.06-.03-.07-.1-.1-.16-.26-.61-.62-1.15-1.06-1.6,1.67.4,3.32.67,4.96.98,2.14.39,4.05,1.61,6.15,2.15ZM82.48,138.97l.18.15c-.07-.03-.15-.05-.22-.08l.04-.07Z" id="path1"/>
<path class="cls-2" d="m 84.27,87.23 c -1.13,0.78 -2.29,1.59 -3.3,2.3 0.07,0.21 -2.118963,1.752492 -2.218963,1.982492 C 76.753425,93.399827 77.16,94.14 76.62,96.12 c -0.54,1.98 -1.53,6.56 -1.08,9.89 0.45,3.32 2.85,15.32 5.17,17.9 l -23.579371,0.39187 c 0,0 6.909371,-12.63187 6.809371,-20.45187 C 63.89,99.52 63.9,94.37 63.91,90.63 63.65,90.26 63.37,89.86 63.07,89.44 60.4,87.55 56.88,84.85 53.44,82.15 45.66,78.42 36.48,75.33 35.08,74.86 c 0.33,-0.07 0.66,-0.13 0.99,-0.17 1.32,-0.17 2.46,-0.46 3.46,-0.85 1.82,0.66 4.15,1.51 6.66,2.52 -2.04,-1.65 -3.65,-2.97 -4.47,-3.65 0.74,-0.49 1.36,-1.04 1.87,-1.59 1.89,1.54 6.48,5.29 11.24,9.04 0.85,0.41 1.68,0.83 2.48,1.26 -2.83,-3.92 -5.83,-8.04 -8.27,-11.37 l 0.16,-0.11 c 1.36,1.03 2.72,1.54 4,1.7 4.14,5.65 7.21,9.88 9.48,13.05 0.45,0.33 0.01353,-0.02014 0.403529,0.309861 l 0.277094,-0.09443 c 0,0 -0.05936,-0.243554 0.760642,-0.933554 C 62.401265,79.561878 60.36,73.25 58.86,70.24 c 0.56,-0.34 1.08,-0.7 1.55,-1.08 l 1,-0.5 c 0.22,0.44 5.044988,8.125004 7.294988,13.825004 C 69.194988,82.375004 68.86,82.6 69.43,82.63 69.54,82.64 68.678139,82.53313 68.778139,82.55313 L 69.380637,67.952506 70.97,68.41 c 0.73,0.67 2.004367,1.12 2.714367,1.42 l 0.135617,11.95191 c 0.75,0.83 -0.621225,-0.138098 -0.451225,0.291902 L 80.22,73.19 c 0.97,0.78 1.89,1.12 2.74,1.18 l -3.245666,9.260678 -0.123123,0.81062 c 0,0 0.427502,-0.521869 0.740629,0.478115 1.189997,-0.42 -0.146207,0.353101 2.163793,-0.766899 C 83.505633,83.462514 85.16,83.69 86.39,82.85 c 1.62,-1.11 2.96,-2.03 3.54,-2.45 0.69,-0.5 1.9,-1.82 3.86,-5.25 0.84,0.23 1.65,0.31 2.42,0.26 l 0.15,0.09 -0.12,0.23 c -0.86,1.53 -1.64,2.81 -2.37,3.84 3.8,-2.03 7.81,-4.23 11.58,-6.34 l 0.24,-0.13 5.02,-2.84 1.2,2.1 C 108.16,74.5 93.67,82.71 84.27,87.23 Z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
<path style="fill:#5b4511;stroke-width:4.93172;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 37.329572,75.647748 C 21.672985,70.00351 22.625654,68.994093 22.493576,68.903374 c -0.870536,-0.597948 2.743746,-0.7802 2.701976,-0.424096 0,0 0.738667,0.01635 6.006534,1.9579 1.185045,0.436766 9.278939,3.839166 9.278939,3.839166 z" id="path22-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.39677;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 42.832219,73.664441 C 32.386035,64.243219 33.38185,63.529718 33.305202,63.409242 c -0.505184,-0.794075 2.301717,-0.03187 2.175028,0.296035 0,0 0.55939,0.206759 4.06284,3.417049 0.788127,0.722179 6.059426,6.053472 6.059426,6.053472 z" id="path22-5-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 51.841497,73.850185 C 41.960453,62.649682 34.215509,52.494435 34.151303,52.361331 c -0.423172,-0.877305 3.004619,-0.10444 2.813352,0.198196 0,0 9.037568,10.411462 12.343307,14.218067 0.743651,0.856324 5.636521,7.080665 5.636521,7.080665 z" id="path22-5-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path d="M 38.497956,69.820444" style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" id="path1-3"/>
<path style="fill:#5b4511;stroke-width:5.02886;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 59.94777,72.156789 C 52.654861,58.566034 47.409854,46.59679 47.383126,46.450764 c -0.176144,-0.962471 3.419891,0.774233 3.100813,1.008131 0,0 6.613144,12.590447 9.032656,17.194148 0.544288,1.035637 3.923322,8.414243 3.923322,8.414243 z" id="path22-5-8-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.404043,68.650254 c -1.089536,-14.896285 -0.01263,-25.387878 0.01679,-25.5327 0.193938,-0.95453 2.455343,1.734916 2.119942,1.860128 0,0 0.895442,13.757702 1.223986,18.788627 0.07391,1.131745 0.379442,6.226608 0.379442,6.226608 z" id="path22-5-8-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.23029;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 69.440576,44.076519 C 65.429757,30.23934 62.746456,18.157975 62.74058,18.0139 c -0.03871,-0.949611 2.394191,1.055855 2.142741,1.254398 0,0 3.612543,12.805994 4.934489,17.488636 0.297384,1.053395 1.735929,8.300348 1.735929,8.300348 z" id="path22-5-8-2-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 70.815112,55.543702 c 5.388496,-13.930201 10.83343,-25.482944 10.921985,-25.601254 0.58368,-0.77978 1.476996,2.618611 1.120272,2.588285 0,0 -5.076792,12.818045 -6.932286,17.505831 -0.417404,1.054549 -3.687511,8.264888 -3.687511,8.264888 z" id="path22-5-8-2-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 55.698511,61.016761 c -1.089536,-14.896285 -1.11088,-27.667845 -1.081458,-27.812667 0.193938,-0.95453 2.455343,1.734916 2.119942,1.860128 0,0 0.895442,13.757699 1.223986,18.788629 0.07391,1.13174 0.20311,9.04792 0.20311,9.04792 z" id="path22-5-8-2-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 79.934661,73.802095 c 5.388496,-13.9302 11.185462,-25.306829 11.274017,-25.425139 0.58368,-0.77978 1.476996,2.618611 1.120272,2.588285 0,0 -5.076792,12.818049 -6.932286,17.505829 -0.417404,1.05455 -2.777034,6.673072 -2.777034,6.673072 z" id="path22-5-8-2-1-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 93.737095,75.49721 c 2.658012,-14.697666 5.820873,-27.071409 5.885463,-27.204327 0.425752,-0.876058 1.945382,2.292193 1.589362,2.329843 0,0 -2.562167,13.546644 -3.498045,18.500662 -0.210525,1.11444 -1.346158,6.443922 -1.346158,6.443922 z" id="path22-5-8-2-1-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.67711;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 110.11736,71.352319 c 4.88183,-9.677864 9.81478,-17.704013 9.89502,-17.786208 0.5288,-0.541744 1.33811,1.819253 1.01493,1.798184 0,0 -4.59943,8.905205 -6.28046,12.161996 -0.37815,0.732637 -2.80549,4.835095 -2.80549,4.835095 z" id="path22-5-8-2-1-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.11991;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 25.89355,68.743013 c -4.887391,-6.959157 -10.146593,-12.5881 -10.226911,-12.647205 -0.529402,-0.389557 -1.339643,1.308188 -1.016093,1.293038 0,0 4.604675,6.403553 6.287616,8.745445 0.378587,0.526825 1.456491,2.668314 1.456491,2.668314 z" id="path22-5-8-2-1-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 38.752532,56.963752 c 0.768445,-7.134691 1.890006,-13.197438 1.917761,-13.264423 0.182947,-0.441493 1.090874,0.969438 0.909746,1.008917 0,0 -0.765886,6.582765 -1.045399,8.990023 -0.06288,0.541529 -0.699264,4.306292 -0.699264,4.306292 z" id="path22-5-8-2-1-11" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 84.83657,62.318011 c 0.768445,-7.134693 1.890006,-13.19744 1.917761,-13.264425 0.182947,-0.441493 1.090874,0.969438 0.909746,1.008917 0,0 -0.765886,6.582768 -1.045399,8.990028 -0.06288,0.54152 -0.699264,4.30629 -0.699264,4.30629 z" id="path22-5-8-2-1-11-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 67.390597,34.083299 c 0.76845,-7.134691 1.89001,-13.197438 1.91776,-13.264423 0.18295,-0.441493 1.09087,0.969438 0.90975,1.008917 0,0 -0.76589,6.582765 -1.0454,8.990023 -0.0629,0.541529 -0.69927,4.306292 -0.69927,4.306292 z" id="path22-5-8-2-1-11-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.19796;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 57.415678,41.857458 C 53.390089,35.623408 49.141641,30.652238 49.067564,30.608009 48.5793,30.31652 47.5032,32.287313 47.837907,32.198656 c 0,0 3.814661,5.712188 5.208651,7.801476 0.31359,0.469999 2.84563,3.598753 2.84563,3.598753 z" id="path22-5-8-2-1-11-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 22.820871,68.098958 C 21.14794,61.120733 20.167698,55.033539 20.171338,54.961123 c 0.02401,-0.477294 1.35314,0.546651 1.1958,0.644681 0,0 1.489936,6.457513 2.035324,8.818777 0.122687,0.531183 0.787962,4.290949 0.787962,4.290949 z" id="path22-5-8-2-1-11-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 95.80879,65.252295 c 4.27684,-5.762201 8.31511,-10.421302 8.37297,-10.464999 0.38139,-0.287973 0.44944,1.388455 0.27328,1.330742 0,0 -3.99504,5.287631 -5.455503,7.221559 -0.328559,0.435038 -2.784382,3.358621 -2.784382,3.358621 z" id="path22-5-8-2-1-11-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 114.27745,65.27778 c 0.76845,-7.134691 1.89001,-13.197438 1.91776,-13.264423 0.18295,-0.441493 1.09087,0.969438 0.90975,1.008917 0,0 -0.76589,6.582765 -1.0454,8.990023 -0.0629,0.541529 -0.69927,4.306292 -0.69927,4.306292 z" id="path22-5-8-2-1-11-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 79.741936,36.541512 c 3.248363,-0.495528 6.195779,-0.469007 6.234479,-0.454038 0.255071,0.09867 0.0359,1.209119 -0.0527,1.042903 0,0 -3.01979,0.402854 -4.123875,0.550713 -0.248372,0.03326 -2.054634,0.07417 -2.054634,0.07417 z" id="path22-5-8-2-1-11-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 56.448292,43.583025 c 0.7956,-3.188171 1.9568,-5.897338 1.98553,-5.927271 0.18942,-0.197283 1.12943,0.433198 0.9419,0.45084 0,0 -0.79295,2.941539 -1.08234,4.017234 -0.0651,0.241985 -0.72398,1.924287 -0.72398,1.924287 z" id="path22-5-8-2-1-11-6-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 105.5571,73.982478 c 0.7956,-3.188171 1.95679,-5.897338 1.98553,-5.927271 0.18942,-0.197283 1.12943,0.433198 0.9419,0.45084 0,0 -0.79295,2.941539 -1.08235,4.017234 -0.0651,0.241985 -0.72397,1.924287 -0.72397,1.924287 z" id="path22-5-8-2-1-11-6-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 80.085527,74.725302 c 3.231096,-0.597859 6.17788,-0.664423 6.217031,-0.650689 0.258063,0.09058 0.07407,1.207389 -0.01974,1.044051 0,0 -3.005563,0.498015 -4.104428,0.680666 -0.247197,0.04109 -2.051268,0.139012 -2.051268,0.139012 z" id="path22-5-8-2-1-11-6-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 60.322897,69.510919 c 0.795601,-3.188171 1.956797,-5.897338 1.985533,-5.927271 0.189412,-0.197283 1.129427,0.433198 0.941896,0.45084 0,0 -0.792952,2.941539 -1.082343,4.017234 -0.0651,0.241985 -0.723975,1.924287 -0.723975,1.924287 z" id="path22-5-8-2-1-11-6-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.230866,59.754954 c -1.67586,-2.826466 -2.754961,-5.569366 -2.755574,-5.610855 -0.004,-0.273461 1.107705,-0.486056 0.98676,-0.34166 0,0 1.504336,2.649226 2.054875,3.617613 0.123849,0.217845 0.838155,1.877369 0.838155,1.877369 z" id="path22-5-8-2-1-11-6-78" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 46.727738,66.480468 c 0.795601,-3.188171 1.956797,-5.897338 1.985533,-5.927271 0.189412,-0.197283 1.129424,0.433198 0.941896,0.45084 0,0 -0.792952,2.941539 -1.082343,4.017234 -0.0651,0.241985 -0.723975,1.924287 -0.723975,1.924287 z" id="path22-5-8-2-1-11-6-20" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 40.028623,70.652536 c -0.37436,-3.264548 -0.238227,-6.208937 -0.221829,-6.247053 0.108092,-0.251225 1.209618,0.0091 1.040221,0.09146 0,0 0.290252,3.032685 0.396942,4.141506 0.024,0.249437 -0.0023,2.055971 -0.0023,2.055971 z" id="path22-5-8-2-1-11-6-28" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 56.298263,55.204805 c 1.230099,-4.387114 3.025454,-8.11509 3.069884,-8.156279 0.292854,-0.271473 1.746231,0.596106 1.456289,0.620383 0,0 -1.226003,4.047733 -1.673438,5.527954 -0.100653,0.332986 -1.119356,2.647934 -1.119356,2.647934 z" id="path22-5-8-2-1-11-6-26" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 71.663244,69.583215 c 1.2301,-4.387114 3.02545,-8.11509 3.06988,-8.156279 0.29286,-0.271473 1.74623,0.596106 1.45629,0.620383 0,0 -1.226,4.047733 -1.67344,5.527954 -0.10065,0.332986 -1.11935,2.647934 -1.11935,2.647934 z" id="path22-5-8-2-1-11-6-26-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 29.625431,72.209294 c -2.040647,-4.073779 -3.219661,-8.040016 -3.214488,-8.100379 0.03411,-0.397867 1.693135,-0.733458 1.494912,-0.52047 0,0 1.815401,3.819888 2.479947,5.21618 0.149494,0.314105 0.952771,2.71233 0.952771,2.71233 z" id="path22-5-8-2-1-11-6-26-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.098965,40.649505 c 1.230099,-4.387114 3.025454,-8.11509 3.069884,-8.156279 0.292854,-0.271473 1.746231,0.596106 1.456289,0.620383 0,0 -1.226003,4.047733 -1.673438,5.527954 -0.100653,0.332986 -1.119356,2.647934 -1.119356,2.647934 z" id="path22-5-8-2-1-11-6-26-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 73.586044,50.842571 c 4.272878,-1.581905 8.344435,-2.319151 8.403868,-2.307395 0.391732,0.0775 0.543486,1.763317 0.353505,1.542948 0,0 -3.995832,1.385839 -5.456543,1.89336 -0.328596,0.11417 -2.800409,0.649786 -2.800409,0.649786 z" id="path22-5-8-2-1-11-6-26-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 38.679408,75.108765 c -3.890676,2.371192 -7.745576,3.874803 -7.806161,3.874651 -0.399325,-0.001 -0.871232,-1.626536 -0.642552,-1.446645 0,0 3.656323,-2.125683 4.992748,-2.903643 0.300637,-0.175008 2.624053,-1.174247 2.624053,-1.174247 z" id="path22-5-8-2-1-11-6-26-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 103.33766,75.137527 c 4.48941,0.777878 8.38054,2.18507 8.42603,2.225077 0.29983,0.263759 -0.41555,1.79777 -0.46917,1.511805 0,0 -4.15137,-0.80829 -5.6694,-1.10298 -0.3415,-0.06629 -2.74799,-0.844452 -2.74799,-0.844452 z" id="path22-5-8-2-1-11-6-26-21" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 45.936735,81.608781 c 3.401129,-0.999107 6.502315,-1.455618 6.5435,-1.44779 0.271449,0.05159 0.07626,1.136972 -0.02223,0.994347 0,0 -3.163648,0.874165 -4.320314,1.194308 -0.260199,0.07202 -2.158876,0.405812 -2.158876,0.405812 z" id="path22-5-8-2-1-11-6-26-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 94.107664,85.188192 c -3.468342,-0.732445 -6.415386,-1.800479 -6.44794,-1.826894 -0.21456,-0.174099 0.471794,-1.037272 0.490909,-0.865003 0,0 3.200018,0.729891 4.370235,0.996273 0.263243,0.05992 2.093282,0.666009 2.093282,0.666009 z" id="path22-5-8-2-1-11-6-26-5-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.908188,50.531635 c -2.134476,-2.830178 -3.655434,-5.571061 -3.662635,-5.61236 -0.04746,-0.272203 1.037011,-0.472366 0.938288,-0.329902 0,0 1.933803,2.652025 2.641328,3.621446 0.159165,0.218076 1.141167,1.87701 1.141167,1.87701 z" id="path22-5-8-2-1-11-6-26-5-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:transform-center-x="-0.42749388" inkscape:transform-center-y="0.14249796"/>
</g>
</svg>`;
    case 8:
      style.setProperty("--fruit-color", data.uniqueColor);
      if (isAlive) {
        return `<svg class="plant8" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 132.59 174.07">
  <defs>
    <style>
      .cls-1 {
        fill: var(--fruit-color) !important;
      }

      .cls-1, .cls-2, .cls-3, .cls-4 {
        stroke-width: 0px;
      }

      .cls-2 {
        fill: #9d8a71 !important;
      }

      .cls-3 {
        fill: #604725!important;
      }

      .cls-4 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-2" d="m 107.91806,133.77755 c 4.33,1.12 8.78,1.21 13.16,0.86 l -0.02,-0.15 c -5.42,0.13 -11.01,-0.25 -15.89,-2.69 -1.01,-0.54 -2.1,-0.89 -3.22,-1.17 1.36,-0.02 2.71,-0.14 4.08,-0.27 2.88,-0.16 5.84,0.17 8.74,0.17 v -0.15 c -2.91,-0.49 -5.76,-1.13 -8.74,-1.28 -2.69,-0.22 -5.35,-0.12 -7.920003,0.68 -1.32,-0.32 -2.6,-0.71 -3.77,-1.37 -1.36,-0.92 -2.79,-1.95 -4.33,-2.6 -1.86,-0.88 -4.530625,-0.88156 -6.566719,-1.2 l -0.682343,-0.1875 c -0.327188,-0.10547 -0.560938,-0.1925 -0.560938,-0.1925 -0.771875,-0.17594 -1.062656,-0.38156 -1.3,-0.64 h -12.1 v 0.05 c -0.260231,-1.25106 -4.158977,-0.63041 -4.648977,-0.56041 l -6.581023,0.51041 c 0,0 -0.65,1.21 -1.39,1.95 -0.55,0.04 -1.1,0.07 -1.67,0.1 -3.38,0.59 -6.03,2.7 -8.98,4.23 -2.94,1.41 -6.39,1.05 -9.58,1.26 v 0.15 c 2.62,0.02 5.25,0.05 7.88,-0.34 3.74,-0.94 6.87,-4.06 10.74,-4.52 0.2,-0.01 0.41,-0.01 0.61,-0.02 -0.23,0.6 0.08,1.7 0.25,2.2 l -3.68,1.77 c -2.64,1.47 -6.52,2.05 -7.81,5.24 -0.02,0.05 -0.04,0.09 -0.05,0.14 -1.37,0.95 -2.88,1.7 -4.44,2.21 -2.32,0.56 -7.91,2.62 -10.25,2.54 -1.2,0.02 -2.35,-0.46 -3.6,-0.39 -2.56,0.16 -4.45,2.29 -5.9,4.19 l 0.13,0.09 c 0.78,-0.9 1.66,-1.73 2.63,-2.4 0.97,-0.68 2.04,-1.15 3.16,-1.09 1.08,0 2.22,0.55 3.53,0.62 0.72,0.05 1.44,0.02 2.14,-0.08 -0.5,0.2 -1.01,0.38 -1.54,0.55 -3.39,1.69 -5.97,4.63 -8.55,7.29 l 0.1,0.11 c 2.11,-1.6 4.23,-3.24 6.46,-4.64 2.08,-1.25 4.72,-1.76 6.12,-3.8 2.02,-0.42 4.08,-0.7 6.1,-1.52 1.16,-0.48 2.26,-1.14 3.22,-1.94 -0.33,0.85 -0.66,1.7 -0.98,2.55 -2.66,2.36 -4.93,5.06 -7.44,7.53 -3.34,2.55 -6.42,4.47 -9.4,7.64 l 0.1,0.12 c 2.79,-2.21 5.65,-4.23 8.8,-5.89 2.72,-1.8 5.08,-4.06 6.99,-6.68 -0.72,2.3 -1.49,4.71 -2.66,6.75 -1.53,2.32 -4.12,4.05 -5.3,6.67 l 0.14,0.07 c 1.55,-2.47 4.18,-3.83 5.96,-6.16 1.68,-2.37 2.67,-5.45 3.54,-7.9 0.86,-1.97 1.68,-4 2.49,-5.99 1.23,-2.58 4.63,-3.06 6.96,-4.51 l 3.37,-1.76 0.21,-0.11 -0.17,0.17 c -0.68,0.7 -1.3,1.47 -1.96,2.15 -0.93,0.93 -2.49,1.91 -2.82,3.7 -0.13,0.86 0.02,1.57 -0.06,2.23 -0.69,3.43 -4.07,5.98 -6.45,8.37 l 0.1,0.12 c 1.17,-0.9 2.29,-1.85 3.37,-2.86 1.57,-1.54 3.48,-3.19 3.87,-5.51 0.13,-0.8 0.04,-1.58 0.17,-2.16 0.3,-1.31 1.7,-2.11 2.66,-2.97 0.92,-0.74 1.71,-1.73 2.49,-2.39 1.65,-0.19 3.6,-0.6 4.68,0.01 1.08,0.61 1.05,1.69 2.23,2.56 0.19,0.14 0.39,0.23 0.61,0.28 l -0.57,0.66 c -1.35,1.47 -2.67,2.96 -3.98,4.49 -1.43,0.68 -2.8,1.37 -4.26,1.99 -0.27,0.09 -0.52,0.15 -0.73,0.16 -0.15,0.01 -0.39,0.02 -0.5,0.07 -1.79,0.8 -2.97,2.4 -4.21,3.81 l 0.11,0.11 c 1.28,-1 2.6,-2.12 4.06,-2.78 0.16,-0.07 0.29,-0.1 0.42,-0.09 0.41,0.05 0.8,0 1.14,-0.06 0.55,-0.09 1.09,-0.22 1.62,-0.4 -0.51,0.61 -1,1.23 -1.49,1.85 -5.09,6.07 -8.2,14.17 -15.54,17.93 l 0.06,0.15 c 1.88,-0.78 3.52,-1.99 5.04,-3.32 2.61,-2.3 4.67,-5.1 6.7,-7.91 -0.91,2.53 -1.62,5.06 -2.09,7.78 -0.27,1.22 -0.32,2.59 -0.57,3.77 -0.89,1.72 -2.53,3.46 -4.39,4.11 v 0.16 c 0.92,-0.1 1.7,-0.56 2.42,-1.06 1.43,-1.05 3.01,-2.34 3.16,-4.23 0.82,-3.97 2.77,-7.76 2.48,-11.92 1.18,-1.61 2.38,-3.19 3.7,-4.66 2.59,-3.03 5.47,-5.81 8.04,-8.92 0.43,-0.56 0.89,-1.12 1.34,-1.7 0.47,-0.05 0.86,-0.04 1.07,0.2 0.2,0.22 0.38,0.42 0.58,0.57 -0.21,1.31 -0.53,2.58 -0.98,3.79 -0.5,1.48 -1.09,2.98 -1.78,4.34 -0.17,0.48 -0.34,0.95 -0.49,1.43 -1.27,1.35 -2.35,2.79 -3.49,4.25 -1.81,2.56 -3.28,5.31 -4.66,8.08 l 0.14,0.08 c 1.61,-2.19 3.19,-4.45 4.92,-6.52 0.57,-0.67 1.27,-1.28 1.87,-1.94 -0.24,0.8 -0.46,1.6 -0.68,2.4 -0.92,3.68 -1.94,7.55 -2.11,11.39 -0.35,0.24 -0.63,0.41 -0.93,0.66 -1.02,1.18 -2.02,2.47 -3.18,3.61 l 0.08,0.13 c 1.05,-0.42 2.02,-0.96 2.96,-1.6 0.38,-0.21 0.77,-0.49 1.07,-0.83 0.09,2.25 0.53,4.46 1.53,6.59 0.54,1.25 1.18,2.44 2.02,3.51 l 0.13,-0.09 c -2.01,-3.42 -2.91,-7.43 -2.64,-11.36 0.77,-6.55 2.96,-12.94 4.95,-19.2 1.09,-2.18 2.17,-5.43 2.65,-8.31 0.19,-0.02 0.39,0.01 0.59,0.03 0.18,3.67 0.19,7.36 0.57,11.08 0.31,4.07 1.33,8.06 1.61,12.1 -0.16,3.12 -0.68,6.39 -0.73,9.51 l 0.16,-0.02 c 0.1,-2.57 0.58,-5.5 0.85,-8.1 0.08,-0.9 0.26,-1.86 0.1,-2.76 -0.1,-0.71 -0.2,-1.43 -0.3,-2.14 0.32,0.92 0.7,1.83 1.14,2.71 0.94,2.27 3.09,3.84 4.31,5.9 1.21,2.03 2.02,4.34 2.56,6.67 1.03,2.11 3.14,3.54 5.4,4.01 l 0.03,-0.15 c -2.1,-0.6 -4.01,-2.06 -4.85,-4.1 -0.25,-2.02 -1.1,-4.85 -2.23,-6.95 -1.11,-2.2 -3.08,-3.65 -3.89,-6 -1.57,-3.87 -2.49,-7.95 -3.51,-12.02 0,0 -0.01,-0.01 -0.01,-0.02 -0.18,-3.19 -0.15,-6.36 -0.24,-9.52 0.1,0.02 0.2,0.03 0.29,0.03 -0.03,2.24 0.04,4.6 0.22,6.72 0.27,6.36 5.38,10.92 8.54,15.97 1.7,2.98 6.18,3.03 8.01,5.46 0.92,1.43 1.12,3.37 0.42,5.07 l 0.14,0.08 c 1.08,-1.58 1.23,-3.81 0.31,-5.63 -1.38,-2.68 -4.79,-3 -6.76,-4.94 -0.11,-0.14 -0.21,-0.27 -0.32,-0.41 0.52,0.22 1.07,0.37 1.64,0.43 1.2,0.08 2.41,-0.14 3.45,0.34 1.5,0.9 2.62,2.43 3.7,3.83 l 0.13,-0.08 c -1.1,-2.18 -2.52,-5.03 -5.26,-5.31 -2.13,-0.25 -3.68,-0.89 -5.46,-1.62 -0.92,-1.25 -1.85,-2.5 -2.9,-3.7 -2.31,-2.83 -4.41,-5.88 -4.68,-9.6 -0.28,-2.27 -0.4,-4.57 -0.46,-6.87 0.56,-0.62 0.18,-2.13 1.61,-2.86 l 0.06,-0.03 c 0.29,-0.15 0.53,-0.22 0.74,-0.24 0.79,-0.1 1.11,0.48 1.73,0.57 h 0.01 c 0.52,0.84 1.1,1.65 1.76,2.39 0.13,0.15 0.26,0.3 0.4,0.44 -1.62,3.34 -2.89,8.81 1.38,10.33 1.25,0.44 1.87,1.58 2.2,2.79 0,0 0.01,0.02 0.01,0.03 -0.05,0.03 0.16,0.09 0.16,-0.02 h -0.16 c 0,0 -0.01,0 0,-0.03 0.01,-0.06 0.11,-0.05 0.15,-0.03 -0.01,-0.06 -0.02,-0.15 -0.02,-0.2 -0.94,-5.51 -5.29,-1.26 -3.31,-9.55 0.11,-0.88 0.19,-1.78 0.19,-2.7 0.65,0.66 1.34,1.28 2.05,1.88 h 0.01 c 1,0.94 2.03,1.95 2.44,2.6 0.33,0.67 1.06,1.81 0.98,2.54 -0.13,1.08 -0.26,2.25 -0.28,3.34 0,0.83 -0.09,1.73 0.45,2.47 1.04,1.31 2.63,1.29 2.91,3 0.16,0.68 0.18,1.41 0.18,2.14 l 0.16,0.02 c 0.29,-1.45 0.48,-3.37 -0.87,-4.38 -0.58,-0.51 -1.23,-0.9 -1.48,-1.37 -0.38,-1.23 0.11,-2.66 0.23,-3.93 0.11,-0.7 0.32,-1.58 0.13,-2.31 0.98,0.91 1.9,1.88 2.69,2.97 2.46,3.09 2.57,7.32 4.84,10.54 1.07,1.61 2.75,3.21 4.82,3.15 l -0.02,-0.15 c -1.95,-0.06 -3.47,-1.67 -4.41,-3.25 -1.46,-2.4 -1.85,-5.24 -2.81,-7.84 0.83,0.73 1.83,1.29 2.9,1.68 2.35,0.48 3.96,2.18 6.150003,3.15 0.17,0.08 0.42,0.11 0.61,0.17 1.82,0.94 3.11,2.75 4.51,4.26 l 0.13,-0.09 c -1.08,-1.67 -2.17,-3.4 -3.72,-4.72 -0.23,-0.19 -0.61,-0.38 -0.94,-0.47 -0.71,-0.29 -1.330003,-0.86 -2.020003,-1.39 -0.95,-0.76 -1.88,-1.65 -3.08,-2.13 -1.72,-0.4 -3.28,-0.82 -4.97,-1.51 -0.32,-0.69 -0.69,-1.35 -1.16,-1.98 -1.07,-1.55 -2.35,-2.92 -3.71,-4.24 0.57,0.13 1.16,0.2 1.79,0.2 1.56,-0.39 3.19,-0.74 4.84,-0.85 2.48,-0.23 5.14,0.02 7.32,1.25 0.510003,0.72 1.260003,1.25 2.130003,1.62 1.42,1.24 2.76,2.57 3.92,4 2.58,2.26 5.48,4.36 8.87,5.12 l 0.03,-0.16 c -3.26,-0.88 -6.02,-3.08 -8.42,-5.37 -0.85,-1.13 -1.66,-2.12 -2.49,-2.99 2.81,0.61 6.21,0.34 8.38,0.26 v -0.16 c -2.23,-0.27 -4.44,-0.62 -6.57,-1.15 -1.55,-0.53 -3.01,-0.86 -4.5,-1.35 h -0.01 c -3.380003,-2.42 -7.160003,-2.9 -12.940003,-1.82 -0.66,0.27 -1.27,0.11 -2.03,-0.09 -0.86,-0.22 -1.95,-0.62 -3.06,-1.05 -1.57,-1.44 -3.11,-2.88 -4.4,-4.49 0.35,0.04 0.65,0.01 0.84,-0.13 0.64,-0.47 -0.07,-3.85 1.62,-3.78 1.69,0.07 3.37,0.14 3.64,-0.2 0.17,-0.21 0.51,-0.48 0.75,-0.78 0.45,0.34 0.9,0.67 1.34,1.01 0.2,0.16 0.39,0.33 0.51,0.47 1.4,2.39 4.3,3.57 6.5,5.03 l 0.12,-0.11 c -1.67,-1.6 -3.79,-3.02 -5.09,-4.85 -0.17,-0.27 -0.09,-0.22 -0.33,-0.76 -0.5,-0.94 -1.29,-1.58 -2.16,-2.07 1.01,0.14 1.99,0.34 2.94,0.72 1.97,0.66 3.68,2.23 5.54,2.9 0.68,0.96 1.19,1.88 1.52,2.92 0.31,0.67 0.86,1.01 1.38,1.38 3.090003,1.67 6.440003,2.71 9.780003,3.6 l 0.05,-0.15 c -3.24,-1.59 -6.88,-2.85 -9.570003,-5.3 -0.12,-0.1 -0.13,-0.16 -0.16,-0.19 -0.06,-0.03 -0.07,-0.1 -0.1,-0.16 -0.26,-0.61 -0.62,-1.15 -1.06,-1.6 1.67,0.4 3.320003,0.67 4.960003,0.98 2.14,0.39 4.05,1.61 6.15,2.15 z m -25.260003,4.88 0.18,0.15 c -0.07,-0.03 -0.15,-0.05 -0.22,-0.08 z" id="path1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccscccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccsccccccccccccccccccccccccc" style="fill:#9d8a71;stroke-width:0px"/>
<path class="cls-3" d="m 84.377178,87.06619 c -1.13,0.78 -2.29,1.59 -3.3,2.3 0.07,0.21 -1.643125,0.7425 -2.54,2.175625 -0.99,2.239995 -1.27,2.434375 -1.81,4.414375 -0.54,1.98 -1.53,6.56 -1.08,9.89 0.45,3.32 2.85,15.32 5.17,17.9 h -23.33 c 0,0 6.66,-12.24 6.56,-20.06 -0.05,-4.33 -0.04,-9.48 -0.03,-13.22 C 63.914952,88.211673 56.884881,84.372257 53.127333,82.273452 45.225799,78.035219 36.587178,75.16619 35.187178,74.69619 c 0.33,-0.07 0.66,-0.13 0.99,-0.17 1.32,-0.17 2.46,-0.46 3.46,-0.85 1.82,0.66 4.15,1.51 6.66,2.52 -2.04,-1.65 -3.65,-2.97 -4.47,-3.65 0.74,-0.49 1.36,-1.04 1.87,-1.59 1.89,1.54 6.48,5.29 11.24,9.04 0.85,0.41 1.68,0.83 2.48,1.26 -2.83,-3.92 -6.294039,-8.857592 -8.734039,-12.187592 l 0.624039,0.707592 c 1.36,1.03 2.141875,0.899375 3.421875,1.059375 4.14,5.65 6.582588,9.760009 8.618213,12.226884 0.91875,1.283125 1.224362,1.355133 2.064621,1.873693 0.391926,0.241874 2.120812,0.267589 1.947816,-0.879668 -0.0609,-0.403839 -4.8925,-10.970312 -6.3925,-13.980312 0.56,-0.34 1.08,-0.7 1.55,-1.08 l 0.447573,-1.671146 c 0.22,0.44 7.589728,17.993095 7.964699,14.706622 l 1.775451,-15.561118 0.372252,1.77567 c 0.73,0.67 1.47,1.12 2.18,1.42 l 0.281301,14.387903 c 0.04289,0.399107 0.690437,0.921359 1.33,0.478524 L 80.327178,73.02619 c 0.97,0.78 1.89,1.12 2.74,1.18 l -6.06,12.93 -0.23,0.49 c 0.24,-0.03 0.57,-0.13 0.99,-0.27 1.19,-0.42 3.06,-1.25 5.37,-2.37 1.01,-0.69 2.13,-1.46 3.36,-2.3 1.62,-1.11 2.96,-2.03 3.54,-2.45 0.69,-0.5 1.9,-1.82 3.86,-5.25 0.84,0.23 1.65,0.31 2.42,0.26 l 0.15,0.09 -0.12,0.23 c -0.86,1.53 -1.64,2.81 -2.37,3.84 3.8,-2.03 7.810002,-4.23 11.580002,-6.34 l 0.24,-0.13 5.02,-2.84 c 19.56558,-9.182253 0.8,1.4 1.2,2.1 -3.75,2.14 -18.240002,10.35 -27.640002,14.87 z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsccccccccccccccccccsscccsccccccccccccccccccccccc" style="fill:#5b4511;stroke-width:0px"/>
<path class="cls-4" d="m 128.97,64.94 c 0,0 -0.14,3.2 -1.4,3.44 0,0 -0.63,7.17 -7.55,2.31 0,0 -2.92,3.88 -8.11,1.67 -3.23784,0.341749 -5.94802,1.526248 -8.79,-0.23 0,0 -2.86,3.13 -6.91,3.28 -0.77,0.05 -1.58,-0.03 -2.42,-0.26 -1.81,-0.48 -3.77,-1.65 -5.77,-3.92 0,0 -2.07,3.34 -5.06,3.14 -0.85,-0.06 -1.77,-0.4 -2.74,-1.18 -0.83,-0.66 -1.68,-1.65 -2.56,-3.04 0,0 -2.08,0.72 -4.51,-0.32 -0.71,-0.3 -1.45,-0.75 -2.18,-1.42 -0.68,-0.61 -1.34,-1.41 -1.96,-2.44 0,0 -1.55,4.59 -5.8,0.41 0,0 -1.06,1.42 -2.8,2.78 -0.47,0.38 -0.99,0.74 -1.55,1.08 -1.6,0.96 -3.55,1.65 -5.66,1.4 -1.28,-0.16 -2.64,-0.67 -4,-1.7 -1.08,-0.8 -2.16,-1.92 -3.24,-3.43 0,0 -0.34,2.39 -2.37,4.61 -0.51,0.55 -1.13,1.1 -1.87,1.59 -0.63,0.42 -1.36,0.81 -2.19,1.13 -1,0.39 -2.14,0.68 -3.46,0.85 -0.33,0.04 -0.66,0.1 -0.99,0.17 -0.39,0.08 -0.78,0.19 -1.16,0.3 -0.88,0.26 -2.2,0.48 -3.18,-0.07 -0.79,-0.44 -1.74,-0.26 -2.46,0.29 -0.68,0.53 -1.74,0.76 -3.36,0.05 0,0 -7.23,6.41 -7.37,-2.94 0,0 -3.5,1.17 -3.33,-1.62 0,0 -4.58,4.14 -4.76,-1.35 0,0 -7.15,3.78 -5.48,-3.59 0,0 -3.78,0.63 -1.62,-3.51 0,0 -4.84,-1.35 -0.67,-5.39 0,0 -1.03,-4.3 1.85,-4.79 0.93,-0.15 1.68,-0.85 1.75,-1.79 0.16,-2.25 1.14,-5.76 5.54,-6.18 1.02,-0.1 1.81,-0.92 1.88,-1.94 0.13,-1.81 0.51,-4.29 1.69,-4.67 0,0 -4.65,-3.98 1.08,-5.8 0,0 -2.42,-4.72 2.83,-3.91 0,0 1.05,-3.54 2.71,-4.34 0.83,-0.41 1.42,-1.2 1.53,-2.12 0.16,-1.43 0.86,-2.88 3.18,-2.17 0,0 0.94,-5.73 6.88,-5.39 0,0 0.06,-2.16 3.1,-2.43 0,0 3.1,-4.58 7.14,-1.48 0,0 -0.15,-6.39 3.81,-4.92 1.27,0.47 2.7,0.07 3.45,-1.06 1.94,-2.92 5.77,-6.87 9.87,-1.03 0,0 4.18,-2.3 5.26,-0.54 0,0 7.68,-4.52 10.92,0 0,0 4.24,1.88 3.37,4.31 0,0 5.8,0.54 5.66,2.97 0,0 15.42,-1.89 15.6,3.59 0,0 4.85,-1.61 4.85,2.16 0,0 10.7,1.62 9.53,5.93 0,0 6.02,2.25 2.34,5.76 0,0 6.2,4.76 3.41,8.8 0,0 3.87,1.53 2.16,4.32 0,0 5.93,1.53 3.77,5.21 0,0 3.42,1.86 1.26,5.29 0,0 6.13,3.61 0.86,6.4 0,0 8.14,4.94 0,7.73 z" id="path3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="ccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
<g id="g23">
  <path class="cls-1" d="M33.29,65.43c0,2.55-2.28,4.63-5.08,4.63s-4.96-1.98-5.07-4.44c2.43-.41,5.06-1.15,4.53-2.4,0,0,2.48.66,3.5,0,0,0,.56-.15,1.24-.4.55.74.88,1.64.88,2.61Z" id="path4"/>
  <g id="g22">
    <path class="cls-1" d="M62.32,57.61c0,2.55-2.27,4.63-5.08,4.63s-5.08-2.08-5.08-4.63c0-1.24.53-2.36,1.4-3.19,1.22.21,2.83.36,3.15-.32.24-.5,1.33-.67,2.36-.81h.01c1.9.67,3.24,2.35,3.24,4.32Z" id="path5"/>
    <path class="cls-1" d="M48.12,55c0,2.56-2.28,4.63-5.08,4.63s-5.08-2.07-5.08-4.63c0-1.03.37-1.99,1-2.75.36.06.77.05,1.23-.04,1.97-.4,2.85-1.84,2.85-1.84,0,0,2.63.8,2.97.96.03.01.08.02.14.02,1.2.84,1.97,2.16,1.97,3.65Z" id="path6"/>
    <path class="cls-1" d="M90.9,64.26c0,2.55-2.27,4.63-5.07,4.63s-5.08-2.08-5.08-4.63c0-.21.01-.41.05-.61,2.27.21,5.88.17,5.79-2.22,0,0,2.11.81,4,1.26.2.49.31,1.02.31,1.57Z" id="path7"/>
    <path class="cls-1" d="M111.22,61.43c0,2.55-2.27,4.63-5.08,4.63s-4.89-1.91-5.06-4.32c1.67-.5,3.47-1.44,2.9-3.15,0,0,2.5,1.87,4.45,0,0,0,1.08.44,2.25.77.35.62.54,1.32.54,2.07Z" id="path8"/>
    <path class="cls-1" d="M129.2,54.55c0,2.56-2.28,4.63-5.08,4.63-2.29,0-4.22-1.37-4.85-3.26,1.65-.92,3.8-2.72,4.59-5.99.09-.01.17-.01.26-.01,2.8,0,5.08,2.07,5.08,4.63Z" id="path9"/>
    <path class="cls-1" d="M114.99,48.35c0,2.51-2.2,4.56-4.94,4.63-1.34-2.97-3.33-4.11-5.2-4.43-.01-.06-.01-.13-.01-.2,0-2.56,2.27-4.63,5.08-4.63s5.07,2.07,5.07,4.63Z" id="path10"/>
    <path class="cls-1" d="M110.66,34.22c-.49,2.09-2.53,3.66-4.97,3.66-2.73,0-4.96-1.97-5.07-4.43.78.74,1.54,1.25,1.88.79,0,0,4.38.91,4.58-1.58,0,0,1.85.91,3.58,1.56Z" id="path11"/>
    <path class="cls-1" d="M94.77,36.75c0,2.56-2.27,4.63-5.08,4.63s-5.08-2.07-5.08-4.63c0-.8.23-1.56.62-2.21,1.35.89,3.52,2.02,4.46.92,0,0,2.88.23,4.87-.01.14.41.21.85.21,1.3Z" id="path12"/>
    <path class="cls-1" d="M84.07,48.35c0,2.55-2.27,4.63-5.08,4.63s-5.07-2.08-5.07-4.63c0-.86.26-1.66.7-2.35.88-.31,1.82-.93,2.73-2.03.51-.16,1.07-.25,1.64-.25,2.81,0,5.08,2.07,5.08,4.63Z" id="path13"/>
    <path class="cls-1" d="M67.4,42.51c0,2.55-2.28,4.62-5.08,4.62s-5.08-2.07-5.08-4.62c0-.15.01-.3.03-.45.97-.01,2.04-.36,2.89-1.44,0,0,2.41-1.29,4.1-2.39,1.84.69,3.14,2.35,3.14,4.28Z" id="path14"/>
    <path class="cls-1" d="M62.6,23.82c-1.62.69-2.03,3-2.03,3-2.54-.35-3.44,1.21-3.73,2.72-2.4-.37-4.23-2.27-4.23-4.56,0-2.56,2.28-4.63,5.08-4.63,2.37,0,4.35,1.47,4.91,3.47Z" id="path15"/>
    <path class="cls-1" d="M80.28,33.38c-.79,1.59-2.56,2.7-4.61,2.7-2.81,0-5.08-2.07-5.08-4.63,0-1.15.46-2.2,1.22-3.01,1.05,1.05,2.42,1.94,3.97,1.8,0,0,2.45,2.26,4.5,3.14Z" id="path16"/>
    <path class="cls-1" d="M80.25,11.76c0,1.11-.43,2.12-1.13,2.91-1.68-.73-3.45-.88-3.45-.88-1.2-.39-2.68.52-3.81,1.48-1.08-.85-1.76-2.11-1.76-3.51,0-2.55,2.27-4.63,5.07-4.63s5.08,2.08,5.08,4.63Z" id="path17"/>
    <path class="cls-1" d="M44.43,34.24c0,.53-.1,1.04-.29,1.52-1.29.66-2.04,2.24-2.12,2.4h0s-.01.01-.01.01c-3.3-2.81-5.55-2.43-6.94-1.46-.5-.72-.79-1.57-.79-2.47,0-2.56,2.27-4.63,5.07-4.63s5.08,2.07,5.08,4.63Z" id="path18"/>
    <path class="cls-1" d="M46.01,19.4c-4.25-1.59-4.05,2.88-4.05,2.88-1.48-.02-2.13.78-2.41,1.57-2.14-.54-3.7-2.33-3.7-4.45,0-2.55,2.27-4.63,5.08-4.63s5.08,2.08,5.08,4.63Z" id="path19"/>
    <path class="cls-1" d="M12.94,57.28c-1.57,1.4-1.57,4.38-1.57,4.38-.8.05-1.31.59-1.63,1.3-.52.17-1.08.26-1.67.26-2.8,0-5.08-2.07-5.08-4.63s2.28-4.62,5.08-4.62c2.31,0,4.26,1.4,4.87,3.31Z" id="path20"/>
    <path class="cls-1" d="M28.21,43.49c0,.33-.04.65-.11.95-1.3-.02-2.14.89-2.66,1.94-.41.81-1.54.84-2.04.08-.94-1.42-2.07-2.07-2.07-2.07-1.24-.42-2.27-.1-3.06.46-.14-.43-.22-.89-.22-1.36,0-2.55,2.27-4.63,5.08-4.63s5.08,2.08,5.08,4.63Z" id="path21"/>
    <path class="cls-1" d="M99.48,22.29c-2.32-.05-4.13,3.09-4.13,3.09-1.84-.15-3.28.85-4.16,1.94-.93-.84-1.5-2.01-1.5-3.29,0-2.55,2.27-4.63,5.08-4.63,2.13,0,3.95,1.2,4.71,2.89Z" id="path22"/>
  </g>
</g>
</g>
</svg>`;
      }
      return `<svg class="plant8" xmlns="http://www.w3.org/2000/svg" id="Laag_2" data-name="Laag 2" viewBox="0 0 132.59 174.07">
  <defs>
    <style>

      .cls-1, .cls-2, .cls-3, .cls-4 {
        stroke-width: 0px;
      }

      .cls-1 {
        fill: #9d8a71 !important;
      }

      .cls-2 {
        fill: #604725!important;
      }

      .cls-3 {
        fill: #457604!important;
      }
    </style>
  </defs>
<g xmlns="http://www.w3.org/2000/svg" id="Laag_1-2" data-name="Laag 1">
<path class="cls-1" d="M107.74,134.09c4.33,1.12,8.78,1.21,13.16.86l-.02-.15c-5.42.13-11.01-.25-15.89-2.69-1.01-.54-2.1-.89-3.22-1.17,1.36-.02,2.71-.14,4.08-.27,2.88-.16,5.84.17,8.74.17v-.15c-2.91-.49-5.76-1.13-8.74-1.28-2.69-.22-5.35-.12-7.92.68-1.32-.32-2.6-.71-3.77-1.37-1.36-.92-2.79-1.95-4.33-2.6-1.86-.88-4.64-1.03-6.68-1.2h-.03c-.71-.25-1.1-.38-1.1-.38-.1-.34-.59-.53-1.3-.64h-12.1v.05c-.47.06-.96.13-1.45.2l-9.78-.25s-.65,1.21-1.39,1.95c-.55.04-1.1.07-1.67.1-3.38.59-6.03,2.7-8.98,4.23-2.94,1.41-6.39,1.05-9.58,1.26v.15c2.62.02,5.25.05,7.88-.34,3.74-.94,6.87-4.06,10.74-4.52.2-.01.41-.01.61-.02-.23.6.08,1.7.25,2.2l-3.68,1.77c-2.64,1.47-6.52,2.05-7.81,5.24-.02.05-.04.09-.05.14-1.37.95-2.88,1.7-4.44,2.21-2.32.56-7.91,2.62-10.25,2.54-1.2.02-2.35-.46-3.6-.39-2.56.16-4.45,2.29-5.9,4.19l.13.09c.78-.9,1.66-1.73,2.63-2.4.97-.68,2.04-1.15,3.16-1.09,1.08,0,2.22.55,3.53.62.72.05,1.44.02,2.14-.08-.5.2-1.01.38-1.54.55-3.39,1.69-5.97,4.63-8.55,7.29l.1.11c2.11-1.6,4.23-3.24,6.46-4.64,2.08-1.25,4.72-1.76,6.12-3.8,2.02-.42,4.08-.7,6.1-1.52,1.16-.48,2.26-1.14,3.22-1.94-.33.85-.66,1.7-.98,2.55-2.66,2.36-4.93,5.06-7.44,7.53-3.34,2.55-6.42,4.47-9.4,7.64l.1.12c2.79-2.21,5.65-4.23,8.8-5.89,2.72-1.8,5.08-4.06,6.99-6.68-.72,2.3-1.49,4.71-2.66,6.75-1.53,2.32-4.12,4.05-5.3,6.67l.14.07c1.55-2.47,4.18-3.83,5.96-6.16,1.68-2.37,2.67-5.45,3.54-7.9.86-1.97,1.68-4,2.49-5.99,1.23-2.58,4.63-3.06,6.96-4.51l3.37-1.76.21-.11-.17.17c-.68.7-1.3,1.47-1.96,2.15-.93.93-2.49,1.91-2.82,3.7-.13.86.02,1.57-.06,2.23-.69,3.43-4.07,5.98-6.45,8.37l.1.12c1.17-.9,2.29-1.85,3.37-2.86,1.57-1.54,3.48-3.19,3.87-5.51.13-.8.04-1.58.17-2.16.3-1.31,1.7-2.11,2.66-2.97.92-.74,1.71-1.73,2.49-2.39,1.65-.19,3.6-.6,4.68.01,1.08.61,1.05,1.69,2.23,2.56.19.14.39.23.61.28-.19.22-.38.44-.57.66-1.35,1.47-2.67,2.96-3.98,4.49-1.43.68-2.8,1.37-4.26,1.99-.27.09-.52.15-.73.16-.15.01-.39.02-.5.07-1.79.8-2.97,2.4-4.21,3.81l.11.11c1.28-1,2.6-2.12,4.06-2.78.16-.07.29-.1.42-.09.41.05.8,0,1.14-.06.55-.09,1.09-.22,1.62-.4-.51.61-1,1.23-1.49,1.85-5.09,6.07-8.2,14.17-15.54,17.93l.06.15c1.88-.78,3.52-1.99,5.04-3.32,2.61-2.3,4.67-5.1,6.7-7.91-.91,2.53-1.62,5.06-2.09,7.78-.27,1.22-.32,2.59-.57,3.77-.89,1.72-2.53,3.46-4.39,4.11v.16c.92-.1,1.7-.56,2.42-1.06,1.43-1.05,3.01-2.34,3.16-4.23.82-3.97,2.77-7.76,2.48-11.92,1.18-1.61,2.38-3.19,3.7-4.66,2.59-3.03,5.47-5.81,8.04-8.92.43-.56.89-1.12,1.34-1.7.47-.05.86-.04,1.07.2.2.22.38.42.58.57-.21,1.31-.53,2.58-.98,3.79-.5,1.48-1.09,2.98-1.78,4.34-.17.48-.34.95-.49,1.43-1.27,1.35-2.35,2.79-3.49,4.25-1.81,2.56-3.28,5.31-4.66,8.08l.14.08c1.61-2.19,3.19-4.45,4.92-6.52.57-.67,1.27-1.28,1.87-1.94-.24.8-.46,1.6-.68,2.4-.92,3.68-1.94,7.55-2.11,11.39-.35.24-.63.41-.93.66-1.02,1.18-2.02,2.47-3.18,3.61l.08.13c1.05-.42,2.02-.96,2.96-1.6.38-.21.77-.49,1.07-.83.09,2.25.53,4.46,1.53,6.59.54,1.25,1.18,2.44,2.02,3.51l.13-.09c-2.01-3.42-2.91-7.43-2.64-11.36.77-6.55,2.96-12.94,4.95-19.2,1.09-2.18,2.17-5.43,2.65-8.31.19-.02.39.01.59.03.18,3.67.19,7.36.57,11.08.31,4.07,1.33,8.06,1.61,12.1-.16,3.12-.68,6.39-.73,9.51l.16-.02c.1-2.57.58-5.5.85-8.1.08-.9.26-1.86.1-2.76-.1-.71-.2-1.43-.3-2.14.32.92.7,1.83,1.14,2.71.94,2.27,3.09,3.84,4.31,5.9,1.21,2.03,2.02,4.34,2.56,6.67,1.03,2.11,3.14,3.54,5.4,4.01l.03-.15c-2.1-.6-4.01-2.06-4.85-4.1-.25-2.02-1.1-4.85-2.23-6.95-1.11-2.2-3.08-3.65-3.89-6-1.57-3.87-2.49-7.95-3.51-12.02,0,0-.01-.01-.01-.02-.18-3.19-.15-6.36-.24-9.52.1.02.2.03.29.03-.03,2.24.04,4.6.22,6.72.27,6.36,5.38,10.92,8.54,15.97,1.7,2.98,6.18,3.03,8.01,5.46.92,1.43,1.12,3.37.42,5.07l.14.08c1.08-1.58,1.23-3.81.31-5.63-1.38-2.68-4.79-3-6.76-4.94-.11-.14-.21-.27-.32-.41.52.22,1.07.37,1.64.43,1.2.08,2.41-.14,3.45.34,1.5.9,2.62,2.43,3.7,3.83l.13-.08c-1.1-2.18-2.52-5.03-5.26-5.31-2.13-.25-3.68-.89-5.46-1.62-.92-1.25-1.85-2.5-2.9-3.7-2.31-2.83-4.41-5.88-4.68-9.6-.28-2.27-.4-4.57-.46-6.87.56-.62.18-2.13,1.61-2.86.02-.01.04-.02.06-.03.29-.15.53-.22.74-.24.79-.1,1.11.48,1.73.57h.01c.52.84,1.1,1.65,1.76,2.39.13.15.26.3.4.44-1.62,3.34-2.89,8.81,1.38,10.33,1.25.44,1.87,1.58,2.2,2.79,0,0,.01.02.01.03-.05.03.16.09.16-.02h-.16s-.01,0,0-.03c.01-.06.11-.05.15-.03-.01-.06-.02-.15-.02-.2-.94-5.51-5.29-1.26-3.31-9.55.11-.88.19-1.78.19-2.7.65.66,1.34,1.28,2.05,1.88h.01c1,.94,2.03,1.95,2.44,2.6.33.67,1.06,1.81.98,2.54-.13,1.08-.26,2.25-.28,3.34,0,.83-.09,1.73.45,2.47,1.04,1.31,2.63,1.29,2.91,3,.16.68.18,1.41.18,2.14l.16.02c.29-1.45.48-3.37-.87-4.38-.58-.51-1.23-.9-1.48-1.37-.38-1.23.11-2.66.23-3.93.11-.7.32-1.58.13-2.31.98.91,1.9,1.88,2.69,2.97,2.46,3.09,2.57,7.32,4.84,10.54,1.07,1.61,2.75,3.21,4.82,3.15l-.02-.15c-1.95-.06-3.47-1.67-4.41-3.25-1.46-2.4-1.85-5.24-2.81-7.84.83.73,1.83,1.29,2.9,1.68,2.35.48,3.96,2.18,6.15,3.15.17.08.42.11.61.17,1.82.94,3.11,2.75,4.51,4.26l.13-.09c-1.08-1.67-2.17-3.4-3.72-4.72-.23-.19-.61-.38-.94-.47-.71-.29-1.33-.86-2.02-1.39-.95-.76-1.88-1.65-3.08-2.13-1.72-.4-3.28-.82-4.97-1.51-.32-.69-.69-1.35-1.16-1.98-1.07-1.55-2.35-2.92-3.71-4.24.57.13,1.16.2,1.79.2,1.56-.39,3.19-.74,4.84-.85,2.48-.23,5.14.02,7.32,1.25.51.72,1.26,1.25,2.13,1.62,1.42,1.24,2.76,2.57,3.92,4,2.58,2.26,5.48,4.36,8.87,5.12l.03-.16c-3.26-.88-6.02-3.08-8.42-5.37-.85-1.13-1.66-2.12-2.49-2.99,2.81.61,6.21.34,8.38.26v-.16c-2.23-.27-4.44-.62-6.57-1.15-1.55-.53-3.01-.86-4.5-1.35h-.01c-3.38-2.42-7.16-2.9-12.94-1.82-.66.27-1.27.11-2.03-.09-.86-.22-1.95-.62-3.06-1.05-1.57-1.44-3.11-2.88-4.4-4.49.35.04.65.01.84-.13.64-.47-.07-3.85,1.62-3.78,1.69.07,3.37.14,3.64-.2.17-.21.51-.48.75-.78.45.34.9.67,1.34,1.01.2.16.39.33.51.47,1.4,2.39,4.3,3.57,6.5,5.03l.12-.11c-1.67-1.6-3.79-3.02-5.09-4.85-.17-.27-.09-.22-.33-.76-.5-.94-1.29-1.58-2.16-2.07,1.01.14,1.99.34,2.94.72,1.97.66,3.68,2.23,5.54,2.9.68.96,1.19,1.88,1.52,2.92.31.67.86,1.01,1.38,1.38,3.09,1.67,6.44,2.71,9.78,3.6l.05-.15c-3.24-1.59-6.88-2.85-9.57-5.3-.12-.1-.13-.16-.16-.19-.06-.03-.07-.1-.1-.16-.26-.61-.62-1.15-1.06-1.6,1.67.4,3.32.67,4.96.98,2.14.39,4.05,1.61,6.15,2.15ZM82.48,138.97l.18.15c-.07-.03-.15-.05-.22-.08l.04-.07Z" id="path1"/>
<path class="cls-2" d="m 84.27,87.23 c -1.13,0.78 -2.29,1.59 -3.3,2.3 0.07,0.21 -2.118963,1.752492 -2.218963,1.982492 C 76.753425,93.399827 77.16,94.14 76.62,96.12 c -0.54,1.98 -1.53,6.56 -1.08,9.89 0.45,3.32 2.85,15.32 5.17,17.9 l -23.579371,0.39187 c 0,0 6.909371,-12.63187 6.809371,-20.45187 C 63.89,99.52 63.9,94.37 63.91,90.63 63.65,90.26 63.37,89.86 63.07,89.44 60.4,87.55 56.88,84.85 53.44,82.15 45.66,78.42 36.48,75.33 35.08,74.86 c 0.33,-0.07 0.66,-0.13 0.99,-0.17 1.32,-0.17 2.46,-0.46 3.46,-0.85 1.82,0.66 4.15,1.51 6.66,2.52 -2.04,-1.65 -3.65,-2.97 -4.47,-3.65 0.74,-0.49 1.36,-1.04 1.87,-1.59 1.89,1.54 6.48,5.29 11.24,9.04 0.85,0.41 1.68,0.83 2.48,1.26 -2.83,-3.92 -5.83,-8.04 -8.27,-11.37 l 0.16,-0.11 c 1.36,1.03 2.72,1.54 4,1.7 4.14,5.65 7.21,9.88 9.48,13.05 0.45,0.33 0.01353,-0.02014 0.403529,0.309861 l 0.277094,-0.09443 c 0,0 -0.05936,-0.243554 0.760642,-0.933554 C 62.401265,79.561878 60.36,73.25 58.86,70.24 c 0.56,-0.34 1.08,-0.7 1.55,-1.08 l 1,-0.5 c 0.22,0.44 5.044988,8.125004 7.294988,13.825004 C 69.194988,82.375004 68.86,82.6 69.43,82.63 69.54,82.64 68.678139,82.53313 68.778139,82.55313 L 69.380637,67.952506 70.97,68.41 c 0.73,0.67 2.004367,1.12 2.714367,1.42 l 0.135617,11.95191 c 0.75,0.83 -0.621225,-0.138098 -0.451225,0.291902 L 80.22,73.19 c 0.97,0.78 1.89,1.12 2.74,1.18 l -3.245666,9.260678 -0.123123,0.81062 c 0,0 0.427502,-0.521869 0.740629,0.478115 1.189997,-0.42 -0.146207,0.353101 2.163793,-0.766899 C 83.505633,83.462514 85.16,83.69 86.39,82.85 c 1.62,-1.11 2.96,-2.03 3.54,-2.45 0.69,-0.5 1.9,-1.82 3.86,-5.25 0.84,0.23 1.65,0.31 2.42,0.26 l 0.15,0.09 -0.12,0.23 c -0.86,1.53 -1.64,2.81 -2.37,3.84 3.8,-2.03 7.81,-4.23 11.58,-6.34 l 0.24,-0.13 5.02,-2.84 1.2,2.1 C 108.16,74.5 93.67,82.71 84.27,87.23 Z" id="path2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cccsccccccccccccccccccccccccccccccccccccccccccccccccccc"/>
<path style="fill:#5b4511;stroke-width:4.93172;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 37.329572,75.647748 C 21.672985,70.00351 22.625654,68.994093 22.493576,68.903374 c -0.870536,-0.597948 2.743746,-0.7802 2.701976,-0.424096 0,0 0.738667,0.01635 6.006534,1.9579 1.185045,0.436766 9.278939,3.839166 9.278939,3.839166 z" id="path22-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.39677;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 42.832219,73.664441 C 32.386035,64.243219 33.38185,63.529718 33.305202,63.409242 c -0.505184,-0.794075 2.301717,-0.03187 2.175028,0.296035 0,0 0.55939,0.206759 4.06284,3.417049 0.788127,0.722179 6.059426,6.053472 6.059426,6.053472 z" id="path22-5-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 51.841497,73.850185 C 41.960453,62.649682 34.215509,52.494435 34.151303,52.361331 c -0.423172,-0.877305 3.004619,-0.10444 2.813352,0.198196 0,0 9.037568,10.411462 12.343307,14.218067 0.743651,0.856324 5.636521,7.080665 5.636521,7.080665 z" id="path22-5-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path d="M 38.497956,69.820444" style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" id="path1-3"/>
<path style="fill:#5b4511;stroke-width:5.02886;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 59.94777,72.156789 C 52.654861,58.566034 47.409854,46.59679 47.383126,46.450764 c -0.176144,-0.962471 3.419891,0.774233 3.100813,1.008131 0,0 6.613144,12.590447 9.032656,17.194148 0.544288,1.035637 3.923322,8.414243 3.923322,8.414243 z" id="path22-5-8-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.404043,68.650254 c -1.089536,-14.896285 -0.01263,-25.387878 0.01679,-25.5327 0.193938,-0.95453 2.455343,1.734916 2.119942,1.860128 0,0 0.895442,13.757702 1.223986,18.788627 0.07391,1.131745 0.379442,6.226608 0.379442,6.226608 z" id="path22-5-8-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.23029;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 69.440576,44.076519 C 65.429757,30.23934 62.746456,18.157975 62.74058,18.0139 c -0.03871,-0.949611 2.394191,1.055855 2.142741,1.254398 0,0 3.612543,12.805994 4.934489,17.488636 0.297384,1.053395 1.735929,8.300348 1.735929,8.300348 z" id="path22-5-8-2-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 70.815112,55.543702 c 5.388496,-13.930201 10.83343,-25.482944 10.921985,-25.601254 0.58368,-0.77978 1.476996,2.618611 1.120272,2.588285 0,0 -5.076792,12.818045 -6.932286,17.505831 -0.417404,1.054549 -3.687511,8.264888 -3.687511,8.264888 z" id="path22-5-8-2-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 55.698511,61.016761 c -1.089536,-14.896285 -1.11088,-27.667845 -1.081458,-27.812667 0.193938,-0.95453 2.455343,1.734916 2.119942,1.860128 0,0 0.895442,13.757699 1.223986,18.788629 0.07391,1.13174 0.20311,9.04792 0.20311,9.04792 z" id="path22-5-8-2-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 79.934661,73.802095 c 5.388496,-13.9302 11.185462,-25.306829 11.274017,-25.425139 0.58368,-0.77978 1.476996,2.618611 1.120272,2.588285 0,0 -5.076792,12.818049 -6.932286,17.505829 -0.417404,1.05455 -2.777034,6.673072 -2.777034,6.673072 z" id="path22-5-8-2-1-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:4.63488;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 93.737095,75.49721 c 2.658012,-14.697666 5.820873,-27.071409 5.885463,-27.204327 0.425752,-0.876058 1.945382,2.292193 1.589362,2.329843 0,0 -2.562167,13.546644 -3.498045,18.500662 -0.210525,1.11444 -1.346158,6.443922 -1.346158,6.443922 z" id="path22-5-8-2-1-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.67711;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 110.11736,71.352319 c 4.88183,-9.677864 9.81478,-17.704013 9.89502,-17.786208 0.5288,-0.541744 1.33811,1.819253 1.01493,1.798184 0,0 -4.59943,8.905205 -6.28046,12.161996 -0.37815,0.732637 -2.80549,4.835095 -2.80549,4.835095 z" id="path22-5-8-2-1-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.11991;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 25.89355,68.743013 c -4.887391,-6.959157 -10.146593,-12.5881 -10.226911,-12.647205 -0.529402,-0.389557 -1.339643,1.308188 -1.016093,1.293038 0,0 4.604675,6.403553 6.287616,8.745445 0.378587,0.526825 1.456491,2.668314 1.456491,2.668314 z" id="path22-5-8-2-1-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 38.752532,56.963752 c 0.768445,-7.134691 1.890006,-13.197438 1.917761,-13.264423 0.182947,-0.441493 1.090874,0.969438 0.909746,1.008917 0,0 -0.765886,6.582765 -1.045399,8.990023 -0.06288,0.541529 -0.699264,4.306292 -0.699264,4.306292 z" id="path22-5-8-2-1-11" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 84.83657,62.318011 c 0.768445,-7.134693 1.890006,-13.19744 1.917761,-13.264425 0.182947,-0.441493 1.090874,0.969438 0.909746,1.008917 0,0 -0.765886,6.582768 -1.045399,8.990028 -0.06288,0.54152 -0.699264,4.30629 -0.699264,4.30629 z" id="path22-5-8-2-1-11-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 67.390597,34.083299 c 0.76845,-7.134691 1.89001,-13.197438 1.91776,-13.264423 0.18295,-0.441493 1.09087,0.969438 0.90975,1.008917 0,0 -0.76589,6.582765 -1.0454,8.990023 -0.0629,0.541529 -0.69927,4.306292 -0.69927,4.306292 z" id="path22-5-8-2-1-11-4" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:3.19796;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 57.415678,41.857458 C 53.390089,35.623408 49.141641,30.652238 49.067564,30.608009 48.5793,30.31652 47.5032,32.287313 47.837907,32.198656 c 0,0 3.814661,5.712188 5.208651,7.801476 0.31359,0.469999 2.84563,3.598753 2.84563,3.598753 z" id="path22-5-8-2-1-11-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="M 22.820871,68.098958 C 21.14794,61.120733 20.167698,55.033539 20.171338,54.961123 c 0.02401,-0.477294 1.35314,0.546651 1.1958,0.644681 0,0 1.489936,6.457513 2.035324,8.818777 0.122687,0.531183 0.787962,4.290949 0.787962,4.290949 z" id="path22-5-8-2-1-11-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 95.80879,65.252295 c 4.27684,-5.762201 8.31511,-10.421302 8.37297,-10.464999 0.38139,-0.287973 0.44944,1.388455 0.27328,1.330742 0,0 -3.99504,5.287631 -5.455503,7.221559 -0.328559,0.435038 -2.784382,3.358621 -2.784382,3.358621 z" id="path22-5-8-2-1-11-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.29821;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 114.27745,65.27778 c 0.76845,-7.134691 1.89001,-13.197438 1.91776,-13.264423 0.18295,-0.441493 1.09087,0.969438 0.90975,1.008917 0,0 -0.76589,6.582765 -1.0454,8.990023 -0.0629,0.541529 -0.69927,4.306292 -0.69927,4.306292 z" id="path22-5-8-2-1-11-1" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 79.741936,36.541512 c 3.248363,-0.495528 6.195779,-0.469007 6.234479,-0.454038 0.255071,0.09867 0.0359,1.209119 -0.0527,1.042903 0,0 -3.01979,0.402854 -4.123875,0.550713 -0.248372,0.03326 -2.054634,0.07417 -2.054634,0.07417 z" id="path22-5-8-2-1-11-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 56.448292,43.583025 c 0.7956,-3.188171 1.9568,-5.897338 1.98553,-5.927271 0.18942,-0.197283 1.12943,0.433198 0.9419,0.45084 0,0 -0.79295,2.941539 -1.08234,4.017234 -0.0651,0.241985 -0.72398,1.924287 -0.72398,1.924287 z" id="path22-5-8-2-1-11-6-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 105.5571,73.982478 c 0.7956,-3.188171 1.95679,-5.897338 1.98553,-5.927271 0.18942,-0.197283 1.12943,0.433198 0.9419,0.45084 0,0 -0.79295,2.941539 -1.08235,4.017234 -0.0651,0.241985 -0.72397,1.924287 -0.72397,1.924287 z" id="path22-5-8-2-1-11-6-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 80.085527,74.725302 c 3.231096,-0.597859 6.17788,-0.664423 6.217031,-0.650689 0.258063,0.09058 0.07407,1.207389 -0.01974,1.044051 0,0 -3.005563,0.498015 -4.104428,0.680666 -0.247197,0.04109 -2.051268,0.139012 -2.051268,0.139012 z" id="path22-5-8-2-1-11-6-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 60.322897,69.510919 c 0.795601,-3.188171 1.956797,-5.897338 1.985533,-5.927271 0.189412,-0.197283 1.129427,0.433198 0.941896,0.45084 0,0 -0.792952,2.941539 -1.082343,4.017234 -0.0651,0.241985 -0.723975,1.924287 -0.723975,1.924287 z" id="path22-5-8-2-1-11-6-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.230866,59.754954 c -1.67586,-2.826466 -2.754961,-5.569366 -2.755574,-5.610855 -0.004,-0.273461 1.107705,-0.486056 0.98676,-0.34166 0,0 1.504336,2.649226 2.054875,3.617613 0.123849,0.217845 0.838155,1.877369 0.838155,1.877369 z" id="path22-5-8-2-1-11-6-78" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 46.727738,66.480468 c 0.795601,-3.188171 1.956797,-5.897338 1.985533,-5.927271 0.189412,-0.197283 1.129424,0.433198 0.941896,0.45084 0,0 -0.792952,2.941539 -1.082343,4.017234 -0.0651,0.241985 -0.723975,1.924287 -0.723975,1.924287 z" id="path22-5-8-2-1-11-6-20" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.5632;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 40.028623,70.652536 c -0.37436,-3.264548 -0.238227,-6.208937 -0.221829,-6.247053 0.108092,-0.251225 1.209618,0.0091 1.040221,0.09146 0,0 0.290252,3.032685 0.396942,4.141506 0.024,0.249437 -0.0023,2.055971 -0.0023,2.055971 z" id="path22-5-8-2-1-11-6-28" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 56.298263,55.204805 c 1.230099,-4.387114 3.025454,-8.11509 3.069884,-8.156279 0.292854,-0.271473 1.746231,0.596106 1.456289,0.620383 0,0 -1.226003,4.047733 -1.673438,5.527954 -0.100653,0.332986 -1.119356,2.647934 -1.119356,2.647934 z" id="path22-5-8-2-1-11-6-26" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 71.663244,69.583215 c 1.2301,-4.387114 3.02545,-8.11509 3.06988,-8.156279 0.29286,-0.271473 1.74623,0.596106 1.45629,0.620383 0,0 -1.226,4.047733 -1.67344,5.527954 -0.10065,0.332986 -1.11935,2.647934 -1.11935,2.647934 z" id="path22-5-8-2-1-11-6-26-7" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 29.625431,72.209294 c -2.040647,-4.073779 -3.219661,-8.040016 -3.214488,-8.100379 0.03411,-0.397867 1.693135,-0.733458 1.494912,-0.52047 0,0 1.815401,3.819888 2.479947,5.21618 0.149494,0.314105 0.952771,2.71233 0.952771,2.71233 z" id="path22-5-8-2-1-11-6-26-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 69.098965,40.649505 c 1.230099,-4.387114 3.025454,-8.11509 3.069884,-8.156279 0.292854,-0.271473 1.746231,0.596106 1.456289,0.620383 0,0 -1.226003,4.047733 -1.673438,5.527954 -0.100653,0.332986 -1.119356,2.647934 -1.119356,2.647934 z" id="path22-5-8-2-1-11-6-26-6" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 73.586044,50.842571 c 4.272878,-1.581905 8.344435,-2.319151 8.403868,-2.307395 0.391732,0.0775 0.543486,1.763317 0.353505,1.542948 0,0 -3.995832,1.385839 -5.456543,1.89336 -0.328596,0.11417 -2.800409,0.649786 -2.800409,0.649786 z" id="path22-5-8-2-1-11-6-26-3" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 38.679408,75.108765 c -3.890676,2.371192 -7.745576,3.874803 -7.806161,3.874651 -0.399325,-0.001 -0.871232,-1.626536 -0.642552,-1.446645 0,0 3.656323,-2.125683 4.992748,-2.903643 0.300637,-0.175008 2.624053,-1.174247 2.624053,-1.174247 z" id="path22-5-8-2-1-11-6-26-8" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:2.28011;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 103.33766,75.137527 c 4.48941,0.777878 8.38054,2.18507 8.42603,2.225077 0.29983,0.263759 -0.41555,1.79777 -0.46917,1.511805 0,0 -4.15137,-0.80829 -5.6694,-1.10298 -0.3415,-0.06629 -2.74799,-0.844452 -2.74799,-0.844452 z" id="path22-5-8-2-1-11-6-26-21" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 45.936735,81.608781 c 3.401129,-0.999107 6.502315,-1.455618 6.5435,-1.44779 0.271449,0.05159 0.07626,1.136972 -0.02223,0.994347 0,0 -3.163648,0.874165 -4.320314,1.194308 -0.260199,0.07202 -2.158876,0.405812 -2.158876,0.405812 z" id="path22-5-8-2-1-11-6-26-5" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 94.107664,85.188192 c -3.468342,-0.732445 -6.415386,-1.800479 -6.44794,-1.826894 -0.21456,-0.174099 0.471794,-1.037272 0.490909,-0.865003 0,0 3.200018,0.729891 4.370235,0.996273 0.263243,0.05992 2.093282,0.666009 2.093282,0.666009 z" id="path22-5-8-2-1-11-6-26-5-9" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc"/>
<path style="fill:#5b4511;stroke-width:1.56275;stroke-miterlimit:5.6;paint-order:stroke fill markers" d="m 39.908188,50.531635 c -2.134476,-2.830178 -3.655434,-5.571061 -3.662635,-5.61236 -0.04746,-0.272203 1.037011,-0.472366 0.938288,-0.329902 0,0 1.933803,2.652025 2.641328,3.621446 0.159165,0.218076 1.141167,1.87701 1.141167,1.87701 z" id="path22-5-8-2-1-11-6-26-5-2" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" sodipodi:nodetypes="cssscc" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:transform-center-x="-0.42749388" inkscape:transform-center-y="0.14249796"/>
</g>
</svg>`;
  }
}
