// Constants and configuration

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
    console.log(ETA);
    timeUntilDeparture =
      timeUntilDeparture < 1 ? "Now" : `${timeUntilDeparture} Min.`;
    arrivalTimeDeviation = "No data";
  } else if (predictionStatuses.includes("REALTIME")) {
    console.log(ETA);
    if (doorkomst["real-timeTijdstip"] != null) {
      ETA = new Date(doorkomst["real-timeTijdstip"]);
    }
    console.log(ETA);
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
  specialChance = Math.random() < 0.1;
  delijnAttestElement.rel = "noopener noreferrer";
  delijnAttestElement.href = specialChance
    ? "https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato"
    : "https://www.delijn.be/nl/contact/attest-aanvraag/";
  delijnAttestElement.innerText = specialChance ? "Latte?" : "Late?";
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
    if (this.currentHalteOptionsAbortController) {
      this.currentHalteOptionsAbortController.abort();
    }

    this.currentHalteOptionsAbortController = new AbortController();
    const signal = this.currentHalteOptionsAbortController.signal;

    let delijnHaltesData;
    try {
      delijnHaltesData = await fetchDelijnData(
        `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${searchQuery}?maxAantalHits=${this.searchResultLimit}`,
        { signal }
      );
    } catch (error) {
      if (error.name === "AbortError") return;
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
        if (signal.aborted) return; // <--- Early return before running `createHalteOption`
        const halte = results[i];
        await this.createHalteOption(halte, signal); // Pass signal down
        if (signal.aborted) return; // <--- In case abort happens during async call
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

  async createHalteOption(halte, signal) {
    if (signal.aborted) return;

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
      if (signal.aborted) return;

      const lijn = document.createElement("span");
      lijn.classList.add("lijnNumber", "halteLijnNumber");
      lijn.dataset.entiteitnummer = lijnrichting.entiteitnummer;
      lijn.dataset.lijnnummer = lijnrichting.lijnnummer;
      lijnenContainer.append(lijn);

      let individualLijnData;
      try {
        individualLijnData = await fetchDelijnData(
          `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}`,
          { signal }
        );
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Lijn data fetch error:", error);
        continue;
      }

      if (signal.aborted) return;

      if (lijnenArray.includes(individualLijnData.lijnnummerPubliek)) {
        lijn.remove();
        continue;
      }

      lijnenArray.push(individualLijnData.lijnnummerPubliek);
      lijn.innerText = individualLijnData.lijnnummerPubliek;

      let individualLijnDataColors;
      try {
        individualLijnDataColors = await fetchDelijnData(
          `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}/lijnkleuren`,
          { signal }
        );
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Lijn color fetch error:", error);
        continue;
      }

      if (signal.aborted) return;

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

    if (!signal.aborted) {
      this.elements.bottomContainer.appendChild(halteLijnCard);
    }
  }

  async choseThisHalte(halteElement) {
    this.currentHalteOptionsAbortController?.abort();
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
    previewElementIcon.style.marginBottom = "1rem";

    previewElement.appendChild(previewElementTitle);
    previewElement.appendChild(previewElementIcon);

    return previewElement;
  }
}

registerWidget(new DelijnWidget());
