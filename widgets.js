let widgetEditMode = false;
let hoveringBag = false;
let widgetBagElement = createWidgetBag();
let showNewsState = false; // Used for if the shownews state is changed before it could be created.
let ghostPannel = null;

// The widget drag info of the widget currently being dragged.
let curDragInfo = null;

let widgets = [];
function registerWidget(widget) {
  widgets.push(widget);
}

class WidgetBase {
  element;

  constructor() {
    this.element = null;
  }

  #createWidget() {
    let widgetDiv = document.createElement("div");
    widgetDiv.addEventListener("mousedown", (e) => { onWidgetDragStart(this, e) });
    widgetDiv.classList.add("smpp-widget");

    return widgetDiv;
  }

  createHTML() {
    if (this.element != null) {
      return;
    }
    this.element = this.#createWidget();
    this.createContent(this.element);
  }

  removeHTML() {
    if (this.element == null) {
      return;
    }
    this.element.remove();
    this.element = null;
  }

  get name() { return this.constructor.name; }

  // Override me
  // Gets called when the preview html code needs to be created (append it to the parent given as a parameter)
  createPreview(parent) {
    this.createContent(parent);
  }

  // Override me
  // Gets called when the content html code needs to be created (append it to the parent given as a parameter)
  createContent(parent) { }
}

class ErrorWidget extends WidgetBase {
  origWidgetName

  constructor(origWidgetName) {
    super();
    this.origWidgetName = origWidgetName;
  }

  get name() {
    return this.origWidgetName;
  }

  createContent(parent) {
    parent.classList.add("smpp-error-widget")
    parent.innerHTML = "<p>Probleem bij het laden van de widget:</p> <code class='widgetName'></code>";
    parent.querySelector(".widgetName").innerText = this.origWidgetName;
  }
}

class SmartschoolWidget extends WidgetBase {
  smContent

  constructor(content) {
    super();
    this.smContent = content;
  }

  get name() {
    return this.constructor.name+"-"+this.smContent.id;
  }

  createContent(parent) {
    parent.style.padding = "0px";
    parent.appendChild(this.smContent);
  }
}

function onPannelInsertionPointHover(e) {
  if (!widgetEditMode || curDragInfo == null) { return; }
  if (!ghostPannel) {
    ghostPannel = createPannelHTML({widgets:[]});
  }
  e.target.parentElement.insertBefore(ghostPannel, e.target.nextElementSibling);
}
function createInsertionPointHTML(pannel=false) {
  let ipoint = document.createElement("div");
  ipoint.classList.add("smpp-widget-insertion-point");
  if (pannel) {
    ipoint.classList.add("smpp-widget-insertion-point-pannel");
    ipoint.addEventListener("mouseenter", onPannelInsertionPointHover);
  }
  return ipoint;
}

function createPannelHTML(pannel) {
  let pannelDiv = document.createElement("div");
  pannelDiv.classList.add("smpp-widget-pannel");
  pannelDiv.appendChild(createInsertionPointHTML());

  for (let widgetName of pannel.widgets){
    let widget = getWidgetByName(widgetName);
    if (!widget){
      registerWidget(new ErrorWidget(widgetName));
      widget = getWidgetByName(widgetName);
    }
    if (!widget.element) {
      widget.createHTML()
      pannelDiv.appendChild(widget.element);
    } else {
      continue;
    }
    pannelDiv.appendChild(createInsertionPointHTML());
  }
  return pannelDiv;
}

