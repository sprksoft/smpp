const PANNELIP_MARGIN_PX = 20;

let widgetEditMode = false;
let hoveringBag = false;
let showNewsState = false; // Used for if the shownews state is changed before it could be created.
// The widget drag info of the widget currently being dragged.
let curDragInfo = null;
let widgets = [];

let widgetsContainer;
let widgetBag;
let widgetBagHandle;

function registerWidget(widget) {
  widgets.push(widget);
}

function createWidgetErrorContent(name) {
  let p = document.createElement("p");
  p.classList.add("smpp-error-widget");
  p.innerHTML =
    "<span>Probleem bij het laden van de widget: </span><code class='widgetName'></code>";
  p.querySelector(".widgetName").innerText = name;
  return p;
}

class WidgetDragInfo {
  offset;
  widget;
  sourceInsertionPoint;
  targetInsertionPoint;

  constructor(widget, sourceInsertionPoint, offset) {
    this.widget = widget;
    this.sourceInsertionPoint = sourceInsertionPoint;
    this.targetInsertionPoint = null;
    this.offset = offset;
  }
}

class WidgetBase {
  element;
  #content;
  #preview;
  #bagPlaceHolder;
  #bagGroup;
  #aboutToDel;

  constructor() {
    this.element = this.#createWidgetDiv();
    this.#content = null;
    this.#preview = false;
    this.#aboutToDel = false;
  }

  #createWidgetDiv() {
    let widgetDiv = document.createElement("div");
    widgetDiv.addEventListener("mousedown", (e) => {
      this.startDragging(e.clientX, e.clientY);
    });
    widgetDiv.classList.add("smpp-widget");

