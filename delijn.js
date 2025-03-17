let delijnSearchResultLimit = 5;
let lijnDataKleuren;

// main functions
async function displayLijnenBasedOnHalte(entiteitnummer, haltenummer) {
    displayDelijnInfo("Loading...");
    let delijnData = await browser.runtime.sendMessage({
        action: 'fetchDelijnData',
        url: `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteitnummer}/${haltenummer}/real-time?maxAantalDoorkomsten=5`
    });
    if (!delijnData || !delijnData.halteDoorkomsten || delijnData.halteDoorkomsten.length === 0) {
        displayDelijnInfo('Er zijn momenteel geen bussen beschikbaar voor deze stop.');
        return;
    }
    const halteDoorkomst = delijnData.halteDoorkomsten[0];
    const doorkomsten = halteDoorkomst.doorkomsten;
    hideDelijnInfo()
    for (const doorkomst of doorkomsten) {
        await createHalteDoorkomst(doorkomst);
    }
    addDelijnAttest()
}

async function createHalteDoorkomst(doorkomst) {
    const entiteitnummer = doorkomst.entiteitnummer;
    const lijnnummer = doorkomst.lijnnummer;
    const destination = doorkomst.bestemming;

    const originalETA = new Date(doorkomst.dienstregelingTijdstip);
    let ETA = originalETA;
    let predictionStatuses = doorkomst.predictionStatussen
    let timeUntilDeparture
    let arrivalTimeDeviation

    const lijnCard = document.createElement('div');
    lijnCard.classList.add("lijnCard");

    if (predictionStatuses.includes("GESCHRAPT")) {
        lijnCard.classList.add("lijnCardCancelled")
        timeUntilDeparture = "Cancelled"
        arrivalTimeDeviation = ""
    } else if (predictionStatuses.includes("GEENREALTIME")) {
        lijnCard.classList.add("lijnCardNoData")
        timeUntilDeparture = calculateTimeUntilDeparture(ETA)
        if (timeUntilDeparture < 1) {
            timeUntilDeparture = "Now";
        } else {
            timeUntilDeparture = timeUntilDeparture + " Min.";
        }
        arrivalTimeDeviation = "No data"
    } else if (predictionStatuses.includes("REALTIME")) {
        ETA = new Date(doorkomst["real-timeTijdstip"]);

        arrivalTimeDeviation = ETA ? Math.round((ETA - originalETA) / 1000 / 60) : "No data";
        timeUntilDeparture = calculateTimeUntilDeparture(ETA);
        if (arrivalTimeDeviation === 0) {
            arrivalTimeDeviation = "On time";
        } else if (arrivalTimeDeviation > 0) {
            arrivalTimeDeviation = "+" + arrivalTimeDeviation;
        }
        if (timeUntilDeparture < 1) {
            timeUntilDeparture = "Now";
        } else {
            timeUntilDeparture = timeUntilDeparture + " Min.";
        }
    } else {
        console.error("Unknown predictionStatus")
    }

    const lijnCardTop = document.createElement('div');
    lijnCardTop.classList.add('lijnCardTop');

    const lijnNumberElement = document.createElement('span');
    lijnNumberElement.classList.add('lijnNumber');
    lijnNumberElement.textContent = lijnnummer;

    const lijnDestinationElement = document.createElement('span');
    lijnDestinationElement.classList.add('lijnDestination');
    if (destination.length > 17) {
        lijnDestinationElement.classList.add('lijnDestinationLongLong');
    } else if (destination.length > 15) {
        lijnDestinationElement.classList.add('lijnDestinationLong');
    }
    lijnDestinationElement.textContent = destination;

    lijnCardTop.appendChild(lijnNumberElement);
    lijnCardTop.appendChild(lijnDestinationElement);

    const arrivalTimeDeviationElement = document.createElement('span');
    arrivalTimeDeviationElement.classList.add('arrivalTimeDeviation');
    arrivalTimeDeviationElement.textContent = arrivalTimeDeviation;

    const lijnCardBottom = document.createElement('div');
    lijnCardBottom.classList.add('lijnCardBottom');

    const time = document.createElement('span');
    time.classList.add('time');
    time.textContent = `${ETA.getHours()}:${ETA.getMinutes().toString().padStart(2, '0')}`;

    const timeUntilDepartureElement = document.createElement('span');
    timeUntilDepartureElement.classList.add('timeUntilDeparture');
    timeUntilDepartureElement.textContent = timeUntilDeparture;

    lijnCardBottom.appendChild(time);
    lijnCardBottom.appendChild(timeUntilDepartureElement);

    lijnCard.appendChild(lijnCardTop);
    lijnCard.appendChild(arrivalTimeDeviationElement);
    lijnCard.appendChild(lijnCardBottom);

    document.getElementById("delijnBottomContainer").appendChild(lijnCard);

    updateLijnCardWithApiData(lijnNumberElement, entiteitnummer, lijnnummer);

    await delay(100);
}

