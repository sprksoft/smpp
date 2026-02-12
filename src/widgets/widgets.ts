// @ts-nocheck
import { browser, fillObjectWithDefaults, getByPath, setByPath } from "../common/utils.js";
import { doneSvg, editIconSvg } from "../fixes-utils/svgs.js";
import { createButtonWithLabel } from "../main-features/appearance/ui.js";

const PANNELIP_MARGIN_PX = 20;

let widgetSystemCreated = false;

export let widgetEditModeInit = false;
export let widgetEditMode = false;
export const widgets = [];

let hoveringBag = false;
let newsState = false; // Used for if the news state is changed before it could be created.
// The widget drag info of the widget currently being dragged.
let curDragInfo = null;

let widgetsContainer;
let widgetBag;
let widgetBagHandle;
let doneButton;
let liteMode = false;

export function setWidgetLiteMode(value: boolean) {
  liteMode = value;
}

export function registerWidget(widget) {
  widgets.push(widget);
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

export class WidgetBase {
  element;
  isActive;
  #content;
  #preview;
  #bagPlaceHolder;
  #bagGroup;
  #aboutToDel;
  #settings;

  constructor() {
    this.element = this.#createWidgetDiv();
    this.isActive = false;
    this.#content = null;
    this.#preview = false;
    this.#aboutToDel = false;
  }

  createWidgetErrorContent(name) {
    const p = document.createElement("p");
    p.classList.add("smpp-error-widget");
    p.innerHTML =
      "<span>Probleem bij het laden van de widget: </span><code class='widgetName'></code><button>Reset widget</button>";
    p.querySelector(".widgetName").innerText = name;
    p.querySelector("button").addEventListener("click", async () => {
      this.clearWidgetSettings();
    });
    return p;
  }

  async clearWidgetSettings() {
    await browser.runtime.sendMessage({
      action: "setWidgetData",
      widget: this.constructor.name,
      data: this.defaultSettings(),
    });
    this.#settings = this.defaultSettings();
    console.log("Clearing", this.name, "'s settings");
    this.#content = null;
    this.#setPreview(false);
  }

  #createWidgetDiv() {
    const widgetDiv = document.createElement("div");
    widgetDiv.addEventListener("mousedown", (e) => {
      this.startDragging(e.clientX, e.clientY);
    });
    widgetDiv.classList.add("smpp-widget");

    return widgetDiv;
  }

  async #intoBag() {
    if (this.element.parentElement === this.#bagGroup) {
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
    if (this.#preview === preview && this.#content !== null) {
      return;
    }

    let newContent;
    try {
      if (preview) {
        this.element.classList.add("smpp-widget-preview");
        newContent = await this.createPreview();
      } else {
        this.element.classList.remove("smpp-widget-preview");

        await this.#loadSettings();

        newContent = await this.createContent();
        this.isActive = true;
      }
    } catch (e) {
      console.error("Failed to create widget content");
      console.error(e);
      newContent = this.createWidgetErrorContent(this.name);
    }
    if (!newContent) {
      console.error(
        "createContent and createPreview method's needs to return an html object. in widget impl",
      );
      newContent = this.createWidgetErrorContent(this.name);
    }
    this.#content?.remove();
    newContent.classList.add("smpp-widget-content");
    this.#content = newContent;
    this.element.dataset.widgetName = this.name;
    this.element.innerHTML = "";
    this.element.appendChild(this.#content);
    this.#preview = preview;
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
    if (!curDragInfo || curDragInfo.widget !== this) {
      return;
    }

    const el = this.element;
    const offset = curDragInfo.offset;
    el.style.left = `${x - offset.x}px`;
    el.style.top = `${y - offset.y}px`;
  }

  async drop(cancel = false) {
    if (!curDragInfo || curDragInfo.widget !== this) {
      return;
    }

    const el = this.element;
    el.classList.remove("smpp-widget-dragging");
    el.style = "";

    const sourceIp = curDragInfo.sourceInsertionPoint;
    let targetIp = curDragInfo.targetInsertionPoint;

    targetIp?.classList.remove("smpp-widget-insertion-point-targeted");
    if (cancel || !targetIp) {
      // Put back were came from if targetInsertionPoint is null or when we
      // cancel
      targetIp = sourceIp;
    }
    if (!cancel && this.#aboutToDel) {
      targetIp = null;
    }
    bagHoverExit();
    curDragInfo = null;
    if (targetIp == null) {
      this.onRemove();
      this.isActive = false;
      await this.#intoBag();
    } else {
      if (targetIp.classList.contains("smpp-widget-insertion-point-pannel")) {
        const pannelContainer = targetIp.parentElement;
        const pannel = await createPannelHTML({ widgets: [] });
        pannelContainer.insertBefore(createInsertionPointHTML(true), targetIp.nextElementSibling);
        pannelContainer.insertBefore(pannel, targetIp.nextElementSibling);
        targetIp = pannel.firstChild;
      }

      const targetPannel = targetIp.parentElement;
      targetPannel.style.display = "block";
      targetPannel.insertBefore(createInsertionPointHTML(), targetIp.nextElementSibling);
      targetPannel.insertBefore(el, targetIp.nextElementSibling);

      await this.#setPreview(false);
    }

    const sourcePannel = sourceIp?.parentElement;
    if (sourcePannel && sourcePannel.childNodes.length === 1) {
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
    const rect = this.element.getBoundingClientRect();

    if (el.parentElement === this.#bagGroup) {
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
    el.style.width = `${rect.width}px`;
    el.style.left = `${rect.left}px`;
    el.style.top = `${rect.top}px`;
    el.style["transform-origin"] = `${curDragInfo.offset.x}px ${curDragInfo.offset.y}px`;

    el.classList.add("smpp-widget-dragging");

    document.body.appendChild(el);

    closeBag();
  }

  /// Loads widget settings if needed.
  async #loadSettings() {
    if (this.#settings !== undefined) {
      return;
    }
    const settings = await browser.runtime.sendMessage({
      action: "getWidgetData",
      widget: this.constructor.name,
    });

    this.#settings = fillObjectWithDefaults(settings, this.defaultSettings());
  }

  // modifies a setting
  async setSetting(path, value) {
    await this.#loadSettings();
    setByPath(this.#settings, path, value);
    await browser.runtime.sendMessage({
      action: "setWidgetData",
      widget: this.constructor.name,
      data: this.#settings,
    });

    if (this.isActive) {
      await this.onSettingsChange();
    }
  }

  async getSetting(path) {
    await this.#loadSettings();
    return getByPath(this.#settings, path);
  }

  get settings() {
    if (this.#settings === undefined) {
      console.error(
        "Settings were not loaded before access. Don't use .settings outside of the widget. Call await widget.getSetting(path)",
      );
    }
    return this.#settings;
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

  // Returns the default settings. (will be filled in so that you always get a valid settings object inside onSettingsChange )
  defaultSettings() {
    return {};
  }

  // (Required): Gets called when the content element of the widget needs to be
  // created (return html element). (Don't do slow tasks in here)
  async createContent() {}
  // Gets called when the preview element needs to be created (return html
  // element) NOTE: preview and content never exist at the same time
  async createPreview() {
    return await this.createContent();
  }

  // Gets called when the settings of the widget change.
  // Use this to update the widget content based on the new settings. (settings object is always valid based on the value returned by defaultSettings())
  async onSettingsChange() {}

  async onThemeChange() {}

  async onRemove() {}
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
    return this.createWidgetErrorContent(this.origWidgetName);
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
    return `${this.constructor.name}-${this.smContent.id}`;
  }

  async createContent() {
    return this.smContent;
  }
}

function targetInsertionPoint(target) {
  if (target !== curDragInfo.targetInsertionPoint) {
    curDragInfo.targetInsertionPoint?.classList.remove("smpp-widget-insertion-point-targeted");
    curDragInfo.targetInsertionPoint = target;
    curDragInfo.targetInsertionPoint?.classList.add("smpp-widget-insertion-point-targeted");
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
  for (const child of pannel.childNodes) {
    if (!child.classList.contains("smpp-widget")) {
      continue;
    }
    const bounds = child.getBoundingClientRect();
    const centerY = bounds.top + (bounds.bottom - bounds.top) * 0.5;
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

function onCenterHover(div, e) {
  if (!widgetEditMode || curDragInfo == null || hoveringBag) {
    return;
  }
  const bounds = div.getBoundingClientRect();
  if (e.clientX < (bounds.right - bounds.left) / 2 + bounds.left) {
    targetInsertionPoint(div.previousElementSibling);
  } else {
    targetInsertionPoint(div.nextElementSibling);
  }
}

function createInsertionPointHTML(pannel = false) {
  const ipoint = document.createElement("div");
  ipoint.classList.add("smpp-widget-insertion-point");
  if (pannel) {
    ipoint.classList.add("smpp-widget-insertion-point-pannel");
    ipoint.addEventListener("mouseenter", onPannelInsertionPointHover);
  }
  return ipoint;
}

async function createPannelHTML(pannel) {
  const pannelDiv = document.createElement("div");
  pannelDiv.addEventListener("mousemove", (e) => onPannelHover(pannelDiv, e));
  pannelDiv.classList.add("smpp-widget-pannel");
  pannelDiv.appendChild(createInsertionPointHTML());

  for (const widgetName of pannel.widgets) {
    let widget = getWidgetByName(widgetName);
    if (!widget) {
      console.error(`Widget ${widgetName} doesn't exist.`);
      registerWidget(new ErrorWidget(widgetName));
      widget = getWidgetByName(widgetName);
    }
    await widget.addToPannel(pannelDiv);
  }
  return pannelDiv;
}

async function createWidgetsContainerHTML(widgetData, newsContent, news) {
  const widgetsContainer = document.createElement("div");
  widgetsContainer.classList.add("smpp-widgets-container");

  widgetsContainer.appendChild(createInsertionPointHTML(true));

  async function createAppendPannel(pannel) {
    const pannelDiv = await createPannelHTML(pannel);
    widgetsContainer.appendChild(pannelDiv);
    widgetsContainer.appendChild(createInsertionPointHTML(true));
  }
  for (const pannel of widgetData.leftPannels) {
    await createAppendPannel(pannel);
  }

  const newsDiv = document.createElement("div");
  newsDiv.classList.add("smpp-news-container");
  newsDiv.addEventListener("mousemove", (e) => onCenterHover(newsDiv, e));
  newsContent.id = "smpp-news-content";
  newsContent.className = "";

  if (news) {
    newsDiv.classList.add("show-news");
  }
  newsDiv.appendChild(newsContent);
  widgetsContainer.appendChild(newsDiv);

  widgetsContainer.appendChild(createInsertionPointHTML(true));
  for (const pannel of widgetData.rightPannels) {
    await createAppendPannel(pannel);
  }

  return widgetsContainer;
}

export function updateNews(value: boolean) {
  newsState = value;
  const newsCon = document.querySelector(".smpp-news-container");
  if (newsCon) {
    value ? newsCon.classList.add("show-news") : newsCon.classList.remove("show-news");
  }
}

function setNewsEditMode(value) {
  const newsCon = document.querySelector(".smpp-news-container");
  document.querySelector(".smpp-news-editor").style.display = value ? "" : "none";

  const button = document.getElementById("smpp-widget-news-toggle");
  button.checked = newsState;

  if (value) {
    newsCon.classList.add("smpp-news-editmode");
  } else {
    newsCon.classList.remove("smpp-news-editmode");
  }
}
function initNewsEditMode() {
  const div = document.createElement("div");
  div.classList.add("smpp-news-editor");

  const button = createButtonWithLabel("smpp-widget-news-toggle", "Show News");
  button.addEventListener("change", async (e) => {
    updateNews(e.target.checked);
    await browser.runtime.sendMessage({
      action: "setSetting",
      name: "appearance.news",
      data: e.target.checked,
    });
    const [{ settingsWindow }, { loadQuickSettings }] = await Promise.all([
      import("../main-features/settings/main-settings.js"),
      import("../main-features/settings/quick-settings.js"),
    ]);
    await settingsWindow.loadPage();
    await loadQuickSettings();
  });
  div.appendChild(button);
  document.querySelector(".smpp-news-container").appendChild(div);

  setNewsEditMode(false);
}

// Notify the widget system about a theme change
export async function widgetSystemNotifyThemeChange() {
  for (const widget of widgets) {
    await widget.onThemeChange();
  }
}

export async function createWidgetSystem() {
  const container = document.getElementById("container");
  if (!container) {
    return false;
  }

  // extract dingetjes
  const news = document.getElementById("centercontainer");
  if (!news) {
    console.error(`"centercontainer" doesn't exist`);
    return false;
  }
  let widgetData = await browser.runtime.sendMessage({
    action: "getWidgetLayout",
  });
  console.log("Applying widgets with data: \n", widgetData);
  let setDefaults = false;
  if (!widgetData) {
    setDefaults = true;
    widgetData = {
      leftPannels: [{ widgets: [] }],
      rightPannels: [{ widgets: [] }],
    };
  }

  // Create smartschool default widgets
  for (const smWidget of document.querySelectorAll("#rightcontainer .homepage__block")) {
    const wName = `SmartschoolWidget-${smWidget.id}`;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults) {
      widgetData.rightPannels[0].widgets.push(wName);
    }
  }
  for (const smWidget of document.querySelectorAll("#leftcontainer .homepage__block")) {
    const wName = `SmartschoolWidget-${smWidget.id}`;
    registerWidget(new SmartschoolWidget(smWidget));
    if (setDefaults) {
      widgetData.leftPannels[0].widgets.push(wName);
    }
  }
  if (setDefaults) {
    widgetData.rightPannels[0].widgets.unshift("TutorialWidget");
  }

  widgetsContainer = await createWidgetsContainerHTML(widgetData, news, newsState);

  container.innerHTML = "";
  container.appendChild(widgetsContainer);

  widgetSystemCreated = true;
  return true;
}

async function saveWidgets() {
  const widgetData = { leftPannels: [], rightPannels: [] };
  let onLeftPannels = true;
  for (const pan of widgetsContainer.childNodes) {
    if (pan.classList.contains("smpp-widget-insertion-point")) {
      continue;
    }
    if (pan.classList.contains("smpp-news-container")) {
      onLeftPannels = false;
      continue;
    }
    const pannelData = { widgets: [] };
    for (const wid of pan.childNodes) {
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
    action: "setWidgetLayout",
    layout: widgetData,
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
  const group = document.createElement("div");
  group.classList.add("smpp-widget-bag-group");
  for (const widget of widgets) {
    if (widget.category === name) {
      const pl = document.createElement("div");
      pl.classList.add("smpp-widget-bag-placeholder");
      await widget.setBagPlaceHolder(group, pl);
      group.appendChild(pl);
    }
  }
  const groupTitle = document.createElement("h2");
  groupTitle.classList.add("smpp-widget-bag-group-title");
  groupTitle.innerText = displayName;
  bag.appendChild(groupTitle);
  bag.appendChild(group);
}

async function createWidgetBag() {
  const bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag");

  const content = document.createElement("div");
  content.classList.add("smpp-widget-bag-content");

  const innerContent = document.createElement("div");
  innerContent.classList.add("smpp-widget-bag-inner-content");

  await createGroup(innerContent, "other", "Widgets");
  if (!liteMode) {
    await createGroup(innerContent, "games", "Games");
  }
  await createGroup(innerContent, "smartschool", "Smartschool Widgets");
  content.appendChild(innerContent);
  bag.appendChild(content);

  const handle = document.createElement("div");
  handle.classList.add("smpp-widget-bag-handle");
  handle.addEventListener("click", () => {
    toggleBag();
  });
  handle.innerHTML = `
<!-- Created with Inkscape (http://www.inkscape.org/) -->
<svg class="smpp-widget-bag-handle-icon" version="1.1" viewBox="0 0 448 448" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-.898 -124.01)"><path d="m26.458 288.48 198.44 119.06 198.44-119.06" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="39.511"/></g></svg>
`;
  bag.appendChild(handle);

  for (const widget of widgets) {
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
  if (doneButton) {
    changeDoneButtonState("noBag");
    doneButton.classList.remove("smpp-widget-bag-open");
  }
  bagHoverExit();
}
function openBag() {
  if (widgetBag) {
    widgetBag.classList.add("smpp-widget-bag-open");
  }
  if (doneButton) {
    changeDoneButtonState("inBag");
    doneButton.classList.add("smpp-widget-bag-open");
  }
  if (curDragInfo) {
    bagHoverEnter();
  }
}
export function toggleBag(_params) {
  if (isBagOpen()) {
    closeBag();
  } else if (!curDragInfo) {
    openBag();
  }
}

const setEditModeFalse = () => setEditMode(false);

function createWidgetsDoneButton() {
  doneButton = document.createElement("button");
  doneButton.innerHTML = `Done ${doneSvg}`;
  doneButton.classList.add("widgets-done-button");
  doneButton.classList.add("hidden");
  doneButton.addEventListener("click", setEditModeFalse);
  document.body.appendChild(doneButton);
}

function changeDoneButtonState(state) {
  doneButton.removeEventListener("click", setEditModeFalse);
  doneButton.removeEventListener("click", toggleBag);
  switch (state) {
    case "noBag":
      doneButton.addEventListener("click", setEditModeFalse);
      break;
    case "inBag":
      doneButton.addEventListener("click", toggleBag);
      break;
  }
}

function updateDoneButtonState(value) {
  requestAnimationFrame(() => {
    if (value) {
      doneButton.classList.remove("hidden");
    } else {
      doneButton.classList.add("hidden");
    }
  });
}

function splitWidgetNameAndSettingPath(path) {
  const index = path.indexOf(".");
  const widgetName = path.slice(0, index);
  const settingPath = path.slice(index + 1);
  return [widgetName, settingPath];
}

// Gets a widget by its name.
// Use shorthands: setWidgetSetting/getWidgetSetting to set and get settings of a widget
function getWidgetByName(name) {
  for (const widget of widgets) {
    if (widget.name === name) {
      return widget;
    }
  }
  return null;
}

// Get the value of a widget setting.
// path is: WidgetName.SettingsPath
export async function getWidgetSetting(path) {
  const [widgetName, settingPath] = splitWidgetNameAndSettingPath(path);
  const widget = getWidgetByName(widgetName);
  return await widget.getSetting(settingPath);
}

// Set the value of a widget setting.
// path is: WidgetName.SettingsPath
export async function setWidgetSetting(path, value) {
  const [widgetName, settingPath] = splitWidgetNameAndSettingPath(path);

  const widget = getWidgetByName(widgetName);
  await widget.setSetting(settingPath, value);
}

export async function setEditMode(value) {
  if (value && !widgetEditModeInit) {
    console.error(
      "Widget edit mode has not been initalized. setEditMode(true) has been called. (call initWidgetEditMode first) (This is a bug)",
    );
  }

  if (!doneButton) {
    createWidgetsDoneButton();
  }

  setNewsEditMode(value);
  if (value) {
    document.body.classList.add("smpp-widget-edit-mode");
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
  }
  updateDoneButtonState(value);
  widgetEditMode = value;
}

export function initWidgetEditMode() {
  if (widgetEditModeInit) {
    return;
  }

  if (!widgetSystemCreated) {
    console.error("Widget system has not been created yet. But initWidgetEditMode has been called");
    return;
  }
  widgetEditModeInit = true;

  initNewsEditMode();

  document.addEventListener("mouseup", async (_e) => {
    if (curDragInfo) {
      await curDragInfo.widget.drop(false);
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (curDragInfo) {
      curDragInfo.widget.dragMove(e.clientX, e.clientY);

      const handleBounds = widgetBagHandle.getBoundingClientRect();
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
}

export function createWidgetEditModeButton() {
  const btn = document.createElement("button");
  btn.classList.add("topnav__btn");
  btn.classList.add("smpp-button");
  btn.id = "smpp-widget-edit-mode-btn";
  btn.addEventListener("click", async () => {
    await setEditMode(!widgetEditMode);
  });
  btn.innerHTML = editIconSvg;
  btn.title = "Ga in/uit edit mode om de positie van je widgets te veranderen.";

  return btn;
}