    return widgetDiv;
  }

  async #intoBag() {
    if (this.element.parentElement == this.#bagGroup) {
      return;
    }
    if (this.#bagPlaceHolder) {
      this.#bagGroup.insertBefore(this.element, this.#bagPlaceHolder);
      this.#bagPlaceHolder.remove();
    } else {
      this.element.remove();
    }
    await this.#setPreview(true);
  }

  async #setPreview(preview) {
    if (this.#preview == preview && this.#content !== null) {
      return;
    }

    let newContent;
    try {
      if (preview) {
        this.element.classList.add("smpp-widget-preview");
        newContent = await this.createPreview();
      } else {
        this.element.classList.remove("smpp-widget-preview");
        newContent = await this.createContent();
      }
    } catch (e) {
      console.error("Failed to create widget content");
      console.error(e);
      newContent = createWidgetErrorContent(this.name);
    }
    if (!newContent) {
      console.error(
        "createContent and createPreview method's needs to return an html object. in widget impl"
      );
      newContent = createWidgetErrorContent(this.name);
    }
    this.#content?.remove();
    newContent.classList.add("smpp-widget-content");
    this.#content = newContent;
    this.element.dataset.widgetName = this.name;
    this.element.appendChild(this.#content);
    this.#preview = preview;
  }

  isPreview() {
    return this.#preview;
  }

  async createIfNotExist() {
    if (!this.#content) {
      await this.#intoBag();
    }
  }

  async setBagPlaceHolder(group, placeholder) {
    this.#bagPlaceHolder = placeholder;
    this.#bagGroup = group;
  }

  async addToPannel(pannel) {
    await this.#setPreview(false);
    pannel.appendChild(this.element);
    pannel.appendChild(createInsertionPointHTML(false));
  }

  aboutToDel(value) {
    this.#aboutToDel = value;
    if (value) {
      this.element.classList.add("smpp-widget-delete");
    } else {
      this.element.classList.remove("smpp-widget-delete");
    }
  }

  dragMove(x, y) {
    if (!curDragInfo || curDragInfo.widget != this) {
      return;
    }

    let el = this.element;
    let offset = curDragInfo.offset;
    el.style.left = x - offset.x + "px";
    el.style.top = y - offset.y + "px";
  }

  async drop(cancel = false) {
    if (!curDragInfo || curDragInfo.widget != this) {
      return;
    }

    let el = this.element;
    el.classList.remove("smpp-widget-dragging");
    el.style = "";

    let sourceIp = curDragInfo.sourceInsertionPoint;
    let targetIp = curDragInfo.targetInsertionPoint;

    targetIp?.classList.remove("smpp-widget-insertion-point-targeted");
    if (cancel || !targetIp) {
      // Put back were came from if targetInsertionPoint is null or when we cancel
      targetIp = sourceIp;
    }
    if (!cancel && this.#aboutToDel) {
      targetIp = null;
    }
    bagHoverExit();
    curDragInfo = null;
    if (targetIp == null) {
      await this.#intoBag();
    } else {
      if (targetIp.classList.contains("smpp-widget-insertion-point-pannel")) {
        let pannelContainer = targetIp.parentElement;
        let pannel = await createPannelHTML({ widgets: [] });
        pannelContainer.insertBefore(
          createInsertionPointHTML(true),
          targetIp.nextElementSibling
        );
        pannelContainer.insertBefore(pannel, targetIp.nextElementSibling);
        targetIp = pannel.firstChild;
      }

      let targetPannel = targetIp.parentElement;
      targetPannel.style.display = "block";
      targetPannel.insertBefore(
        createInsertionPointHTML(),
        targetIp.nextElementSibling
      );
      targetPannel.insertBefore(el, targetIp.nextElementSibling);

      await this.#setPreview(false);
    }

    let sourcePannel = sourceIp?.parentElement;
    if (sourcePannel && sourcePannel.childNodes.length == 1) {
      // Check if the pannel is empty (1 is because of the insertion point)
      sourcePannel.nextElementSibling.remove();
      sourcePannel.remove();
    }

    document.body.classList.remove("smpp-widget-dragging-something");

    await saveWidgets();
  }

  startDragging(grabX, grabY) {
    if (!widgetEditMode) {
      return;
    }
    const el = this.element;

    let sourceIp = this.element.previousElementSibling;
    let rect = this.element.getBoundingClientRect();

    if (el.parentElement == this.#bagGroup) {
      sourceIp = null;
      this.#bagGroup.insertBefore(this.#bagPlaceHolder, el);
      el.remove();
    } else {
      el.nextElementSibling.remove(); // remove insertion point.
    }

    curDragInfo = new WidgetDragInfo(this, sourceIp, {
      x: grabX - rect.left,
      y: grabY - rect.top,
    });
    document.body.classList.add("smpp-widget-dragging-something");
    el.style.width = rect.width + "px";
    el.style.left = rect.left + "px";
    el.style.top = rect.top + "px";
    el.style[
      "transform-origin"
    ] = `${curDragInfo.offset.x}px ${curDragInfo.offset.y}px`;

    el.classList.add("smpp-widget-dragging");

    document.body.appendChild(el);

    closeBag();
  }

  // Override us
  // Name of the widget
  get name() {
    return this.constructor.name;
  }

  // The category the widget is in
  get category() {
    return "other";
  }

  // (Required): Gets called when the content element of the widget needs to be created (return html element). (Don't do slow tasks in here)
  async createContent() {}
  // Gets called when the preview element needs to be created (return html element) NOTE: preview and content never exist at the same time
  async createPreview() {
    return await this.createContent();
  }

  async onThemeChange() {}
}

class ErrorWidget extends WidgetBase {
  origWidgetName;

  constructor(origWidgetName) {
    super();
    this.origWidgetName = origWidgetName;
  }
  get category() {
    return null;
  }

  get name() {
    return this.origWidgetName;
  }

  async createContent() {
    return createWidgetErrorContent(this.origWidgetName);
  }
}

class SmartschoolWidget extends WidgetBase {
  smContent;

  constructor(content) {
    super();
    this.smContent = content;
    this.smContent.classList.add("smpp-widget-smartschool");
  }

  get category() {
    return "smartschool";
  }

  get name() {
    return this.constructor.name + "-" + this.smContent.id;
  }

