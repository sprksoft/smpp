
let widgetEditMode=false;
let curDraggingWidgetInfo = null;

class WidgetBase {
  element;

  constructor(){
    this.element = null;
  }


  #createWidget(){
    let widgetDiv = document.createElement("div");
    widgetDiv.addEventListener("mousedown", (e) => { onWidgetDragStart(this, e) });
    widgetDiv.classList.add("smpp-widget");

    this.createContent(widgetDiv);

    return widgetDiv;
  }

  // Move this widget to the pannel
  // pannel: html panel element
  move(pannel) {
    if (!this.isShown()){
      this.element = this.#createWidget();
    }
    pannel.appendChild(this.element);
  }

  hide() {
    if (!this.isShown()){
      return;
    }
    this.element.remove();
    this.element = null;
  }

  isShown() {
    return this.element !== null;
  }

  //Override me
  get name() {}


  // Override me
  createPreview(parent) {
    this.createContent(parent);
  }

  // Override me
  // Gets called when the content html code needs to be created (append it to the parent given as a parameter)
  createContent(parent) {}
}

function onWidgetDragStart(widget, e){
  let target = widget.element;

  target.style.width=target.offsetWidth;
  target.style.height=target.offsetHeight;
  target.style.left = e.pageX;
  target.style.top = e.pageY;

  target.classList.add("smpp-widget-dragging");

  curDraggingWidgetInfo = { sourcePannel: widget.element.parentElement, widget:widget, startPos: {x: e.pageX, y:e.pageY} };

  let container = document.getElementById("container");
  container.appendChild(widget.element);

}

document.addEventListener("mouseup", (e) => {
  if (curDraggingWidgetInfo) {
    let el = curDraggingWidgetInfo.widget.element;
    el.classList.remove("smpp-widget-dragging");
    curDraggingWidgetInfo.sourcePannel.appendChild(el);

    curDraggingWidgetInfo = null;
  }
})

document.addEventListener("mousemove", (e) => {
  if (curDraggingWidgetInfo != null) {
    let el = curDraggingWidgetInfo.widget.element;
    let offset = curDraggingWidgetInfo.startPos;
    el.style.left = e.pageX-offset.x+"px";
    el.style.top = e.pageY-offset.y+"px";
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
    document.body.classList.remove("smpp-widget-edit-mode");
  }
  widgetEditMode = value;
}

function createWidgetEditModeButton(){
  let parent = document.querySelector("nav.topnav")
  let btn = document.createElement("button");
  btn.addEventListener("click", ()=>{
    setEditMode(!widgetEditMode);
  });
  btn.innerText="edit mode";

  parent.appendChild(btn);
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
