let widgetEditMode = false;
let hoveringBag = false;
let showNewsState = false; // Used for if the shownews state is changed before it could be created.
let ghostPannel = null;
// The widget drag info of the widget currently being dragged.
let curDragInfo = null;
let widgets = [];

let widgetBag;
let widgetBagFold;

function registerWidget(widget) {
  widgets.push(widget);
}

class WidgetBase {
  element;
  previewElement;

  constructor() {
    this.element = null;
    this.previewElement = null;
  }

  #createWidget() {
    let widgetDiv = document.createElement("div");
    widgetDiv.addEventListener("mousedown", (e) => { onWidgetDragStart(this, e) });
    widgetDiv.classList.add("smpp-widget");

    return widgetDiv;
  }

  createHTML() {
    if (this.element) { return; }
    this.element = this.#createWidget();
    this.createContent(this.element);
  }
  createPreviewHTML() {
    if (this.previewElement) { return; }
    let widget = this.#createWidget();
    widget.classList.add("smpp-widget-preview");
    this.createPreview(widget);
    this.previewElement = widget;
    return widget;
  }

  removeHTML() {
    if (!this.element) { return; }
    this.element.remove();
    this.element = null;
  }
  removePreviewHTML() {
    if (!this.previewElement) { return; }
    this.previewElement.remove();
    this.previewElement = null;
  }

  get name() { return this.constructor.name; }

  get category() { return "other"; }

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

  get category() {
    return "smartschool";
  }

  get name() {
    return this.constructor.name+"-"+this.smContent.id;
  }
  createContent(parent) {
    parent.classList.add("smpp-widget-smartschool");
    parent.appendChild(this.smContent);
  }

  createPreview(parent) {
    parent.classList.add("smpp-widget-smartschool");
    parent.appendChild(this.smContent);
  }
}

