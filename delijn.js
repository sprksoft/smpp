
async function fetchData() {
  const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a'; // Replace 'YOUR_API_KEY' with your actual API key
  const apiUrl = 'https://api.delijn.be/DLKernOpenData/api/v1/haltes/0/303095/real-time?maxAantalDoorkomsten=10'; // Replace with your API endpoint

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      }
    });

    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }

    const data = await response.json();
    console.log(data)
    console.log("creating application...")
    createApplication(data); // Call function to create the application using fetched data
  } catch (error) {
    console.error('Error fetching data:', error);
  }

}
function createApplication(data) {
  const leftContainer = document.getElementById('homepage__block--google');
  let doorkomstlength = data.halteDoorkomsten[0].doorkomsten.length
  const bestemmingen = []
  const lijnnummers = []
  const richting = []
  const dienstregelingTijdstip = []
  const real_timeTijdstip = []
  //let stringToInt = parseInt("06")
  for (let i = 0; i < doorkomstlength; i++) {
    bestemmingen.push(data.halteDoorkomsten[0].doorkomsten[i].bestemming)
  }
  for (let i = 0; i < doorkomstlength; i++) {
    lijnnummers.push(data.halteDoorkomsten[0].doorkomsten[i].lijnnummer)
  }
  for (let i = 0; i < doorkomstlength; i++) {
    if (data.halteDoorkomsten[0].doorkomsten[i].richting == "HEEN"){
      richting.push("naar")
    }else(
      richting.push("van")
    )

  }
  for (let i = 0; i < doorkomstlength; i++) {
    if (data.halteDoorkomsten[0].doorkomsten[i].dienstregelingTijdstip != undefined) {
      dienstregelingTijdstip.push(data.halteDoorkomsten[0].doorkomsten[i].dienstregelingTijdstip)
    } else {
      dienstregelingTijdstip.push("Geen dienstregelingtijd voor deze rit")
      console.log("geen dienstregelingtijd")
    }}
    for (let i = 0; i < doorkomstlength; i++) {
      if (data.halteDoorkomsten[0].doorkomsten[i]["real-timeTijdstip"] != undefined) {
        real_timeTijdstip.push(data.halteDoorkomsten[0].doorkomsten[i]["real-timeTijdstip"])
      } else {
        real_timeTijdstip.push("Geen Realtime-tijd voor deze rit")
        console.log("geen realtimeregelingtijd")
      }
    }
    console.log(bestemmingen);
    console.log(lijnnummers);
    console.log(richting);
    console.log(dienstregelingTijdstip);
    console.log(real_timeTijdstip);
    leftContainer.innerHTML = ` `;
    for (let i = 0; i < doorkomstlength; i++) {
      div = document.createElement("div");
      div.innerHTML = `<div class=lijncards><h2>${lijnnummers[i]}</h2><h3>${bestemmingen[i]}</h3><p>
      ${real_timeTijdstip[i]}
      </p></div>`
      leftContainer.appendChild(div);
    }
  }

// Call the fetchData function to initiate the API request and populate the application
fetchData();