  async createContent() {
    return this.smContent;
  }
}

function targetInsertionPoint(target) {
  if (target !== curDragInfo.targetInsertionPoint) {
    curDragInfo.targetInsertionPoint?.classList.remove(
      "smpp-widget-insertion-point-targeted"
    );
    curDragInfo.targetInsertionPoint = target;
    curDragInfo.targetInsertionPoint?.classList.add(
      "smpp-widget-insertion-point-targeted"
    );
  }
}

function onPannelHover(pannel, e) {
  if (!widgetEditMode || curDragInfo == null || hoveringBag) {
    return;
  }

  const bounds = e.target.getBoundingClientRect();

  if (e.clientX < bounds.left + PANNELIP_MARGIN_PX) {
    targetInsertionPoint(e.target.previousElementSibling);
    return;
  }

  if (e.clientX > bounds.right - PANNELIP_MARGIN_PX) {
    targetInsertionPoint(e.target.nextElementSibling);
    return;
  }

  let target = pannel.firstChild;
  for (let child of pannel.childNodes) {
    if (!child.classList.contains("smpp-widget")) {
      continue;
    }
    const bounds = child.getBoundingClientRect();
    let centerY = bounds.top + (bounds.bottom - bounds.top) * 0.5;
    if (e.clientY > centerY) {
      target = child.nextElementSibling;
    }
  }
  targetInsertionPoint(target);
}

function onPannelInsertionPointHover(e) {
  if (!widgetEditMode || curDragInfo == null || hoveringBag) {
    return;
  }
  targetInsertionPoint(e.target);
}

function onCenterHover(e) {
  if (!widgetEditMode || curDragInfo == null || hoveringBag) {
    return;
  }
  const bounds = e.target.getBoundingClientRect();
  if (e.clientX < (bounds.right - bounds.left) / 2 + bounds.left) {
    targetInsertionPoint(e.target.previousElementSibling);
  } else {
    targetInsertionPoint(e.target.nextElementSibling);
  }
}

function createInsertionPointHTML(pannel = false) {
  let ipoint = document.createElement("div");
  ipoint.classList.add("smpp-widget-insertion-point");
  if (pannel) {
    ipoint.classList.add("smpp-widget-insertion-point-pannel");
    ipoint.addEventListener("mouseenter", onPannelInsertionPointHover);
  }
  return ipoint;
}

async function createPannelHTML(pannel) {
  let pannelDiv = document.createElement("div");
  pannelDiv.addEventListener("mousemove", (e) => onPannelHover(pannelDiv, e));
  pannelDiv.classList.add("smpp-widget-pannel");
  pannelDiv.appendChild(createInsertionPointHTML());

  for (let widgetName of pannel.widgets) {
    let widget = getWidgetByName(widgetName);
    if (!widget) {
      console.error("Widget " + widgetName + " doesn't exist.");
      registerWidget(new ErrorWidget(widgetName));
      widget = getWidgetByName(widgetName);
    }
    await widget.addToPannel(pannelDiv);
  }
  return pannelDiv;
}

async function createWidgetsContainerHTML(widgetData, newsContent, showNews) {
  let widgetsContainer = document.createElement("div");
  widgetsContainer.classList.add("smpp-widgets-container");

  widgetsContainer.appendChild(createInsertionPointHTML(true));

  async function createAppendPannel(pannel) {
    let pannelDiv = await createPannelHTML(pannel);
    widgetsContainer.appendChild(pannelDiv);
    widgetsContainer.appendChild(createInsertionPointHTML(true));
  }
  for (let pannel of widgetData.leftPannels) {
    await createAppendPannel(pannel);
  }

  let newsDiv = document.createElement("div");
  newsDiv.classList.add("smpp-news-container");
  newsDiv.addEventListener("mousemove", onCenterHover);
  newsContent.id = "smpp-news-content";
  newsContent.className = "";
  newsContent.style.display = showNews ? "block" : "none";
  newsDiv.appendChild(newsContent);
  widgetsContainer.appendChild(newsDiv);

  widgetsContainer.appendChild(createInsertionPointHTML(true));
  for (let pannel of widgetData.rightPannels) {
    await createAppendPannel(pannel);
  }

  return widgetsContainer;
}

