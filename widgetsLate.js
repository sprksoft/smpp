// This file needs to be loaded after all files that create a widget.

let showNewsState = false; // Used for if the shownews state is changed before it could be created.

function createPannelHTML(pannel){
  let pannelDiv = document.createElement("div");
  pannelDiv.classList.add("smpp-widget-pannel");

  for (let widgetName of pannel.widgets){
    let widget = getWidgetByName(widgetName);
    widget.move(pannelDiv);
  }
  return pannelDiv;
}

function createWidgetsContainerHTML(widgetData, newsContent, showNews){
  let widgetsContainer = document.createElement("div");
  widgetsContainer.classList.add("smpp-widgets-container");

  for (let pannel of widgetData.rightPannels){
    let pannelDiv = createPannelHTML(pannel)
    pannelDiv.classList.add("smpp-widget-pannel-left");
    widgetsContainer.appendChild(pannelDiv);
  }

  let newsDiv = document.createElement("div");
  newsDiv.classList.add("smpp-news-container");
  newsContent.id="smpp-news-content";
  newsContent.className="";
  newsContent.style.display = showNews?"block":"none";
  newsDiv.appendChild(newsContent);
  widgetsContainer.appendChild(newsDiv);

  for (let pannel of widgetData.leftPannels){
    let pannelDiv = createPannelHTML(pannel)
    pannelDiv.classList.add("smpp-widget-pannel-left");
    widgetsContainer.appendChild(pannelDiv);
  }

  return widgetsContainer;
}


function showNews(value) {
  showNewsState = value;
  let newsContent = document.getElementById("smpp-news-content");
  if (newsContent){
    newsContent.style.display = value?"block":"none";
  }
}


(async () => {
  let container = document.getElementById("container");
  if (!container) {
    return;
  }
  console.log("creating widget system...");

  // extract dingetjes
  let news = document.getElementById("centercontainer");
  if (!news){
    console.error("centercontainer doesn't exist. Try reloading the extension");
    return;
  }

  // create widgets container
  let widgetData = await browser.runtime.sendMessage({ action: 'getWidgetData' });
  let widgetsContainer = createWidgetsContainerHTML(widgetData, news, showNewsState);

  container.innerHTML="";
  container.appendChild(widgetsContainer);
})();