function createWidgetsContainerHTML(widgetData, newsContent, showNews){
  let widgetsContainer = document.createElement("div");
  widgetsContainer.classList.add("smpp-widgets-container");

  widgetsContainer.appendChild(createInsertionPointHTML(true));
  for (let pannel of widgetData.leftPannels) {
    let pannelDiv = createPannelHTML(pannel)
    pannelDiv.classList.add("smpp-widget-pannel-left");
    widgetsContainer.appendChild(pannelDiv);
    widgetsContainer.appendChild(createInsertionPointHTML(true));
  }

  let newsDiv = document.createElement("div");
  newsDiv.classList.add("smpp-news-container");
  newsContent.id="smpp-news-content";
  newsContent.className="";
  newsContent.style.display = showNews?"block":"none";
  newsDiv.appendChild(newsContent);
  widgetsContainer.appendChild(newsDiv);

  widgetsContainer.appendChild(createInsertionPointHTML(true));
  for (let pannel of widgetData.rightPannels) {
    let pannelDiv = createPannelHTML(pannel)
    pannelDiv.classList.add("smpp-widget-pannel-right");
    widgetsContainer.appendChild(pannelDiv);
    widgetsContainer.appendChild(createInsertionPointHTML(true));
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


async function createWidgetSystem() {
  let container = document.getElementById("container");
  if (!container) {
    return false;
  }
  console.log("creating widget system...");

  // extract dingetjes
  let news = document.getElementById("centercontainer");
  if (!news){
    console.error("centercontainer doesn't exist. ");
    console.log("reloading web page... because no centercontainer");
    location.reload();
    return false;
  }

  let widgetData = await browser.runtime.sendMessage({ action: 'getWidgetData' });
  let setDefaults = false;
  if (widgetData == null) {
    setDefaults = true;
    widgetData = {
      leftPannels: [{widgets:[]}],
      rightPannels: [{widgets:[]}],
    }
  }
  console.log(widgetData);

  // create smartschool default widgets
  for (let smWidget of document.querySelectorAll("#rightcontainer .homepage__block")) {
    let wName = "SmartschoolWidget-"+smWidget.id;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults){
      widgetData.rightPannels[0].widgets.push(wName);
    }
  }
  for (let smWidget of document.querySelectorAll("#leftcontainer .homepage__block")) {
    let wName = "SmartschoolWidget-"+smWidget.id;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults){
      widgetData.leftPannels[0].widgets.push(wName);
    }
  }
  console.log(widgets);

  // create widgets container
  let widgetsContainer = createWidgetsContainerHTML(widgetData, news, showNewsState);

  container.innerHTML="";
  container.appendChild(widgetsContainer);

  return true;
}

function bagHoverEnter() {
  let bag = widgetBagElement;
  hoveringBag = true;
  if (curDragInfo) {
    bag.classList.add("smpp-widget-bag-delete");
    curDragInfo.widget.element.classList.add("smpp-widget-delete");
  }
}

function bagHoverExit() {
  let bag = widgetBagElement;
  hoveringBag = false;
  bag.classList.remove("smpp-widget-bag-delete");
  if (curDragInfo) {
    curDragInfo.widget.element.classList.remove("smpp-widget-delete");
  }
}

function createWidgetBag() {
  let bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag");
  document.body.appendChild(bag);
  bag.addEventListener("mouseenter", (e) => {
    bagHoverEnter();
  });
  bag.addEventListener("mouseleave", (e) => {
    bagHoverExit();
  });
  return bag;
}

class WidgetDragInfo {
  offset;
  widget;
  sourcePannel;
  sourceBeforeElement; // The element the widget is after in the source pannel. (used to restore prev position)

  constructor(widget, sourcePannel, sourceBeforeElement, offset) {
    this.widget = widget;
    this.sourcePannel = sourcePannel;
    this.sourceBeforeElement = sourceBeforeElement;
    this.offset = offset;
  }
}


function onWidgetDragStart(widget, e) {
  if (!widgetEditMode) {
    return;
  }
  let target = widget.element;
  let rect = target.getBoundingClientRect();

  target.nextElementSibling.remove();

  curDragInfo = new WidgetDragInfo(widget, widget.element.parentElement, widget.element.nextElementSibling, { x: e.clientX - rect.left, y: e.clientY - rect.top });
  document.body.classList.add("smpp-widget-dragging-something");
  target.style.width = rect.width + "px";
  target.style.height = rect.height + "px";
  target.style.left = rect.left + "px";
  target.style.top = rect.top + "px";

  target.classList.add("smpp-widget-dragging");


  document.body.appendChild(widget.element);
}