function showNews(value) {
  showNewsState = value;
  let newsContent = document.getElementById("smpp-news-content");
  if (newsContent) {
    newsContent.style.display = value ? "block" : "none";
  }
}

// Notify the widget system about a theme change
async function widgetSystemNotifyThemeChange() {
  for (let widget of widgets) {
    await widget.onThemeChange();
  }
}

async function createWidgetSystem() {
  let container = document.getElementById("container");
  if (!container) {
    return false;
  }

  // extract dingetjes
  let news = document.getElementById("centercontainer");
  if (!news) {
    console.error("centercontainer doesn't exist. ");
    location.reload();
    return false;
  }
  console.log("Creating widget system...");
  let widgetData = await browser.runtime.sendMessage({
    action: "getWidgetData",
  });
  console.log("Widget data:", widgetData);
  let setDefaults = false;
  if (!widgetData) {
    setDefaults = true;
    widgetData = {
      leftPannels: [{ widgets: [] }],
      rightPannels: [{ widgets: [] }],
    };
  }

  // Create smartschool default widgets
  for (let smWidget of document.querySelectorAll(
    "#rightcontainer .homepage__block"
  )) {
    let wName = "SmartschoolWidget-" + smWidget.id;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults) {
      widgetData.rightPannels[0].widgets.push(wName);
    }
  }
  for (let smWidget of document.querySelectorAll(
    "#leftcontainer .homepage__block"
  )) {
    let wName = "SmartschoolWidget-" + smWidget.id;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults) {
      widgetData.leftPannels[0].widgets.push(wName);
    }
  }
  if (setDefaults) {
    widgetData.rightPannels[0].widgets.push("CompactWeatherWidget");
    widgetData.leftPannels.push({ widgets: ["DelijnWidget"] });
  }

  widgetsContainer = await createWidgetsContainerHTML(
    widgetData,
    news,
    showNewsState
  );

  container.innerHTML = "";
  container.appendChild(widgetsContainer);

  return true;
}

async function saveWidgets() {
  let widgetData = { leftPannels: [], rightPannels: [] };
  let onLeftPannels = true;
  for (let pan of widgetsContainer.childNodes) {
    if (pan.classList.contains("smpp-widget-insertion-point")) {
      continue;
    }
    if (pan.classList.contains("smpp-news-container")) {
      onLeftPannels = false;
      continue;
    }
    let pannelData = { widgets: [] };
    for (let wid of pan.childNodes) {
      if (wid.classList.contains("smpp-widget-insertion-point")) {
        continue;
      }
      pannelData.widgets.push(wid.dataset.widgetName);
    }

    if (onLeftPannels) {
      widgetData.leftPannels.push(pannelData);
    } else {
      widgetData.rightPannels.push(pannelData);
    }
  }
  await browser.runtime.sendMessage({
    action: "setWidgetData",
    widgetData: widgetData,
  });
}

function bagHoverEnter() {
  if (!widgetBag) {
    return;
  }
  hoveringBag = true;
  if (curDragInfo) {
    targetInsertionPoint(null);
    widgetBag.classList.add("smpp-widget-bag-delete");
    curDragInfo.widget.aboutToDel(true);
  }
}

function bagHoverExit() {
  if (!widgetBag) {
    return;
  }
  hoveringBag = false;
  if (curDragInfo) {
    widgetBag.classList.remove("smpp-widget-bag-delete");
    curDragInfo.widget.aboutToDel(false);
  }
}

async function createGroup(bag, name, displayName) {
  let group = document.createElement("div");
  group.classList.add("smpp-widget-bag-group");
  for (let widget of widgets) {
    if (widget.category == name) {
      let pl = document.createElement("div");
      pl.classList.add("smpp-widget-bag-placeholder");
      await widget.setBagPlaceHolder(group, pl);
      group.appendChild(pl);
    }
  }
  let groupTitle = document.createElement("h2");
  groupTitle.classList.add("smpp-widget-bag-group-title");
  groupTitle.innerText = displayName;
  bag.appendChild(groupTitle);
  bag.appendChild(group);
}

