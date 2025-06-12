// Constants and configuration
let delijnSearchResultLimit = 5;
let lijnDataKleuren;
const lijnUpdateControllers = {};

// Utility functions
function calculateTimeUntilDepartureInMins(ETA) {
  const currentDate = new Date();
  return Math.round((ETA - currentDate) / 1000 / 60);
}

function getHexByCode(code) {
  const color = lijnDataKleuren.kleuren.find((color) => color.code === code);
  return color ? "#" + color.hex : null;
}

function getHalteDirections(delijnDirectionsData) {
  let delijnDirectionsArray = [];
  delijnDirectionsData.forEach((lijn) => {
    let description = lijn.omschrijving.split("-");
    let descriptionEndStop = description[description.length - 1];
    descriptionEndStop = descriptionEndStop.replace(")", "").replace("(", "");
    if (
      !delijnDirectionsArray.includes(descriptionEndStop) &&
      delijnDirectionsArray.length < 3
    ) {
      delijnDirectionsArray.push(descriptionEndStop);
    }
  });
  return delijnDirectionsArray.join(", ");
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Data fetching functions
async function fetchDelijnData(url) {
  return await browser.runtime.sendMessage({
    action: "fetchDelijnData",
    url: url,
  });
}

async function getDelijnAppData() {
  return await browser.runtime.sendMessage({
    action: "getDelijnAppData",
  });
}

async function setDelijnAppData(data) {
  return await browser.runtime.sendMessage({
    action: "setDelijnAppData",
    data: data,
  });
}

async function migrateDelijnData() {
  const lijnData = JSON.parse(localStorage.getItem("lijnData"));
  if (lijnData) {
    await setDelijnAppData(lijnData);
    localStorage.removeItem("lijnData");
  }
}

// Display functions
async function createHalteDoorkomst(doorkomst, container) {
  const entiteitnummer = doorkomst.entiteitnummer;
  const lijnnummer = doorkomst.lijnnummer;
  const destination = doorkomst.bestemming;
  const lijnKey = `${entiteitnummer}_${lijnnummer}`;

  if (lijnUpdateControllers[lijnKey]) {
    lijnUpdateControllers[lijnKey].abort();
  }
  const controller = new AbortController();
  lijnUpdateControllers[lijnKey] = controller;
  const signal = controller.signal;

  const originalETA = new Date(doorkomst.dienstregelingTijdstip);
  let ETA = originalETA;
  let predictionStatuses = doorkomst.predictionStatussen;
  let timeUntilDeparture;
  let arrivalTimeDeviation;

  const lijnCard = document.createElement("div");
  lijnCard.classList.add("lijnCard");

  if (predictionStatuses.includes("GESCHRAPT")) {
    lijnCard.classList.add("lijnCardCancelled");
    timeUntilDeparture = "Cancelled";
    arrivalTimeDeviation = "";
  } else if (predictionStatuses.includes("GEENREALTIME")) {
    lijnCard.classList.add("lijnCardNoData");
    timeUntilDeparture = calculateTimeUntilDepartureInMins(ETA);
    timeUntilDeparture =
      timeUntilDeparture < 1 ? "Now" : `${timeUntilDeparture} Min.`;
    arrivalTimeDeviation = "No data";
  } else if (predictionStatuses.includes("REALTIME")) {
    ETA = new Date(doorkomst["real-timeTijdstip"]);
    arrivalTimeDeviation = Math.round((ETA - originalETA) / 1000 / 60);
    arrivalTimeDeviation =
      arrivalTimeDeviation === 0
        ? "On time"
        : arrivalTimeDeviation > 0
        ? `+${arrivalTimeDeviation}`
        : arrivalTimeDeviation;
    timeUntilDeparture = calculateTimeUntilDepartureInMins(ETA);
    timeUntilDeparture =
      timeUntilDeparture < 1 ? "Now" : `${timeUntilDeparture} Min.`;
  }

  const lijnCardTop = document.createElement("div");
  lijnCardTop.classList.add("lijnCardTop");

  const lijnNumberElement = document.createElement("span");
  lijnNumberElement.classList.add("lijnNumber");
  lijnNumberElement.textContent = lijnnummer;

  const lijnDestinationElement = document.createElement("span");
  lijnDestinationElement.classList.add("lijnDestination");
  if (destination.length > 15) {
    lijnDestinationElement.classList.add("lijnDestinationLong");
  }
  lijnDestinationElement.textContent = destination;

  lijnCardTop.appendChild(lijnNumberElement);
  lijnCardTop.appendChild(lijnDestinationElement);

  const arrivalTimeDeviationElement = document.createElement("span");
  arrivalTimeDeviationElement.classList.add("arrivalTimeDeviation");
  arrivalTimeDeviationElement.textContent = arrivalTimeDeviation;

  const lijnCardBottom = document.createElement("div");
  lijnCardBottom.classList.add("lijnCardBottom");

  const time = document.createElement("span");
  time.classList.add("time");
  time.textContent = `${ETA.getHours()}:${ETA.getMinutes()
    .toString()
    .padStart(2, "0")}`;

  const timeUntilDepartureElement = document.createElement("span");
  timeUntilDepartureElement.classList.add("timeUntilDeparture");
  timeUntilDepartureElement.textContent = timeUntilDeparture;

  lijnCardBottom.appendChild(time);
  lijnCardBottom.appendChild(timeUntilDepartureElement);

  lijnCard.appendChild(lijnCardTop);
  lijnCard.appendChild(arrivalTimeDeviationElement);
  lijnCard.appendChild(lijnCardBottom);

  container.appendChild(lijnCard);

  try {
    await updateLijnCardWithApiData(
      lijnNumberElement,
      entiteitnummer,
      lijnnummer,
      signal
    );
  } catch (err) {
    if (err.name === "AbortError") {
      console.error(`Request for lijn ${lijnKey} was aborted`);
      return;
    }
    console.error(err);
  }
}

async function updateLijnCardWithApiData(
  lijnNumberElement,
  entiteitnummer,
  lijnnummer
) {
  try {
    const individualLijnData = await fetchDelijnData(
      `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`
    );
    const publicLineNumber = individualLijnData.lijnnummerPubliek;
    lijnNumberElement.textContent = publicLineNumber;

    const individualLijnDataColors = await fetchDelijnData(
      `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}/lijnkleuren`
    );

    lijnNumberElement.style.backgroundColor = getHexByCode(
      individualLijnDataColors.achtergrond.code
    );
    lijnNumberElement.style.borderColor = getHexByCode(
      individualLijnDataColors.achtergrondRand.code
    );
    lijnNumberElement.style.color = getHexByCode(
      individualLijnDataColors.voorgrond.code
    );
  } catch (error) {
    console.error("Failed to fetch additional data for lijn card:", error);
  }
}

function addDelijnAttest(container) {
  const delijnAttestElement = document.createElement("a");
  delijnAttestElement.classList.add("delijnAttest");
  delijnAttestElement.target = "_blank";
  delijnAttestElement.href =
    Math.random() < 0.1
      ? "https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato"
      : "https://www.delijn.be/nl/contact/attest-aanvraag/";
  delijnAttestElement.innerText = Math.random() < 0.1 ? "Latte?" : "Late?";
  container.appendChild(delijnAttestElement);
}

class DelijnWidget extends WidgetBase {
  constructor() {
    super();
    this.searchResultLimit = 5;
    this.elements = {
      topContainer: null,
      searchInput: null,
      searchButton: null,
      bottomContainer: null,
      infoContainer: null,
    };
  }

  async createContent() {
    this.element.classList.add("smpp-widget-transparent");
    this.container = document.createElement("div");
    this.initializeHTML();
    this.initializeData();
    return this.container;
  }

  initializeHTML() {
    // Create container structure
    this.container.id = "delijncontainer";

    this.elements.topContainer = document.createElement("div");
    this.elements.topContainer.id = "delijnTopContainer";

    this.elements.searchInput = document.createElement("input");
    this.elements.searchInput.classList.add("popupinput");
    this.elements.searchInput.classList.add("halteInput");
    this.elements.searchInput.spellcheck = false;
    this.elements.searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") this.handleHalteSearch();
    });

    this.elements.searchButton = document.createElement("button");
    this.elements.searchButton.classList.add("delijnSearchButton");
    this.elements.searchButton.innerHTML = delijnSearchButtonSvg;
    this.elements.searchButton.addEventListener("click", () =>
      this.handleHalteSearch()
    );

    this.elements.bottomContainer = document.createElement("div");
    this.elements.bottomContainer.id = "delijnBottomContainer";

    this.elements.topContainer.appendChild(this.elements.searchInput);
    this.elements.topContainer.appendChild(this.elements.searchButton);
    this.container.appendChild(this.elements.topContainer);
    this.container.appendChild(this.elements.bottomContainer);

    this.displayInfo("Loading...");
  }

  async displayLijnenBasedOnHalte(entiteitnummer, haltenummer) {
    this.displayInfo("Loading...");
    this.clearBottomContainer();

    const delijnData = await fetchDelijnData(
      `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteitnummer}/${haltenummer}/real-time?maxAantalDoorkomsten=5`
    );
    if (!delijnData.halteDoorkomsten[0]) {
      this.displayInfo(
        "Er zijn momenteel geen bussen beschikbaar voor deze halte."
      );
      return;
    } else if (delijnData.halteDoorkomsten[0].doorkomsten.length < 1) {
      this.displayInfo("Er zijn momenteel geen vertrekkende bussen");
      return;
    }

    this.hideInfo();
    for (const doorkomst of delijnData.halteDoorkomsten[0].doorkomsten) {
      await createHalteDoorkomst(doorkomst, this.elements.bottomContainer);
    }
    addDelijnAttest(this.elements.bottomContainer);
  }

  async initializeData() {
    if (localStorage.getItem("lijnData")) {
      await migrateDelijnData();
    }

    lijnDataKleuren = await browser.runtime.sendMessage({
      action: "getDelijnColorData",
    });

    const delijnAppData = await getDelijnAppData();
    if (delijnAppData.entiteitnummer == null) {
      this.displayInfo("Zoek naar een halte aub.");
    } else {
      await this.displayLijnenBasedOnHalte(
        delijnAppData.entiteitnummer,
        delijnAppData.haltenummer
      );
    }
  }

  async handleHalteSearch() {
    const searchQuery = this.elements.searchInput.value;
    this.searchResultLimit = 5;
    this.clearBottomContainer();

    if (!searchQuery) {
      this.displayInfo("Gelieve een halte te kiezen.");
      return;
    }

    await this.showHalteOptions(searchQuery);
  }

  async showHalteOptions(searchQuery) {
    // Abort previous request
    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }

    // Create a new controller for this request
    this.currentAbortController = new AbortController();
    const signal = this.currentAbortController.signal;

    let delijnHaltesData;
    try {
      delijnHaltesData = await fetchDelijnData(
        `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${searchQuery}?maxAantalHits=${this.searchResultLimit}`,
        { signal }
      );
    } catch (error) {
      if (error.name === "AbortError") return; // Silently ignore aborted request
      this.displayInfo("Er liep iets mis: " + error);
      return;
    }

    if (delijnHaltesData?.aantalHits === 0) {
      this.displayInfo("Geen zoekresultaten");
      return;
    }

    const halteSleutels = delijnHaltesData.haltes
      .map((halte) => `${halte.entiteitnummer}_${halte.haltenummer}`)
      .join("_");

    let delijnHaltesLijnrichtingenData;
    try {
      delijnHaltesLijnrichtingenData = await fetchDelijnData(
        `https://api.delijn.be/DLKernOpenData/api/v1/haltes/lijst/${halteSleutels}/lijnrichtingen`,
        { signal }
      );
    } catch (error) {
      if (error.name === "AbortError") return;
      this.displayInfo("Er liep iets mis: " + error);
      return;
    }

    delijnHaltesLijnrichtingenData.halteLijnrichtingen.forEach((halte, i) => {
      halte.halte.omschrijving = delijnHaltesData.haltes[i].omschrijving;
    });

    try {
      this.hideInfo();
      const startIndex = this.searchResultLimit - 5;

      const results =
        delijnHaltesLijnrichtingenData.halteLijnrichtingen.slice(startIndex);

      for (let i = 0; i < results.length; i++) {
        if (signal.aborted) return;
        const halte = results[i];
        await this.createHalteOption(halte);
      }

      if (delijnHaltesData.aantalHits > this.searchResultLimit) {
        this.addShowMoreHaltesButton();
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        this.displayInfo("Er liep iets mis: " + error);
        console.error(error);
      }
    }
  }

  async createHalteOption(halte) {
    const halteLijnCard = document.createElement("div");
    halteLijnCard.dataset.entiteitnummer = halte.halte.entiteitnummer;
    halteLijnCard.dataset.haltenummer = halte.halte.haltenummer;
    halteLijnCard.classList.add("lijnCard", "lijnCardHalte");

    const richtingen = "Naar: " + getHalteDirections(halte.lijnrichtingen);
    halteLijnCard.innerHTML = `
    <h3 class="halteTitle">${halte.halte.omschrijving}</h3>
    <div class="halteDirections">${richtingen}</div>
    <div class="halteLijnen"></div>`;

    const lijnenContainer = halteLijnCard.querySelector(".halteLijnen");
    const lijnenArray = [];

    for (const lijnrichting of halte.lijnrichtingen.slice(0, 5)) {
      const lijn = document.createElement("span");
      lijn.classList.add("lijnNumber", "halteLijnNumber");
      lijn.dataset.entiteitnummer = lijnrichting.entiteitnummer;
      lijn.dataset.lijnnummer = lijnrichting.lijnnummer;
      lijnenContainer.append(lijn);

      const individualLijnData = await fetchDelijnData(
        `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}`
      );

      if (lijnenArray.includes(individualLijnData.lijnnummerPubliek)) {
        lijn.remove();
        continue;
      }

      lijnenArray.push(individualLijnData.lijnnummerPubliek);
      lijn.innerText = individualLijnData.lijnnummerPubliek;

      const individualLijnDataColors = await fetchDelijnData(
        `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}/lijnkleuren`
      );

      lijn.style.backgroundColor = getHexByCode(
        individualLijnDataColors.achtergrond.code
      );
      lijn.style.borderColor = getHexByCode(
        individualLijnDataColors.achtergrondRand.code
      );
      lijn.style.color = getHexByCode(individualLijnDataColors.voorgrond.code);
    }

    halteLijnCard.addEventListener("click", (event) => {
      this.choseThisHalte(event.currentTarget);
    });
    this.elements.bottomContainer.appendChild(halteLijnCard);
    if (document.body.classList.contains("enableAnimations"));
  }

  async choseThisHalte(halteElement) {
    const delijnAppData = {
      entiteitnummer: halteElement.dataset.entiteitnummer,
      haltenummer: halteElement.dataset.haltenummer,
    };
    await setDelijnAppData(delijnAppData);
    await this.displayLijnenBasedOnHalte(
      delijnAppData.entiteitnummer,
      delijnAppData.haltenummer
    );
  }

  addShowMoreHaltesButton() {
    const showMoreButton = document.createElement("button");
    showMoreButton.classList.add("showMoreHaltesButton");
    showMoreButton.innerText = "Toon meer";
    showMoreButton.addEventListener("click", () => {
      this.searchResultLimit += 5;
      showMoreButton.remove();
      this.showHalteOptions(this.elements.searchInput.value);
    });
    this.elements.bottomContainer.appendChild(showMoreButton);
  }

  // Info display methods
  createInfoElement() {
    if (!this.elements.infoContainer) {
      this.elements.infoContainer = document.createElement("div");
      this.elements.infoContainer.classList.add(
        "delijnInfoContainer",
        "delijnInfoContainerVisible"
      );
      this.elements.bottomContainer.appendChild(this.elements.infoContainer);
    }
    return this.elements.infoContainer;
  }

  displayInfo(info) {
    const infoContainer = this.createInfoElement();
    if (info) infoContainer.innerText = info;
    infoContainer.classList.add("delijnInfoContainerVisible");
    infoContainer.classList.remove("delijnInfoContainerHidden");
  }

  hideInfo() {
    const infoContainer = this.createInfoElement();
    infoContainer.classList.add("delijnInfoContainerHidden");
    infoContainer.classList.remove("delijnInfoContainerVisible");
  }

  clearBottomContainer() {
    this.elements.bottomContainer.innerHTML = "";
    this.elements.bottomContainer.appendChild(this.elements.infoContainer);
    this.displayInfo("");
  }

  async createPreview() {
    const previewElement = document.createElement("div");

    const previewElementTitle = document.createElement("div");
    previewElementTitle.classList.add("delijn-preview-title");
    previewElementTitle.innerText = "De Lijn";

    const previewElementIcon = document.createElement("div");
    previewElementIcon.classList.add("delijn-icon-128-container");
    previewElementIcon.innerHTML = lijnIconSvg;

    previewElement.appendChild(previewElementTitle);
    previewElement.appendChild(previewElementIcon);

    return previewElement;
  }
}

registerWidget(new DelijnWidget());