function dropCurDragWidget(e) {
  if (curDragInfo) {
    let el = curDragInfo.widget.element;
    el.classList.remove("smpp-widget-dragging");
    el.style = "";
    if (hoveringBag) {
      bagHoverExit();
      // Delete
      curDragInfo.widget.removeHTML();
    } else {
      // Move
      let targetPannel = curDragInfo.sourcePannel;
      let targetBefore = curDragInfo.sourceBeforeElement;
      if (e != null && e.target.classList.contains("smpp-widget-insertion-point")) {
        if (!e.target.classList.contains("smpp-widget-insertion-point-pannel")) {
          targetBefore = e.target.nextElementSibling;
          targetPannel = e.target.parentElement;
        }
      }

      if (targetPannel == ghostPannel){
        ghostPannel.parentElement.insertBefore(createInsertionPointHTML(true), ghostPannel.nextElementSibling);
        ghostPannel = null;
      }

      targetPannel.insertBefore(el, targetBefore);
      targetPannel.insertBefore(createInsertionPointHTML(), targetBefore);
    }

    if (curDragInfo.sourcePannel.childNodes.length == 1) { // Check if the pannel is empty (1 is because of the insertion point)
      curDragInfo.sourcePannel.nextElementSibling.remove();
      curDragInfo.sourcePannel.remove();
    }

    if(ghostPannel) {
      ghostPannel.remove();
      ghostPannel = null;
    }

    document.body.classList.remove("smpp-widget-dragging-something");
    curDragInfo = null;
  }
}


document.addEventListener("mouseup", (e) => {
  dropCurDragWidget(e);
});

document.addEventListener("mousemove", (e) => {
  if (curDragInfo != null) {
    let el = curDragInfo.widget.element;
    let offset = curDragInfo.offset;
    el.style.left = (e.clientX - offset.x) + "px";
    el.style.top = (e.clientY - offset.y) + "px";

    let bagBounds = widgetBagElement.getBoundingClientRect();
    if (e.clientY < bagBounds.bottom && e.clientX > bagBounds.left && e.clientX < bagBounds.right) {
      bagHoverEnter();
    } else if (hoveringBag) {
      bagHoverExit();
    }
  }

});

document.addEventListener("mousedown", (e) => {
  if (!e.target.classList.contains("smpp-widget") && e.target.id !== "smpp-widget-edit-mode-btn") {
    setEditMode(false);
  }
})

document.addEventListener("keyup", (e) => {
  if (e.key == "Escape" && widgetEditMode) {
    setEditMode(false);
    e.preventDefault();
  }

});


function getWidgetByName(name) {
  for (let widget of widgets) {
    if (widget.name == name) {
      return widget;
    }
  }
  return null;
}

function setEditMode(value) {
  if (value) {
    document.body.classList.add("smpp-widget-edit-mode");
  } else {
    dropCurDragWidget();
    document.body.classList.remove("smpp-widget-edit-mode");
  }
  widgetEditMode = value;
}

function createWidgetEditModeButton() {

  let btn = document.createElement("button");
  btn.classList.add("topnav__btn");
  btn.classList.add("smpp-button");
  btn.id="smpp-widget-edit-mode-btn";
  btn.addEventListener("click", () => {
    setEditMode(!widgetEditMode);
  });
  btn.innerHTML = editIconSvg
  btn.title = "Ga in/uit edit mode om de locatie van de widgets te veranderen.";

  return btn;
}

class TestWidget extends WidgetBase {
  createContent(parent) {
    parent.innerHTML = "<p>I Am Test Widget </p>";
  }
}
registerWidget(new TestWidget());

class TestWidget2 extends WidgetBase {
  createContent(parent) {
    parent.innerHTML = "<p>I Am also a Test Widget </p>";
  }
}
registerWidget(new TestWidget2());