async function createWidgetBag() {
  let bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag");

  let content = document.createElement("div");
  content.classList.add("smpp-widget-bag-content");
  await createGroup(content, "other", "Widgets");
  await createGroup(content, "games", "Games");
  await createGroup(content, "smartschool", "Smartschool Widgets");
  bag.appendChild(content);

  let handle = document.createElement("div");
  handle.classList.add("smpp-widget-bag-handle");
  handle.addEventListener("click", () => {
    toggleBag();
  });
  handle.innerHTML = `
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg class="smpp-widget-bag-handle-icon" version="1.1" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-.898 -124.01)"><path d="m26.458 288.48 198.44 119.06 198.44-119.06" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="39.511"/></g></svg>
`;
  bag.appendChild(handle);

  for (let widget of widgets) {
    await widget.createIfNotExist();
  }

  document.body.appendChild(bag);
  return bag;
}

function isBagOpen() {
  if (!widgetBag) {
    return false;
  }
  return widgetBag.classList.contains("smpp-widget-bag-open");
}

function closeBag() {
  if (widgetBag) {
    widgetBag.classList.remove("smpp-widget-bag-open");
  }
  bagHoverExit();
}
function openBag() {
  if (widgetBag) {
    widgetBag.classList.add("smpp-widget-bag-open");
  }
  if (curDragInfo) {
    bagHoverEnter();
  }
}
function toggleBag(params) {
  if (isBagOpen()) {
    closeBag();
  } else {
    if (!curDragInfo) {
      openBag();
    }
  }
}

if (getPageURL().path == "") {
  document.addEventListener("mouseup", async (e) => {
    if (curDragInfo) {
      await curDragInfo.widget.drop(false);
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (curDragInfo) {
      curDragInfo.widget.dragMove(e.clientX, e.clientY);

      let handleBounds = widgetBagHandle.getBoundingClientRect();
      if (
        e.clientY < handleBounds.bottom &&
        e.clientX > handleBounds.left &&
        e.clientX < handleBounds.right
      ) {
        bagHoverEnter();
      } else if (hoveringBag) {
        bagHoverExit();
      }
    }
  });

  document.addEventListener("keyup", async (e) => {
    if (e.target?.tagName == "INPUT") {
      return;
    }
    if (e.key == "Escape" && widgetEditMode) {
      await setEditMode(false);
    } else if (e.key == "e") {
      await setEditMode(true);
    } else if (e.key == " ") {
      if (widgetEditMode) {
        toggleBag();
      }
    }
  });
}

function getWidgetByName(name) {
  for (let widget of widgets) {
    if (widget.name == name) {
      return widget;
    }
  }
  return null;
}

async function setEditMode(value) {
  if (value) {
    document.body.classList.add("smpp-widget-edit-mode");
    document.getElementById("smpp-news-content").style.display = "none";
    if (!widgetBag) {
      widgetBag = await createWidgetBag();
      widgetBagHandle = widgetBag.querySelector(".smpp-widget-bag-handle");
    }
  } else {
    if (curDragInfo) {
      await curDragInfo.widget.drop(true);
    }
    closeBag();
    document.body.classList.remove("smpp-widget-edit-mode");
    showNews(showNewsState);
  }
  widgetEditMode = value;
}

function createWidgetEditModeButton() {
  let btn = document.createElement("button");
  btn.classList.add("topnav__btn");
  btn.classList.add("smpp-button");
  btn.id = "smpp-widget-edit-mode-btn";
  btn.addEventListener("click", async () => {
    await setEditMode(!widgetEditMode);
  });
  btn.innerHTML = editIconSvg;
  btn.title = "Ga in/uit edit mode om de locatie van de widgets te veranderen.";

  return btn;
}