async function updateLijnCardWithApiData(lijnNumberElement, entiteitnummer, lijnnummer) {
    try {
        const individualLijnData = await browser.runtime.sendMessage({
            action: 'fetchDelijnData',
            url: `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`
        });
        const publicLineNumber = individualLijnData.lijnnummerPubliek;
        lijnNumberElement.textContent = publicLineNumber;

        const individualLijnDataColors = await browser.runtime.sendMessage({
            action: 'fetchDelijnData',
            url: `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}/lijnkleuren`
        });

        const backgroundColor = getHexByCode(individualLijnDataColors.achtergrond.code);
        const borderColor = getHexByCode(individualLijnDataColors.achtergrondRand.code);
        const color = getHexByCode(individualLijnDataColors.voorgrond.code);

        lijnNumberElement.style.backgroundColor = backgroundColor;
        lijnNumberElement.style.borderColor = borderColor;
        lijnNumberElement.style.color = color;
    } catch (error) {
        console.error("Failed to fetch additional data for lijn card:", error);
    }
}

function addDelijnAttest() {
    const delijnBottomContainer = document.getElementById('delijnBottomContainer');
    let delijnAttestElement = document.createElement("a")
    delijnAttestElement.id = "delijnAttest"
    delijnAttestElement.target = "_blank"
    if (Math.random() < 0.1) {
        delijnAttestElement.href = "https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato"
        delijnAttestElement.innerText = "Latte?"
    } else {
        delijnAttestElement.href = "https://www.delijn.be/nl/contact/attest-aanvraag/"
        delijnAttestElement.innerText = "Late?"
    }
    delijnBottomContainer.appendChild(delijnAttestElement)
}

function addShowMoreHaltesButton() {
    const delijnBottomContainer = document.getElementById('delijnBottomContainer');
    const showMoreHaltesButton = document.createElement("button");
    showMoreHaltesButton.id = "showMoreHaltesButton"
    showMoreHaltesButton.innerText = "Toon meer"
    showMoreHaltesButton.addEventListener("click", showHalteOptions)
    delijnSearchResultLimit += 5
    delijnBottomContainer.appendChild(showMoreHaltesButton)
}