function onPannelHover(pannel, e) {
  if (!widgetEditMode || curDragInfo == null) { return; }

  let target = pannel.firstChild;
  for (let child of pannel.childNodes) {
    if (!child.classList.contains("smpp-widget")) { continue; }
    let bounds = child.getBoundingClientRect();
    let centerY = bounds.top+(bounds.bottom-bounds.top)*0.5;
    if (e.clientY > centerY) {
      target = child.nextElementSibling;
    }
  }

  if (target !== curDragInfo.targetInsertionPoint) {
    curDragInfo.targetInsertionPoint?.classList.remove("smpp-widget-insertion-point-targeted");
    curDragInfo.targetInsertionPoint = target;
    curDragInfo.targetInsertionPoint.classList.add("smpp-widget-insertion-point-targeted");
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
  pannelDiv.addEventListener("mousemove", (e)=>onPannelHover(pannelDiv, e));
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

  widgetBagFold = createWidgetBagFold();
  widgetBag = createWidgetBag();

  // create widgets container
  let widgetsContainer = createWidgetsContainerHTML(widgetData, news, showNewsState);

  container.innerHTML="";
  container.appendChild(widgetsContainer);

  return true;
}

function bagHoverEnter() {
  let bag = widgetBagFold;
  hoveringBag = true;
  if (curDragInfo) {
    bag.classList.add("smpp-widget-bag-delete");
    curDragInfo.widget.element.classList.add("smpp-widget-delete");
  }
}

function bagHoverExit() {
  let bag = widgetBagFold;
  hoveringBag = false;
  bag.classList.remove("smpp-widget-bag-delete");
  if (curDragInfo) {
    curDragInfo.widget.element.classList.remove("smpp-widget-delete");
  }
}

function createGroup(bag, name, displayName) {
  let group = document.createElement("div");
  group.classList.add("smpp-widget-bag-group");
  for (let widget of widgets) {
    if (widget.category == name) {
      group.appendChild(widget.createPreviewHTML());
    }
  }
  let groupTitle = document.createElement("h2");
  groupTitle.classList.add("smpp-widget-bag-group-title");
  groupTitle.innerText=displayName;
  bag.appendChild(groupTitle);
  bag.appendChild(group);
}

function createWidgetBag() {
  let bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag");

  createGroup(bag, "smartschool", "Smartschool widgets");
  createGroup(bag, "other", "Overige widgets");

  document.body.appendChild(bag);
  return bag;
}

function closeBag() {
  if (widgetBag.classList.contains("smpp-widget-bag-open")) {
    widgetBag.classList.remove("smpp-widget-bag-open")
  }
}

function createWidgetBagFold() {
  let bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag-fold");
  bag.innerHTML=`
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg class="smpp-widget-bag-fold-icon" version="1.1" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-.898 -124.01)"><path d="m26.458 288.48 198.44 119.06 198.44-119.06" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="39.511"/></g></svg>
`


  document.body.appendChild(bag);
  bag.addEventListener("mouseenter", (e) => {
    bagHoverEnter();
  });
  bag.addEventListener("mouseleave", (e) => {
    bagHoverExit();
  });
  bag.addEventListener("click", (e)=> {
      widgetBag.classList.add("smpp-widget-bag-open")
  })
  return bag;
}

class WidgetDragInfo {
  offset;
  widget;
  sourceInsertionPoint;
  targetInsertionPoint;

  constructor(widget, sourceInsertionPoint, offset) {
    this.widget = widget;
    this.sourceInsertionPoint=sourceInsertionPoint;
    this.offset = offset;
  }
}


function onWidgetDragStart(widget, e) {
  if (!widgetEditMode) {
    return;
  }
  if (widget.element && e.target.classList.contains("smpp-widget-preview")) {
    return;
  }

  let sourceIp = null;
  let rect;
  if (widget.element == null) {
    widget.createHTML();
    rect = e.target.getBoundingClientRect();
  } else {
    widget.element.nextElementSibling.remove();
    sourceIp = widget.element.previousElementSibling;
    rect = widget.element.getBoundingClientRect();
  }
  let target = widget.element;

  curDragInfo = new WidgetDragInfo(widget, sourceIp, { x: e.clientX - rect.left, y: e.clientY - rect.top });
  document.body.classList.add("smpp-widget-dragging-something");
  target.style.width = rect.width + "px";
  target.style.height = rect.height + "px";
  target.style.left = rect.left + "px";
  target.style.top = rect.top + "px";

  target.classList.add("smpp-widget-dragging");


  document.body.appendChild(widget.element);

  if (sourceIp && sourceIp.parentElement.childNodes.length == 1) {
    sourceIp.parentElement.style.display="none";
  }

  closeBag();
}

function dropCurDragWidget(cancel=false) {
  if (!curDragInfo) { return; }

  let el = curDragInfo.widget.element;
  el.classList.remove("smpp-widget-dragging");
  el.style = "";

  curDragInfo.targetInsertionPoint?.classList.remove("smpp-widget-insertion-point-targeted");
  let targetIp = curDragInfo.targetInsertionPoint;
  if (cancel || !targetIp) { // Put back were came from if targetInsertionPoint is null or when we cancel
    targetIp = curDragInfo.sourceInsertionPoint;
  }

  if(hoveringBag) {
    bagHoverExit();
    if (!cancel) {
      targetIp = null;
    }
  }

  if (targetIp && targetIp.parentElement == ghostPannel){
    ghostPannel.parentElement.insertBefore(createInsertionPointHTML(true), ghostPannel.nextElementSibling);
    ghostPannel = null;
  }

  if (targetIp == null) {
    curDragInfo.widget.removeHTML();
  } else {
    let targetPannel = targetIp.parentElement;
    targetPannel.style.display="block";
    targetPannel.insertBefore(createInsertionPointHTML(), targetIp.nextElementSibling);
    targetPannel.insertBefore(el, targetIp.nextElementSibling);
  }

  let sourcePannel = curDragInfo.sourceInsertionPoint?.parentElement;
  if (sourcePannel && sourcePannel.childNodes.length == 1) { // Check if the pannel is empty (1 is because of the insertion point)
    sourcePannel.nextElementSibling.remove();
    sourcePannel.remove();
  }

  if(ghostPannel) {
    ghostPannel.remove();
    ghostPannel = null;
  }

  document.body.classList.remove("smpp-widget-dragging-something");
  curDragInfo = null;
}


document.addEventListener("mouseup", (e) => {
  dropCurDragWidget(false);
});

document.addEventListener("mousemove", (e) => {
  if (curDragInfo != null) {
    let el = curDragInfo.widget.element;
    let offset = curDragInfo.offset;
    el.style.left = (e.clientX - offset.x) + "px";
    el.style.top = (e.clientY - offset.y) + "px";

    let bagBounds = widgetBagFold.getBoundingClientRect();
    if (e.clientY < bagBounds.bottom && e.clientX > bagBounds.left && e.clientX < bagBounds.right) {
      bagHoverEnter();
    } else if (hoveringBag) {
      bagHoverExit();
    }
  }

});

// document.addEventListener("mousedown", (e) => {
//   if (!e.target.classList.contains("smpp-widget") && e.target.id !== "smpp-widget-edit-mode-btn" && !e.target.classList.contains("smpp-widget-bag-fold") && !e.target.classList.contains("smpp-widget-bag")) {
//     setEditMode(false);
//   }
// })

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
    document.getElementById("smpp-news-content").style.display = "none";
  } else {
    closeBag();
    dropCurDragWidget(true);
    document.body.classList.remove("smpp-widget-edit-mode");
    showNews(showNewsState);
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
