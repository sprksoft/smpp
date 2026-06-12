import { WidgetBase, registerWidget } from "./widgets.js";
import { browser } from "../common/utils.js";
import { searchButtonSvg, loadingSpinnerSvg } from "../fixes-utils/svgs.js";

let stationSearchCache: any[] | null = null;

async function fetchIRailData(url: string): Promise<any> {
  return await browser.runtime.sendMessage({
    action: "fetchIRailData",
    url: url,
  });
}

function normalizeText(text: string): string {
  return (text || "").toLowerCase();
}

function formatTime(timestampSeconds: number): string {
  const date = new Date(timestampSeconds * 1000);
  return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function formatDelay(delaySeconds: unknown, canceled: unknown): string {
  const canceledFlag = canceled === "1" || canceled === 1 || canceled === true;
  if (canceledFlag) {
    return "Geannuleerd";
  }
  const delayValue = Number(delaySeconds) || 0;
  if (delayValue === 0) {
    return "Op tijd";
  }
  const minutes = Math.round(delayValue / 60);
  return minutes === 0 ? "+1 min" : `+${minutes} min`;
}

type StopInfo = {
  station: string;
  time?: number;
  platform?: string;
};

function getSearchableStationName(station: any): string {
  return [station.standardname, station.name, station.id].join(" ").toLowerCase();
}

function normalizeStopData(rawStop: any): StopInfo {
  const stop: StopInfo = {
    station:
      rawStop.stationinfo?.standardname || rawStop.stationinfo?.name || rawStop.station || String(rawStop),
  };

  if (rawStop.time) {
    stop.time = Number(rawStop.time);
  }
  const platformValue = rawStop.platform || rawStop.platforminfo?.name;
  if (platformValue) {
    stop.platform = platformValue;
  }

  return stop;
}

function normalizeDepartureStops(departure: any): StopInfo[] {
  if (Array.isArray(departure.via)) {
    return departure.via.map(normalizeStopData);
  }
  if (typeof departure.via === "string") {
    return departure.via
      .split(/\s*,\s*/)
      .filter(Boolean)
      .map((station: string) => ({ station }));
  }
  if (Array.isArray(departure.stops)) {
    return departure.stops.map(normalizeStopData);
  }
  if (Array.isArray(departure.stop)) {
    return departure.stop.map(normalizeStopData);
  }
  return [];
}

function extractOccupancyText(rawOccupancy: any): string | null {
  if (rawOccupancy == null || rawOccupancy === "") {
    return null;
  }

  if (typeof rawOccupancy === "string" || typeof rawOccupancy === "number") {
    return String(rawOccupancy).trim();
  }

  if (Array.isArray(rawOccupancy)) {
    for (const item of rawOccupancy) {
      const extracted = extractOccupancyText(item);
      if (extracted) {
        return extracted;
      }
    }
    return null;
  }

  if (typeof rawOccupancy === "object") {
    const candidateFields = [
      rawOccupancy.text,
      rawOccupancy.label,
      rawOccupancy.value,
      rawOccupancy.description,
      rawOccupancy.crowdingDescription,
      rawOccupancy.name,
      rawOccupancy.type,
      rawOccupancy.level,
      rawOccupancy.occupancy,
    ];
    for (const candidate of candidateFields) {
      const extracted = extractOccupancyText(candidate);
      if (extracted) {
        return extracted;
      }
    }

    return Object.values(rawOccupancy)
      .map(extractOccupancyText)
      .filter(Boolean)
      .join(" ")
      .trim() || null;
  }

  return null;
}

function getOccupancyLabel(departure: any): { label: string; className: string } | null {
  const rawOccupancy = departure.occupancy ?? departure.occupancylevel ?? departure.passengerlevel ?? departure.crowdingsummary;
  const occupancyText = extractOccupancyText(rawOccupancy);
  if (!occupancyText) {
    return null;
  }

  const normalized = occupancyText.toLowerCase();
  const percentageMatch = normalized.match(/(\d{1,3})\s*%/);
  if (percentageMatch) {
    const percentage = Number(percentageMatch[1]);
    if (percentage >= 75) {
      return { label: "heel druk", className: "occupancy-high" };
    }
    if (percentage >= 40) {
      return { label: "druk", className: "occupancy-medium" };
    }
    return { label: "rustig", className: "occupancy-low" };
  }

  if (/(high|druk|vol|gevuld|zwaar|drukke|drukker|3|4|5)/.test(normalized)) {
    return { label: "heel druk", className: "occupancy-high" };
  }
  if (/(medium|moderat|matig|normaal|gemiddeld|druk|2)/.test(normalized)) {
    return { label: "druk", className: "occupancy-medium" };
  }
  if (/(low|rustig|weinig|leeg|1)/.test(normalized)) {
    return { label: "rustig", className: "occupancy-low" };
  }

  return null;
}

async function getVehicleStops(vehicleId: string, timestampSeconds?: number, signal?: AbortSignal): Promise<StopInfo[]> {
  if (!vehicleId) {
    return [];
  }

  const date = timestampSeconds ? new Date(timestampSeconds * 1000) : new Date();
  const dateString = `${date.getDate().toString().padStart(2, "0")}${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}${date.getFullYear().toString().slice(-2)}`;

  const vehicleData = await fetchIRailData(
    `https://api.irail.be/v1/vehicle/?id=${encodeURIComponent(
      vehicleId
    )}&date=${dateString}&format=json&lang=nl&alerts=false`
  );
  if (signal?.aborted) {
    return [];
  }

  let stops = vehicleData?.stops?.stop;
  if (!stops) {
    return [];
  }

  if (!Array.isArray(stops)) {
    stops = [stops];
  }

  return stops.map(normalizeStopData).filter((stop: StopInfo) => Boolean(stop.station));
}

async function getStationList(): Promise<any[]> {
  if (stationSearchCache) {
    return stationSearchCache;
  }
  const stationsData = await fetchIRailData(
    "https://api.irail.be/v1/stations/?format=json&lang=nl"
  );
  const stationField = stationsData?.station;
  if (!stationField) {
    return [];
  }
  stationSearchCache = Array.isArray(stationField) ? stationField : [stationField];
  return stationSearchCache;
}

async function createDepartureCard(
  departure: any,
  container: HTMLElement,
  signal?: AbortSignal
): Promise<void> {
  if (signal?.aborted) return;

  const trainNumber =
    departure.vehicleinfo?.shortname || departure.vehicle || "Onbekend";
  const destination = departure.direction?.name || departure.station || "-";
  // platform from iRail (fallbacks)
  const platform =
    departure.platform || departure.platforminfo?.name || departure.platforminfo || "-";
  const departureTime = formatTime(departure.time || 0);
  const delayText = formatDelay(departure.delay, departure.canceled);

  const card = document.createElement("div");
  card.classList.add("trainCard");

  // Add delay status class for styling
  const canceledFlag = departure.canceled === "1" || departure.canceled === 1 || departure.canceled === true;
  if (canceledFlag) {
    card.classList.add("trainCancelled");
  } else if ((departure.delay || 0) <= 0) {
    card.classList.add("trainOnTime");
  } else {
    card.classList.add("trainLate");
  }

  const cardTop = document.createElement("div");
  cardTop.classList.add("trainCardTop");

  const leftBlock = document.createElement("div");
  leftBlock.classList.add("trainCardLeft");

  const platformElement = document.createElement("span");
  platformElement.classList.add("platformNumber");
  platformElement.textContent = platform;
  leftBlock.appendChild(platformElement);

  const centerBlock = document.createElement("div");
  centerBlock.classList.add("trainCardCenter");

  const trainType = departure.vehicleinfo?.type || String(trainNumber).split(" ")[0] || "?";
  const trainTypeLabel = document.createElement("span");
  trainTypeLabel.classList.add("trainTypeLabel");
  trainTypeLabel.textContent = trainType;

  const trainDestinationElement = document.createElement("span");
  trainDestinationElement.classList.add("trainDestination");
  trainDestinationElement.textContent = destination;

  centerBlock.appendChild(trainTypeLabel);
  centerBlock.appendChild(trainDestinationElement);

  const rightBlock = document.createElement("div");
  rightBlock.classList.add("trainCardRight");

  const timeElement = document.createElement("span");
  timeElement.classList.add("time");
  timeElement.textContent = departureTime;

  const statusLabel = document.createElement("span");
  statusLabel.classList.add("statusLabel");
  statusLabel.textContent = delayText;

  rightBlock.appendChild(timeElement);
  rightBlock.appendChild(statusLabel);

  cardTop.appendChild(leftBlock);
  cardTop.appendChild(centerBlock);
  cardTop.appendChild(rightBlock);

  const cardBottom = document.createElement("div");
  cardBottom.classList.add("trainCardBottom");

  const platformLabel = document.createElement("span");
  platformLabel.classList.add("platformLabel");
  platformLabel.textContent = platform === "-" ? "" : `Spoor ${platform}`;
  cardBottom.appendChild(platformLabel);

  const occupancyInfo = getOccupancyLabel(departure);
  if (occupancyInfo) {
    const occupancyBox = document.createElement("span");
    occupancyBox.classList.add("occupancy-box", occupancyInfo.className);
    occupancyBox.textContent = occupancyInfo.label;
    cardBottom.appendChild(occupancyBox);
  }

  // optional route preview (dropdown-style stop list)
  const routePreview = document.createElement("div");
  routePreview.classList.add("routePreview");

  let stops: StopInfo[] = normalizeDepartureStops(departure);
  const routeStops = document.createElement("div");
  routeStops.classList.add("routeStops");

  let routeLoaded = stops.length > 0;
  let canFetchVehicleStops = !routeLoaded && Boolean(departure.vehicle || departure.vehicleinfo?.name);
  let isLoadingRoute = false;

  const renderStopList = (stopItems: StopInfo[]) => {
    routeStops.innerHTML = "";
    stopItems.forEach((stop, index) => {
      const item = document.createElement("div");
      item.classList.add("routeStopItem");
      if (index === 0) {
        item.classList.add("routeStopFirst");
      }
      if (index === stopItems.length - 1) {
        item.classList.add("routeStopLast");
      }

      const leftDetails = document.createElement("div");
      leftDetails.classList.add("routeStopLeft");

      const stationName = document.createElement("span");
      stationName.classList.add("routeStopStation");
      stationName.textContent = stop.station;
      leftDetails.appendChild(stationName);

      if (stop.time) {
        const stopTime = document.createElement("span");
        stopTime.classList.add("routeStopTime");
        stopTime.textContent = formatTime(stop.time);
        leftDetails.appendChild(stopTime);
      }

      const rightDetails = document.createElement("div");
      rightDetails.classList.add("routeStopRight");
      if (stop.platform) {
        const platformLabel = document.createElement("span");
        platformLabel.classList.add("routeStopPlatform");
        platformLabel.textContent = `Spoor ${stop.platform}`;
        rightDetails.appendChild(platformLabel);
      }

      item.appendChild(leftDetails);
      item.appendChild(rightDetails);
      routeStops.appendChild(item);
    });

    routePreview.appendChild(routeStops);
  };

  const setExpanded = (expanded: boolean) => {
    card.classList.toggle("expanded", expanded);
  };

  const loadVehicleStops = async () => {
    if (!canFetchVehicleStops || routeLoaded || signal?.aborted || isLoadingRoute) {
      return;
    }

    const vehicleId = departure.vehicle || departure.vehicleinfo?.name || departure.vehicleinfo?.shortname;
    if (!vehicleId) {
      canFetchVehicleStops = false;
      return;
    }

    isLoadingRoute = true;
    routePreview.textContent = "Laden...";

    const fetchedStops = await getVehicleStops(vehicleId, Number(departure.time), signal);
    isLoadingRoute = false;

    if (signal?.aborted) {
      return;
    }

    if (!fetchedStops.length) {
      canFetchVehicleStops = false;
      card.classList.remove("trainCardExpandable");
      if (routePreview.parentElement === card) {
        routePreview.remove();
      }
      return;
    }

    stops = fetchedStops;
    renderStopList(stops);
    routeLoaded = true;
  };

  const toggleStops = async () => {
    if (!routeLoaded && canFetchVehicleStops) {
      await loadVehicleStops();
    }

    if (!routeLoaded) {
      return;
    }

    setExpanded(!card.classList.contains("expanded"));
  };

  if (routeLoaded || canFetchVehicleStops) {
    if (routeLoaded) {
      renderStopList(stops);
    }

    card.classList.add("trainCardExpandable");
    card.addEventListener("click", () => toggleStops());
  }

  card.appendChild(cardTop);
  card.appendChild(cardBottom);

  if (routeLoaded || canFetchVehicleStops) {
    card.appendChild(routePreview);
  }

  if (signal?.aborted) return;
  container.appendChild(card);
}

class NmbsWidget extends WidgetBase {
  searchResultLimit: number;
  currentStationSearchAbortController: AbortController | null;
  currentLiveboardAbortController: AbortController | null;
  displayedTrainCount: number;
  cachedDepartures: any[];
  searchDebounceTimer: NodeJS.Timeout | null;
  lastLiveboardFetchTime: number;
  readonly minLiveboardFetchInterval: number = 5000; // 5 seconden minimum tussen zoekopdrachten anders kunnen wee een ban krijgen
  elements: {
    topContainer: HTMLElement | null;
    searchInput: HTMLInputElement | null;
    searchButton: HTMLButtonElement | null;
    bottomContainer: HTMLElement | null;
    infoContainer: HTMLElement | null;
  };
  container: HTMLElement | null;

  constructor() {
    super();
    this.searchResultLimit = 5;
    this.displayedTrainCount = 5;
    this.cachedDepartures = [];
    this.currentStationSearchAbortController = null;
    this.currentLiveboardAbortController = null;
    this.searchDebounceTimer = null;
    this.lastLiveboardFetchTime = 0;
    this.elements = {
      topContainer: null,
      searchInput: null,
      searchButton: null,
      bottomContainer: null,
      infoContainer: null,
    };
    this.container = null;
  }

  override get category(): string {
    return "other";
  }

  override defaultSettings() {
    return {
      maxTrains: 5,
      station: { id: null, standardname: "", name: "" },
    };
  }

  override async createContent(): Promise<HTMLElement> {
    this.element.classList.add("smpp-widget-transparent");
    this.container = document.createElement("div");
    this.initializeHTML();
    this.initializeData();
    return this.container!;
  }

  override async onSettingsChange() {
    if (this.currentLiveboardAbortController) {
      this.currentLiveboardAbortController.abort();
    }
    this.initializeData();
  }

  initializeHTML() {
    this.container!.id = "nmbsContainer";

    this.elements.topContainer = document.createElement("div");
    this.elements.topContainer!.id = "nmbsTopContainer";

    this.elements.searchInput = document.createElement("input");
    this.elements.searchInput!.classList.add("popupinput", "stationInput");
    this.elements.searchInput!.spellcheck = false;
    this.elements.searchInput!.placeholder = "Zoek station";
    this.elements.searchInput!.addEventListener("keyup", (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        this.handleStationSearch();
      } else {
        this.debouncedSearch();
      }
    });

    this.elements.searchButton = document.createElement("button");
    this.elements.searchButton!.classList.add("nmbsSearchButton");
    this.elements.searchButton!.innerHTML = searchButtonSvg;
    this.elements.searchButton!.addEventListener("click", () =>
      this.handleStationSearch()
    );

    this.elements.bottomContainer = document.createElement("div");
    this.elements.bottomContainer!.id = "nmbsBottomContainer";

    this.elements.topContainer!.appendChild(this.elements.searchInput!);
    this.elements.topContainer!.appendChild(this.elements.searchButton!);
    this.container!.appendChild(this.elements.topContainer!);
    this.container!.appendChild(this.elements.bottomContainer!);

    this.displayInfo("Bezig met laden...");
  }

  async displayDepartures() {
    // Rate limiting: zo da ze niet vaker dan 1 keer per 5 seconden de liveboard API aanroepen, anders kunnen we een ban krijgen van iRail. We checken dit voordat we een nieuwe fetch doen, en als het te vroeg is, doen we niks.
    const now = Date.now();
    if (now - this.lastLiveboardFetchTime < this.minLiveboardFetchInterval) {
      return;
    }
    this.lastLiveboardFetchTime = now;

    if (this.currentLiveboardAbortController) {
      this.currentLiveboardAbortController.abort();
    }
    this.currentLiveboardAbortController = new AbortController();
    const signal = this.currentLiveboardAbortController.signal;

    this.displayInfo("Bezig met laden...");
    this.clearBottomContainer();

    const stationId = this.settings.station?.id;
    if (!stationId) {
      this.displayInfo("Kies een station om vertrektijden te zien.");
      return;
    }

    let liveboardData;
    try {
      liveboardData = await fetchIRailData(
        `https://api.irail.be/v1/liveboard/?id=${encodeURIComponent(
          stationId
        )}&format=json&lang=nl&arrdep=departure&alerts=false`
      );
    } catch (error: any) {
      if (error?.name === "AbortError") {
        return;
      }
      this.displayInfo("Er liep iets mis: " + error);
      console.error(error);
      return;
    }

    if (signal.aborted) return;

    if (liveboardData?.exception) {
      this.displayInfo("Er liep iets mis: " + (liveboardData.message || "Fout bij liveboard"));
      return;
    }

    let departures = liveboardData?.departures?.departure || [];
    if (!Array.isArray(departures)) {
      departures = [departures];
    }

    if (!departures.length) {
      this.displayInfo("Er zijn momenteel geen vertrekkende treinen.");
      return;
    }

    this.hideInfo();
    departures.sort((a: any, b: any) => (a.time || 0) - (b.time || 0));
    this.cachedDepartures = departures;
    this.displayedTrainCount = 5;

    await this.renderTrains(signal);
  }

  async renderTrains(signal?: AbortSignal) {
    for (const departure of this.cachedDepartures.slice(0, this.displayedTrainCount)) {
      if (signal?.aborted) return;
      await createDepartureCard(departure, this.elements.bottomContainer!, signal);
      if (signal?.aborted) return;
    }

    if (this.displayedTrainCount > 5) {
      this.addShowLessTrainsButton();
    }

    if (this.cachedDepartures.length > this.displayedTrainCount) {
      this.addShowMoreTrainsButton();
    }
  }

  addShowMoreTrainsButton() {
    const showMoreButton = document.createElement("button");
    showMoreButton.classList.add("showMoreTrainsButton");
    showMoreButton.innerText = "Meer";
    showMoreButton.addEventListener("click", () => {
      this.displayedTrainCount += 5;
      this.elements.bottomContainer!.innerHTML = "";
      this.renderTrains();
    });
    this.elements.bottomContainer!.appendChild(showMoreButton);
  }

  addShowLessTrainsButton() {
    const showLessButton = document.createElement("button");
    showLessButton.classList.add("showLessTrainsButton");
    showLessButton.innerText = "Minder";
    showLessButton.addEventListener("click", () => {
      this.displayedTrainCount = 5;
      this.elements.bottomContainer!.innerHTML = "";
      this.renderTrains();
    });
    this.elements.bottomContainer!.appendChild(showLessButton);
  }

  async initializeData() {
    if (!this.settings.station?.id) {
      this.displayInfo("Zoek een station");
    } else {
      await this.displayDepartures();
    }
  }

  setLoadingState(isLoading: boolean) {
    if (isLoading) {
      this.elements.searchButton!.innerHTML = loadingSpinnerSvg;
      this.elements.searchButton!.disabled = true;
      this.elements.searchButton!.classList.add("loading");
    } else {
      this.elements.searchButton!.innerHTML = searchButtonSvg;
      this.elements.searchButton!.disabled = false;
      this.elements.searchButton!.classList.remove("loading");
    }
  }

  debouncedSearch() {
    // Clear existing debounce timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    // Set new debounce timer (500ms delay)
    this.searchDebounceTimer = setTimeout(() => {
      this.handleStationSearch();
    }, 500);
  }

  async handleStationSearch() {
    const searchQuery = this.elements.searchInput!.value.trim();
    this.searchResultLimit = 5;
    this.clearBottomContainer();

    if (!searchQuery) {
      this.displayInfo("Gelieve een station te kiezen.");
      return;
    }

    this.setLoadingState(true);
    await this.showStationOptions(searchQuery);
    this.setLoadingState(false);
  }

  async showStationOptions(searchQuery: string) {
    if (this.currentStationSearchAbortController) {
      this.currentStationSearchAbortController.abort();
    }

    this.currentStationSearchAbortController = new AbortController();
    const signal = this.currentStationSearchAbortController.signal;

    let stations;
    try {
      const allStations = await getStationList();
      if (signal.aborted) return;
      const query = normalizeText(searchQuery);
      stations = allStations.filter((station) =>
        getSearchableStationName(station).includes(query)
      );
    } catch (error) {
      if ((error as any)?.name === "AbortError") return;
      this.displayInfo("Er liep iets mis: " + error);
      return;
    }

    if (!stations.length) {
      this.displayInfo("Geen zoekresultaten");
      return;
    }

    this.hideInfo();
    const results = stations.slice(0, this.searchResultLimit);
    for (const station of results) {
      if (signal.aborted) return;
      this.createStationOption(station, signal);
      if (signal.aborted) return;
    }

    if (stations.length > this.searchResultLimit) {
      this.addShowMoreStationsButton();
    }
  }

  createStationOption(station: any, signal: AbortSignal) {
    if (signal.aborted) return;

    const stationCard = document.createElement("div");
    stationCard.dataset["stationId"] = station.id;
    stationCard.dataset["stationStandardname"] = station.standardname;
    stationCard.dataset["stationName"] = station.name;
    stationCard.classList.add("trainCard", "trainCardStation");

    const title = document.createElement("h3");
    title.classList.add("stationTitle");
    title.textContent = station.standardname;

    const detail = document.createElement("div");
    detail.classList.add("stationDetail");
    detail.textContent = `${station.name} • ${station.id.replace("BE.NMBS.", "")}`;

    stationCard.appendChild(title);
    stationCard.appendChild(detail);

    stationCard.addEventListener("click", (event: MouseEvent) => {
      this.choseThisStation(event.currentTarget as HTMLElement);
    });

    if (signal.aborted) return;
    this.elements.bottomContainer!.appendChild(stationCard);
  }

  async choseThisStation(stationElement: HTMLElement) {
    this.currentStationSearchAbortController?.abort();
    await this.setSetting("station", {
      id: stationElement.dataset["stationId"],
      standardname: stationElement.dataset["stationStandardname"],
      name: stationElement.dataset["stationName"],
    });
  }

  addShowMoreStationsButton() {
    const showMoreButton = document.createElement("button");
    showMoreButton.classList.add("showMoreStationsButton");
    showMoreButton.innerText = "Toon meer";
    showMoreButton.addEventListener("click", () => {
      this.searchResultLimit += 5;
      showMoreButton.remove();
      this.setLoadingState(true);
      this.showStationOptions(this.elements.searchInput!.value).finally(() => {
        this.setLoadingState(false);
      });
    });
    this.elements.bottomContainer!.appendChild(showMoreButton);
  }

  createInfoElement() {
    if (!this.elements.infoContainer) {
      this.elements.infoContainer = document.createElement("div");
      this.elements.infoContainer.classList.add(
        "nmbsInfoContainer",
        "nmbsInfoContainerVisible"
      );
      this.elements.bottomContainer!.appendChild(this.elements.infoContainer!);
    }
    return this.elements.infoContainer;
  }

  displayInfo(info: string) {
    const infoContainer = this.createInfoElement();
    if (info) infoContainer.innerText = info;
    infoContainer.classList.add("nmbsInfoContainerVisible");
    infoContainer.classList.remove("nmbsInfoContainerHidden");
  }

  hideInfo() {
    const infoContainer = this.createInfoElement();
    infoContainer.classList.add("nmbsInfoContainerHidden");
    infoContainer.classList.remove("nmbsInfoContainerVisible");
  }

  clearBottomContainer() {
    this.elements.bottomContainer!.innerHTML = "";
    this.elements.bottomContainer!.appendChild(this.elements.infoContainer!);
    this.displayInfo("");
  }

  override async createPreview(): Promise<HTMLElement> {
    const previewElement = document.createElement("div");

    const previewElementTitle = document.createElement("div");
    previewElementTitle.classList.add("nmbs-preview-title");
    previewElementTitle.innerText = "NMBS";

    const previewElementIcon = document.createElement("div");
    previewElementIcon.classList.add("nmbs-icon-128-container");
    previewElementIcon.style.marginBottom = "1rem";
    previewElementIcon.innerHTML = "<div style='font-size:5rem;margin:auto;'>🚆</div>";

    previewElement.appendChild(previewElementTitle);
    previewElement.appendChild(previewElementIcon);

    return previewElement;
  }
}

registerWidget(new NmbsWidget());