async function showHalteOptions() {
    let searchQuery = document.getElementById("halteInput").value
    document.getElementById("showMoreHaltesButton")?.remove();
    removeDelijnInfo()
    displayDelijnInfo("Loading...")
    if (!searchQuery) {
        displayDelijnInfo("Gelieve een halte te kiezen.")
        return;
    }
    const delijnHaltesData = await browser.runtime.sendMessage({
        action: 'fetchDelijnData', url:
            `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${searchQuery}?maxAantalHits=${delijnSearchResultLimit}`
    });
    if (delijnHaltesData?.aantalHits == 0) {
        displayDelijnInfo("Geen zoekresultaten")
        return;
    };
    let halteSleutels = "";
    delijnHaltesData.haltes.forEach(halte => {
        halteSleutels = halteSleutels + halte.entiteitnummer + "_" + halte.haltenummer + "_"
    });
    const delijnHaltesLijnrichtingenData = await browser.runtime.sendMessage({
        action: 'fetchDelijnData', url:
            `https://api.delijn.be/DLKernOpenData/api/v1/haltes/lijst/${halteSleutels}/lijnrichtingen`
    });
    delijnHaltesLijnrichtingenData.halteLijnrichtingen.forEach((halte, i) => {
        halte.halte.omschrijving = delijnHaltesData.haltes[i].omschrijving;
    });
    try {

        removeDelijnInfo()
        let i = 0
        for (const halte of delijnHaltesLijnrichtingenData.halteLijnrichtingen.slice(delijnSearchResultLimit - 5)) {
            await createHalteOption(halte, i + delijnSearchResultLimit - 5);
            i++;
        }

    } catch (error) {
        displayDelijnInfo("Er liep iets mis: ", error)
        console.error(error)
    }
    if (delijnHaltesData.aantalHits > delijnSearchResultLimit) {
        addShowMoreHaltesButton()
    }
    hideDelijnInfo()
}

async function createHalteOption(delijnHalteData, i) {
    const delijnBottomContainer = document.getElementById('delijnBottomContainer');
    const halteLijnCard = document.createElement("div");

    const richtingen = "Naar: " + delijnHalteData.lijnrichtingen.slice(0, 3).map(lijn => {
        const description = lijn.omschrijving.split("-");
        return (description[description.length - 1]);
    }).join(", ");

    halteLijnCard.setAttribute("entiteitnummer", delijnHalteData.halte.entiteitnummer);
    halteLijnCard.setAttribute("haltenummer", delijnHalteData.halte.haltenummer);
    halteLijnCard.classList.add("lijnCard", "lijnCardHalte");
    halteLijnCard.id = `lijncard${i}`;
    halteLijnCard.innerHTML = `
      <h3 class="halteTitle">${delijnHalteData.halte.omschrijving}</h3>
      <div class="halteDirections">${richtingen}</div>`;

    const lijnen = document.createElement("div");
    lijnen.classList.add("halteLijnen");
    delijnHalteData.lijnrichtingen.slice(0, 5).forEach(async function (lijnrichting) {
        const lijn = document.createElement("span");
        lijn.classList.add("lijnNumber", "halteLijnNumber");
        lijn.innerText = lijnrichting.lijnnummer
        lijnen.appendChild(lijn);
        let individualLijnData = await browser.runtime.sendMessage({
            action: 'fetchDelijnData', url:
                `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}`
        });
        let individualLijnDataColors = await browser.runtime.sendMessage({
            action: 'fetchDelijnData', url:
                `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${lijnrichting.entiteitnummer}/${lijnrichting.lijnnummer}/lijnkleuren`
        });
        let backgroundColor = getHexByCode(individualLijnDataColors.achtergrond.code)
        let borderColor = getHexByCode(individualLijnDataColors.achtergrondRand.code)
        let color = getHexByCode(individualLijnDataColors.voorgrond.code)
        lijn.innerText = individualLijnData.lijnnummerPubliek;
        lijn.style.backgroundColor = backgroundColor
        lijn.style.borderColor = borderColor
        lijn.style.color = color
    });

    halteLijnCard.append(lijnen);
    halteLijnCard.addEventListener("click", async function (e) {
        const delijnAppData = {
            entiteitnummer: this.getAttribute("entiteitnummer"),
            haltenummer: this.getAttribute("haltenummer")
        };
        await browser.runtime.sendMessage({ action: 'setDelijnAppData', data: delijnAppData });
        clearDelijnBottomContainer();
        await displayLijnenBasedOnHalte(this.getAttribute("entiteitnummer"), this.getAttribute("haltenummer"));
    });

    delijnBottomContainer.appendChild(halteLijnCard);
    if (document.body.classList.contains("enableAnimations")) await delay(50);
}

