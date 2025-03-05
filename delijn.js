async function displayLijnenPerHalte(data) {
  const delijnBottomApp = document.getElementById('delijnBottomApp');
  if (!delijnBottomApp) return;

  if (!data.halteDoorkomsten[0]) {
    delijnBottomApp.innerHTML = '<p class=lijninfo>Er zijn momenteel geen bussen beschikbaar voor deze stop.</p>';
    return;
  }

  clearDelijnBottomApp();

  const { doorkomsten } = data.halteDoorkomsten[0];

  for (const doorkomst of doorkomsten) {
    let { entiteitnummer, bestemming, lijnnummer, dienstregelingTijdstip } = doorkomst;
    let perLijnData = await browser.runtime.sendMessage({
      action: 'fetchDelijnData', url:
        `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`
    });
    lijnnummer = perLijnData.lijnnummerPubliek
    const real_timeTijdstip = doorkomst["real-timeTijdstip"]
    const date = new Date(dienstregelingTijdstip);
    const currentdate = new Date();
    const currenthour = currentdate.getHours();
    const currentminute = currentdate.getMinutes();
    const hour = date.getHours();
    let minute = date.getMinutes();

    const totalMinutes = hour * 60 + minute;
    const totalMinutescurrent = currenthour * 60 + currentminute;

    let timeDifference = 'No data';
    let timetilldep = totalMinutes - totalMinutescurrent;

    if (real_timeTijdstip != undefined) {
      const realtimedate = new Date(real_timeTijdstip);
      const hourrealtime = realtimedate.getHours();
      let minuterealtime = realtimedate.getMinutes();
      const totalMinutesrealtime = hourrealtime * 60 + minuterealtime;
      timeDifference = totalMinutesrealtime - totalMinutes;
      timetilldep = totalMinutesrealtime - totalMinutescurrent;
      if (timeDifference === 0) {
        timeDifference = 'On time';
      } else if (timeDifference > 0) {
        timeDifference = `+${timeDifference}`;
      }
    }
    if (timetilldep < -1000) {
      timetilldep += 1440;
    }
    minute = minute.toString().padStart(2, '0');

    const div = document.createElement('div');
    div.classList.add("lijncards")
    div.innerHTML = `
      <div class="top">
        <h2 class=lijncardstitle>${lijnnummer}</h2>
        <div class="topright">
          <h3 class=lijncardsdestin>${bestemming}</h3>
          <p class="timedifference">${timeDifference}</p>
        </div>
      </div>
      <div class="times">
        <span class="time">${hour}:${minute}</span>
        <span class="intime">${timetilldep} Min.</span>
      </div>`;

    delijnBottomApp.appendChild(div);
  }

  const lastdiv = document.createElement('div');
  if (Math.random() < 0.1) {
    lastdiv.innerHTML = `<div class=lastdiv><a href="https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato?utm_source=bing&utm_medium=cpc&utm_content=search&cmt=c_b,cp_554669870,aid_1297424829986242,t_kwd-81089287897708:loc-14,n_o,d_c,lp_611&msclkid=1f7482f3ed5c1b56a37de72c7f194ba4" target="_blank">Latte?</a></div>`;
  } else {
    lastdiv.innerHTML = `<div class=lastdiv><a href="https://www.delijn.be/nl/contact/attest-aanvraag/" target="_blank">Late?</a></div>`;
  }
  delijnBottomApp.appendChild(lastdiv);
}

function handleFetchError(code) {
  const delijnBottomApp = document.getElementById('delijnBottomApp');
  if (delijnBottomApp) {
    delijnBottomApp.innerHTML = `<p class=lijninfo>Delijn data kon niet opgehaald worden: Error ${code}, probeer later nog eens...</p>`;
  }
}

async function createHalteOptions(query) {
  const delijnHaltesData = await browser.runtime.sendMessage({
    action: 'fetchDelijnData', url:
      `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${query}?maxAantalHits=5`
  });
  clearDelijnBottomApp();
  try {
    await Promise.all(delijnHaltesData.haltes.map((halte, i) => createHalteOption(halte, i)));
  } catch (error) {
    document.getElementById('delijnBottomApp').innerHTML = `<p class=lijninfo>Er liep iets mis: ${error}</p>`
  }
  if (delijnHaltesData.haltes.length > 0) {
    getHalteChoice(delijnHaltesData);
  } else {
    document.getElementById('delijnBottomApp').innerHTML = `<p class=lijninfo>Geen zoekresultaten</p>`
  }
}

