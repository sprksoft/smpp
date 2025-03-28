let widgetEditMode=false;
let hoveringBag=false;
let widgetBagElement=null;

function bagHoverEnter() {
  let bag = widgetBagElement;
  hoveringBag = true;
  if(curDragInfo){
    bag.classList.add("smpp-widget-bag-delete");
    curDragInfo.widget.element.classList.add("smpp-widget-delete");
  }else{
    bag.classList.add("smpp-widget-bag-big");
  }
}

function bagHoverExit() {
  let bag = widgetBagElement;
  hoveringBag = false;
  bag.classList.remove("smpp-widget-bag-big");
  bag.classList.remove("smpp-widget-bag-delete");
  if (curDragInfo) {
    curDragInfo.widget.element.classList.remove("smpp-widget-delete");
  }
}

function createWidgetBag() {
  let bag = document.createElement("div");
  bag.classList.add("smpp-widget-bag");
  document.body.appendChild(bag);
  bag.addEventListener("mouseenter", (e)=>{
    bagHoverEnter();
  });
  bag.addEventListener("mouseleave", (e)=>{
    bagHoverExit();
  });
  return bag;
}

widgetBagElement = createWidgetBag();

// The widget drag info of the widget currently being dragged.
let curDragInfo = null;

class WidgetDragInfo{
  offset;
  widget;
  sourcePannel;

  constructor(widget, sourcePannel, offset) {
    this.widget=widget;
    this.sourcePannel=sourcePannel;
    this.offset=offset;
  }
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
    if (this.element != null){
      return;
    }
    this.element = this.#createWidget();
    this.createContent(this.element);
  }

  removeHTML() {
    if (this.element == null){
      return;
    }
    this.element.remove();
    this.element = null;
  }

  //Override me
  get name() {}

  // Override me
  // Gets called when the preview html code needs to be created (append it to the parent given as a parameter)
  createPreview(parent) {
    this.createContent(parent);
  }

  // Override me
  // Gets called when the content html code needs to be created (append it to the parent given as a parameter)
  createContent(parent) {}
}

function onWidgetDragStart(widget, e){
  if (!widgetEditMode){
    return;
  }
  let target = widget.element;
  let rect = target.getBoundingClientRect();

  curDragInfo = new WidgetDragInfo(widget, widget.element.parentElement, { x: e.clientX-rect.left, y: e.clientY-rect.top });
  target.style.width=rect.width+"px";
  target.style.height=rect.height+"px";
  target.style.left = rect.left+"px";
  target.style.top = rect.top+"px";

  target.classList.add("smpp-widget-dragging");

  document.body.appendChild(widget.element);
}

function dropCurDragWidget() {
  if (curDragInfo) {
    let el = curDragInfo.widget.element;
    el.classList.remove("smpp-widget-dragging");
    el.style="";
    if (hoveringBag){
      bagHoverExit();
      // Delete
      curDragInfo.widget.removeHTML();
    } else {
      // Move
      curDragInfo.sourcePannel.appendChild(el);
    }
    curDragInfo = null;
  }
}

document.addEventListener("mouseup", (e) => {
  dropCurDragWidget();
});

document.addEventListener("mousemove", (e) => {
  if (curDragInfo != null) {
    let el = curDragInfo.widget.element;
    let offset = curDragInfo.offset;
    el.style.left = (e.clientX-offset.x)+"px";
    el.style.top = (e.clientY-offset.y)+"px";

    let bagBounds = widgetBagElement.getBoundingClientRect();
    if (e.clientY < bagBounds.bottom && e.clientX > bagBounds.left && e.clientX < bagBounds.right) {
      bagHoverEnter();
    }else if (hoveringBag){
      bagHoverExit();
    }
  }

});

document.addEventListener("keyup", (e)=> {
  if (e.key == "Escape" && widgetEditMode){
    setEditMode(false);
    e.preventDefault();
  }

});

let widgets = [];

function getWidgetByName(name) {
  for (let widget of widgets){
    if (widget.name == name){
      return widget;
    }
  }
  return null;
}

function setEditMode(value) {
  if (value){
    document.body.classList.add("smpp-widget-edit-mode");
  }else{
    dropCurDragWidget();
    document.body.classList.remove("smpp-widget-edit-mode");
  }
  widgetEditMode = value;
}

function createWidgetEditModeButton(){

  let btn = document.createElement("button");
  btn.classList.add("topnav__btn");
  btn.classList.add("smpp-button");
  btn.addEventListener("click", ()=>{
    setEditMode(!widgetEditMode);
  });
  btn.innerText="e";
  btn.title="Ga in/uit edit mode om de locatie van de widgets te veranderen.";

  return btn;
}


class TestWidget extends WidgetBase {
  get name() {
    return "TestWidget";
  }
  createContent(parent) {
    parent.innerHTML="<p>I Am Test Widget </p>";
  }
}

widgets.push(new TestWidget());
