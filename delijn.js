
async function fetchData(halte) {
  const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a'; // Replace 'YOUR_API_KEY' with your actual API key


  const apiUrl =`https://api.delijn.be/DLKernOpenData/api/v1/haltes/0/${halte}/real-time?maxAantalDoorkomsten=5`; // Replace with your API endpoint

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
  const leftContainer = document.getElementById('leftcontainer');
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
        real_timeTijdstip.push("none")
        console.log("geen realtimeregelingtijd")
      }
    }
    console.log(bestemmingen);
    console.log(lijnnummers);
    console.log(richting);
    console.log(dienstregelingTijdstip);
    console.log(real_timeTijdstip);
    leftContainer.innerHTML=" "
    for (let i = 0; i < doorkomstlength; i++) {

      const date = new Date(dienstregelingTijdstip[i]);
      const currentdate = new Date();
      const currenthour = currentdate.getHours();
      const currentminute = currentdate.getMinutes();
      const hour = date.getHours();
      let minute = date.getMinutes();
      const totalMinutes = hour * 60 + minute;
      const totalMinutescurrent = currenthour * 60 + currentminute;


      if (real_timeTijdstip[i] != "none"){

        const realtimedate = new Date(real_timeTijdstip[i]);
    
        const hourrealtime  = realtimedate.getHours();
        let minuterealtime = realtimedate.getMinutes();
        const totalMinutesrealtime = hourrealtime * 60 + minuterealtime;
        let timeDifference = totalMinutesrealtime - totalMinutes;
        let timetilldep = totalMinutesrealtime - totalMinutescurrent;
        minute = minute.toString().padStart(2, '0');
if(timeDifference==0){
          timeDifference = "On time"
        }else if(timeDifference>0){
          timeDifference = "+"+timeDifference;
        }

        
        div = document.createElement("div");

        div.innerHTML = `<div class=lijncards>
        <div class="top">
        <h2 class=lijncardstitle>${lijnnummers[i]}</h2>
    <div class="topright">
        <h3 class=lijncardsdestin>${bestemmingen[i]}</h3>
        <p class="timedifference">${timeDifference}
        </p>
    </div>
        </div>

        <div class="times">
        <span class="time">
        ${hour}:${minute} </span>
        <span class="intime">${timetilldep} Min.
        </span>
        </div></div>`
        leftContainer.appendChild(div);
      }else{
        const timeDifference = "Vertrokken"
        minute = minute.toString().padStart(2, '0');
        div = document.createElement("div");
        div.innerHTML = `<div class=lijncards>
        <div class="top">
        <h2 class=lijncardstitle>${lijnnummers[i]}</h2><h3 class=lijncardsdestin>${bestemmingen[i]}</h3></div><span class="timedifference">
        </span><div class="times"><span class="time">${timeDifference}
        </span><span class="intime">Now
        </span></div></div>`
        leftContainer.appendChild(div);
      }
    }
    lastdiv = document.createElement("div");
    lastdiv.innerHTML = `<div class=lastdiv><a href="https://www.delijn.be/nl/contact/attest-aanvraag/" target="_blank">Late?</a></div>`
    leftContainer.appendChild(lastdiv);
  }

// Call the fetchData function to initiate the API request and populate the application
chrome.storage.local.get('current_id', function (store) {
  const halte = store.current_id;
  console.log("set halte to " + store.halte);
  if (halte != undefined){
    fetchData(halte);
  }

});