async function createHalteOption(delijnHalteData, i) {
  const delijnBottomApp = document.getElementById('delijnBottomApp');
  const div = document.createElement("div");
  const optionData = await browser.runtime.sendMessage({
    action: 'fetchDelijnData', url:
      `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${delijnHalteData.entiteitnummer}/${delijnHalteData.haltenummer}/lijnrichtingen`
  });
  const omschrijving = optionData.lijnrichtingen[0]?.omschrijving || "No info";
  div.classList.add("lijncards", "lijncardshover")
  div.id = `lijncard${i}`
  div.innerHTML = `
    <div class="top">
      <h3 class="no">${delijnHalteData.omschrijving}</h3>
    </div>
    <div class="times">
      <span class="time">${omschrijving}</span>
      <span class="intime"></span>
    </div>`;
  delijnBottomApp.appendChild(div);
}

function clearDelijnBottomApp() {
  document.getElementById('delijnBottomApp').innerHTML = "";
}

function getHalteChoice(data) {
  for (let i = 0; i < 5; i++) {
    const option = document.getElementById(`lijncard${i}`);
    if (option) {
      option.addEventListener("click", async () => {
        const delijnAppData = {
          entiteitnummer: data.haltes[i].entiteitnummer,
          haltenummer: data.haltes[i].haltenummer
        };
        await browser.runtime.sendMessage({ action: 'setDelijnAppData', data: delijnAppData });
        console.log(delijnAppData)
        clearDelijnBottomApp();
        document.getElementById('haltetext').value = "";
        let delijnData = await browser.runtime.sendMessage({
          action: 'fetchDelijnData', url:
            `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${data.haltes[i].entiteitnummer}/${data.haltes[i].haltenummer}/real-time?maxAantalDoorkomsten=5`
        });
        console.log(delijnData)
        if (!delijnData.code) {
          displayLijnenPerHalte(delijnData)
        } else { handleFetchError(delijnData.code) }
      });
    }
  }
}
async function migrateDelijnData() {
  await browser.runtime.sendMessage({ action: 'setDelijnAppData', data: JSON.parse(localStorage.getItem("lijnData")) });
  window.localStorage.removeItem("lijnData")
}
async function createDelijnApp() {
  const delijnContainer = document.getElementById("delijncontainer");
  if (!delijnContainer) return;

  delijnContainer.innerHTML = `
    <div id="top_lijn_app">
        <input class="popupinput" id="haltetext" spellcheck="false" type="text">
        <button type="submit" class="searchbutton" id="searchbutton">
          <svg width="25" height="25" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.0073 9.00364C16.0073 12.8716 12.8716 16.0073 9.00364 16.0073C5.13564 16.0073 2 12.8716 2 9.00364C2 
            5.13564 5.13564 2 9.00364 2C12.8716 2 16.0073 5.13564 16.0073 9.00364Z" class="stroke1" stroke-width="4"></path>
            <rect x="16.594" y="12.8062" width="11.8729" height="3.95764" rx="1.97882" transform="rotate(45 16.594 12.8062)" class="st5"></rect>
          </svg>
        </button>
    </div>`;

  const searchbutton = document.getElementById('searchbutton');
  const halteInput = document.getElementById("haltetext");
  const delijnBottomApp = document.createElement("div");
  delijnBottomApp.id = "delijnBottomApp"
  delijnBottomApp.innerHTML = `<p class=lijninfo>Loading...</p>`;
  delijnContainer.appendChild(delijnBottomApp);

  searchbutton.addEventListener("click", function () {
    if (halteInput.value) {
      createHalteOptions(halteInput.value);
    } else {
      delijnBottomApp.innerHTML = `<p class=lijninfo>Gelieve een halte te zoeken</p>`
    }
    if (document.getElementById("lijncard0")) {
      createDelijnApp();
    }
  });
  halteInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      if (halteInput.value) {
        createHalteOptions(halteInput.value);
      } else {
        delijnBottomApp.innerHTML = `<p class=lijninfo>Gelieve een halte te zoeken</p>`
      }
      if (document.getElementById("lijncard0")) {
        createDelijnApp();
      }
    }
  });

  if (window.localStorage.getItem("lijnData")) {
    await migrateDelijnData() // Data migration
  }

  const delijnAppData = await browser.runtime.sendMessage({
    action: 'getDelijnAppData'
  });
  if (delijnAppData.entiteitnummer != null) {
    let delijnData = await browser.runtime.sendMessage({
      action: 'fetchDelijnData', url:
        `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${delijnAppData.entiteitnummer}/${delijnAppData.haltenummer}/real-time?maxAantalDoorkomsten=5`
    });
    console.log(delijnData)
    if (!delijnData.code) {
      displayLijnenPerHalte(delijnData)
    } else { handleFetchError(delijnData.code) }
  } else {
    delijnBottomApp.innerHTML = `<p class=lijninfo>Zoek naar een halte aub.</p>`;
  }
}