function initializeDelijnHTML() {
    const delijnContainer = document.getElementById("delijncontainer");
    let delijnTopContainer = document.createElement("div")
    delijnTopContainer.id = "delijnTopContainer"

    let delijnSearchField = document.createElement("input")
    delijnSearchField.id = "halteInput"
    delijnSearchField.spellcheck = false
    delijnSearchField.addEventListener("keyup", function (event) {
        if (event.key == "Enter") handleHalteSearch();
    });
    delijnTopContainer.appendChild(delijnSearchField)

    let delijnSearchButton = document.createElement("button")
    delijnSearchButton.id = "delijnSearchButton"
    delijnSearchButton.innerHTML = delijnSearchButtonSvg
    delijnSearchButton.addEventListener("click", handleHalteSearch);
    delijnTopContainer.appendChild(delijnSearchButton)

    let delijnBottomContainer = document.createElement("div")
    delijnBottomContainer.id = "delijnBottomContainer"

    delijnContainer.appendChild(delijnTopContainer)
    delijnContainer.appendChild(delijnBottomContainer)
    displayDelijnInfo("Loading...")
}

function handleHalteSearch() {
    let searchQuery = document.getElementById("halteInput").value
    delijnSearchResultLimit = 5
    clearDelijnBottomContainer()
    searchQuery ? showHalteOptions() : displayDelijnInfo("Gelieve een halte te kiezen.");
}

// small utils
function removeDelijnInfo() {
    let delijnInfoContainer = document.getElementById("delijnInfoContainer")
    delijnInfoContainer.remove()
}

function createDelijnInfo() {
    let delijnInfoContainer = document.createElement("div")
    delijnInfoContainer.id = "delijnInfoContainer"
    delijnInfoContainer.classList.add("delijnInfoContainerVisible")
    document.getElementById("delijnBottomContainer").appendChild(delijnInfoContainer)
}

function displayDelijnInfo(info) {
    let delijnInfoContainer = document.getElementById("delijnInfoContainer")
    if (!delijnInfoContainer) { createDelijnInfo(); delijnInfoContainer = document.getElementById("delijnInfoContainer") };
    if (info) delijnInfoContainer.innerText = info;
    delijnInfoContainer.classList.add("delijnInfoContainerVisible")
    delijnInfoContainer.classList.remove("delijnInfoContainerHidden")
}

function hideDelijnInfo() {
    let delijnInfoContainer = document.getElementById("delijnInfoContainer")
    if (!delijnInfoContainer) { createDelijnInfo(); delijnInfoContainer = document.getElementById("delijnInfoContainer") };
    delijnInfoContainer.classList.add("delijnInfoContainerHidden")
    delijnInfoContainer.classList.remove("delijnInfoContainerVisible")
}

function clearDelijnBottomContainer() {
    document.getElementById("delijnBottomContainer").innerHTML = ''
    displayDelijnInfo()
};

function calculateTimeUntilDeparture(ETA) {
    currentDate = new Date();
    return Math.round((ETA - currentDate) / 1000 / 60);
}

function getHexByCode(code) {
    const color = lijnDataKleuren.kleuren.find(color => color.code === code);
    return color ? "#" + color.hex : null;
}

async function migrateDelijnData() {
    await browser.runtime.sendMessage({ action: 'setDelijnAppData', data: JSON.parse(localStorage.getItem("lijnData")) });
    window.localStorage.removeItem("lijnData")
}

// main func
async function createDelijnApp() {
    initializeDelijnHTML();
    if (window.localStorage.getItem("lijnData")) {
        await migrateDelijnData() // Data migration
    }

    const delijnAppData = await browser.runtime.sendMessage({
        action: 'getDelijnAppData'
    });
    lijnDataKleuren = await browser.runtime.sendMessage({
        action: 'getDelijnColorData',
    });
    if (delijnAppData.entiteitnummer == null) {
        displayDelijnInfo("Zoek naar een halte aub.");
    } else {
        await displayLijnenBasedOnHalte(delijnAppData.entiteitnummer, delijnAppData.haltenummer)
    }
}
