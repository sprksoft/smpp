async function fetchHaltesData(query){
    const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a'
    const fetch_url = `https://api.delijn.be/DLZoekOpenData/v1/zoek/haltes/${query}?maxAantalHits=3`

    console.log(query)
    // Add the await keyword before fetch
    const response = await fetch(fetch_url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        }
      });
      // Now you can call the json method on the response object
      returned_data = await response.json()
      await showchoices(returned_data)
}
async function fetchOptionData(entiteitnummer, haltenummer){
    const apiKey = 'ddb68605719d4bb8b6444b6871cefc7a'
    const fetch_url = `https://api.delijn.be/DLKernOpenData/api/v1/haltes/${entiteitnummer}/${haltenummer}/lijnrichtingen`
    // Add the await keyword before fetch
    const response = await fetch(fetch_url, {
        headers: {
          'Ocp-Apim-Subscription-Key': apiKey,
        }
      });
      // Now you can call the json method on the response object
      returned_data =  await response.json()
      return returned_data
}
async function createOption(givendata,i){
    optionData = await fetchOptionData(givendata.entiteitnummer, givendata.haltenummer)
    console.log(optionData)
    console.log(givendata)
    const leftContainer = document.getElementById('leftcontainer');
    let leftContainerbottom = document.createElement('div')
    leftContainer.appendChild(leftContainerbottom);
    div = document.createElement("div");
    div.innerHTML = `<div class=lijncards id="lijncard${i}">
      <div class="top">

      <h3 class="no">${givendata.omschrijving}</h3>
  
      </div>

      <div class="times">
      <span class="time">
      </span>
      <span class="intime">
      </span>
      </div></div>`
    leftContainerbottom.innerHTML = `<div id="leftContainerbottom"></div>`
    leftContainerbottom.appendChild(div);

}
async function showchoices(returned_data){

    let mogelijke_haltes = returned_data.haltes
    document.getElementById('leftcontainer')
    for (let i = 0; i < mogelijke_haltes.length; i++){
        await createOption(returned_data.haltes[i],i)
    }
}

function getchoice(option){ 
    
}
function decodehalte(){
    leftContainer = document.getElementById("leftcontainer")
    leftContainer.innerHTML = " "
    leftContainer.innerHTML = `<h2 class="delijn_app_title">Zoek naar halte:</h2><div class="textandbutton">
    <input class="popupinput" id="haltetext" type="text"></input><button type="submit" class="searchbutton"id="searchbutton">
    <svg width="20" height="20" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M16.0073 9.00364C16.0073 12.8716 12.8716 16.0073 9.00364 16.0073C5.13564 16.0073 2 12.8716 2 9.00364C2 
    5.13564 5.13564 2 9.00364 2C12.8716 2 16.0073 5.13564 16.0073 9.00364Z" stroke="#fff" stroke-width="4">
    </path><rect x="16.594" y="12.8062" width="11.8729" height="3.95764" rx="1.97882" transform="rotate(45 16.594 12.8062)" fill="#fff">
    </rect></svg></button></div>
    `
    searchbutton = document.getElementById('searchbutton')
    searchbutton.addEventListener("click", function(){
        
        fetchHaltesData(document.getElementById("haltetext").value)
    })
    
    
}



