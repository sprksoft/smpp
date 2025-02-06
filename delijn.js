async function fetchData(entiteit, halte) {
  const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a';
  const apiUrl = `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteit}/${halte}/real-time?maxAantalDoorkomsten=5`;

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    createApplication(data);
  } catch (error) {
    handleFetchError();
  }
}
async function fetchLijnData(entiteitnummer, lijnnummer) {
  const fetch_url = `https://api.delijn.be/DLKernOpenData/api/v1/lijnen/${entiteitnummer}/${lijnnummer}`;
  return await fetchApiData(fetch_url);
}

async function createApplication(data) {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  if (!leftContainerbottom) return;

  if (!data.halteDoorkomsten[0]) {
    leftContainerbottom.innerHTML = '<p class=lijninfo>There are no buses for this stop at the moment.</p>';
    return;
  }

  clearLeftbottom();

  const { doorkomsten } = data.halteDoorkomsten[0];

  for (const doorkomst of doorkomsten) {
    var { entiteitnummer, bestemming, lijnnummer, dienstregelingTijdstip } = doorkomst;
    perLijnData = await fetchLijnData(entiteitnummer, lijnnummer)
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
    div.innerHTML = `<div class=lijncards>
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
      </div>
    </div>`;

    leftContainerbottom.appendChild(div);
  }

  const lastdiv = document.createElement('div');
  if (Math.random() < 0.1) {
    lastdiv.innerHTML = `<div class=lastdiv><a href="https://www.coolblue.be/nl/koffiezetapparaten/koffiezetapparaten-voor-latte-macchiato?utm_source=bing&utm_medium=cpc&utm_content=search&cmt=c_b,cp_554669870,aid_1297424829986242,t_kwd-81089287897708:loc-14,n_o,d_c,lp_611&msclkid=1f7482f3ed5c1b56a37de72c7f194ba4" target="_blank">Latte?</a></div>`;
  } else {
    lastdiv.innerHTML = `<div class=lastdiv><a href="https://www.delijn.be/nl/contact/attest-aanvraag/" target="_blank">Late?</a></div>`;
  }
  leftContainerbottom.appendChild(lastdiv);
}

function handleFetchError() {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  if (!leftContainerbottom || leftContainerbottom.innerText === 'There are no buses for this stop at the moment.') {
    leftContainerbottom.innerHTML = '<p class=lijninfo>Could not fetch data, please try again later...</p>';
  }
}
const LijnApiKey = 'ddb68605719d4bb8b6444b6871cefc7a';

async function fetchApiData(url) {
  const response = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': LijnApiKey } });
  return await response.json();
}

async function fetchHaltesData(query) {
  const fetch_url = `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${query}?maxAantalHits=5`;
  const returnedData = await fetchApiData(fetch_url);
  clearLeftbottom();
  try {
    await Promise.all(returnedData.haltes.map((halte, i) => createOption(halte, i)));
  } catch (error) {
    document.getElementById('leftContainerbottom').innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Geen zoekresultaten</p></div>`
  }
  if (returnedData.haltes.length > 0) {
    getChoice(returnedData);
  } else {
    document.getElementById('leftContainerbottom').innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Geen zoekresultaten</p></div>`
  }
}

async function fetchOptionData(entiteitnummer, haltenummer) {
  const fetch_url = `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteitnummer}/${haltenummer}/lijnrichtingen`;
  return await fetchApiData(fetch_url);
}

async function createOption(givendata, i) {
  const leftContainerbottom = document.getElementById('leftContainerbottom');
  const div = document.createElement("div");
  leftContainerbottom.appendChild(div);

  const optionData = await fetchOptionData(givendata.entiteitnummer, givendata.haltenummer);
  const omschrijving = optionData.lijnrichtingen[0]?.omschrijving || "No info";

  div.innerHTML = `<div class="lijncards lijncardshover" id="lijncard${i}">
    <div class="top">
      <h3 class="no">${givendata.omschrijving}</h3>
    </div>
    <div class="times">
      <span class="time">${omschrijving}</span>
      <span class="intime"></span>
    </div>
  </div>`;
}

function clearLeftbottom() {
  document.getElementById('leftContainerbottom').innerHTML = "";
}

async function chosen(choice, data) {
  const lijnData = {
    entiteitnummer: data.haltes[choice].entiteitnummer,
    haltenummer: data.haltes[choice].haltenummer
  };
  localStorage.setItem("lijnData", JSON.stringify(lijnData));
  console.log(await browser.runtime.sendMessage({ action: 'setDelijnAppData', data: lijnData }));

  clearLeftbottom();
  document.getElementById('haltetext').value = "";

  let delijnData = await browser.runtime.sendMessage({
    action: 'fetchDelijnData', url:
      `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${data.haltes[choice].entiteitnummer}/${data.haltes[choice].haltenummer}/real-time?maxAantalDoorkomsten=5`
  });
  console.log(delijnData)
  if (delijnData){
    createApplication(delijnData)
  }else{handleFetchError()}
}

function getChoice(data) {
  for (let i = 0; i < 5; i++) {
    const option = document.getElementById(`lijncard${i}`);
    if (option) {
      option.addEventListener("click", async () => await chosen(i, data));
    }
  }
}

async function decodehalte() {
  const leftContainer = document.getElementById("delijncontainer");
  if (!leftContainer) return;

  leftContainer.innerHTML = `
    <div id="top_lijn_app">
      <h2 class="delijn_app_title">Zoek naar halte:</h2>
      <div class="textandbutton">
        <input class="popupinput" id="haltetext" type="text">
        <button type="submit" class="searchbutton" id="searchbutton">
          <svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16.0073 9.00364C16.0073 12.8716 12.8716 16.0073 9.00364 16.0073C5.13564 16.0073 2 12.8716 2 9.00364C2 
            5.13564 5.13564 2 9.00364 2C12.8716 2 16.0073 5.13564 16.0073 9.00364Z" class="stroke1" stroke-width="4"></path>
            <rect x="16.594" y="12.8062" width="11.8729" height="3.95764" rx="1.97882" transform="rotate(45 16.594 12.8062)" class="st1"></rect>
          </svg>
        </button>
      </div>
    </div>`;

  const searchbutton = document.getElementById('searchbutton');
  const leftContainerbottom = document.createElement("div");
  leftContainerbottom.innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Loading...</p></div>`;
  leftContainer.appendChild(leftContainerbottom);

  searchbutton.addEventListener("click", function () {
    const haltetext = document.getElementById("haltetext").value;
    fetchHaltesData(haltetext);
    if (document.getElementById("lijncard0")) {
      decodehalte();
    }
  });

  const input = document.getElementById("haltetext");

  input.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const haltetext = input.value;
      fetchHaltesData(haltetext);
      if (document.getElementById("lijncard0")) {
        decodehalte();
      }
    }
  });

  const lijnData = JSON.parse(localStorage.getItem("lijnData"));
  if (lijnData) {
    let delijnData = await browser.runtime.sendMessage({
      action: 'fetchDelijnData', url:
        `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${data.haltes[choice].entiteitnummer}/${data.haltes[choice].haltenummer}/real-time?maxAantalDoorkomsten=5`
    });
    console.log(delijnData)
    if (delijnData){
      createApplication(delijnData)
    }else{handleFetchError()}
  } else {
    leftContainerbottom.innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Zoek naar een halte aub.</p></div>`;
  }
}


