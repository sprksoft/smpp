const LijnApiKey = 'ddb68605719d4bb8b6444b6871cefc7a';

async function fetchApiData(url) {
    const response = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': LijnApiKey } });
    return await response.json();
}

async function fetchHaltesData(query) {
  const fetch_url = `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${query}?maxAantalHits=5`;
  const returnedData = await fetchApiData(fetch_url);
  clearLeftbottom();
  try{
    await Promise.all(returnedData.haltes.map((halte, i) => createOption(halte, i)));
  } catch (error) {
    document.getElementById('leftContainerbottom').innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Geen zoekresultaten</p></div>`
  }
  if (returnedData.haltes.length > 0) {
  getchoice(returnedData);
}else{
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

function chosen(choice, data) {
  const lijnData = {
    entiteitnummer: data.haltes[choice].entiteitnummer,
    haltenummer: data.haltes[choice].haltenummer
  };
  localStorage.setItem("lijnData", JSON.stringify(lijnData));
  clearLeftbottom();
  document.getElementById('haltetext').value = "";
  fetchData(data.haltes[choice].entiteitnummer, data.haltes[choice].haltenummer);
}

function getchoice(data) {
  for (let i = 0; i < 5; i++) {
    const option = document.getElementById(`lijncard${i}`);
    if (option) {
      option.addEventListener("click", () => chosen(i, data));
    }
  }
}

function decodehalte() {
  const leftContainer = document.getElementById("leftcontainer");
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
    fetchData(lijnData.entiteitnummer, lijnData.haltenummer);
  } else {
    leftContainerbottom.innerHTML = `<div id="leftContainerbottom"><p class=lijninfo>Zoek naar een halte aub.</p></div>`;
  }
}


