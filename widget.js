
//TODO: maak dit beter
const widgetContainer = document.createElement("div");
widgetContainer.className = "homepage__right smsc-container--right";

class WidgetBase {
  #element;

  constructor(){
    this.#element = null;
  }


  #createWidget(widget, parent){
    let widgetDiv = document.createElement("div");
    widgetDiv.classList.add("widget");

    let headerDiv = document.createElement("div");
    headerDiv.classList.add("widget-header");
    let closeBtn = document.createElement("button");
    closeBtn.innerText="remove"
    closeBtn.addEventListener("click", this.disable);

    headerDiv.appenChild(closeBtn);

    widgetDiv.appendChild(headerDiv);

    let contentDiv = document.createElement("div");
    contentDiv.classList.add("widget-content");
    widget.createContent(contentDiv);

    widgetDiv.appendChild(contentDiv);

    parent.appendChild(widgetDiv);
    return widgetDiv;
  }

  enable(save=true){
    if (this.isEnabled()){
      return;
    }
    this.#element = this.#createWidget(this, widgetContainer);
    if (save){
      await browser.runtime.sendMessage({ action: 'enableWidget' widgetName: this.name });
    }
  }

  disable(){
    if (!this.isEnabled()){
      return;
    }
    this.#element.remove();
    this.#element = null;
  }

  isEnabled(){
    return this.#element !== null;
  }

  //Override me
  get name(){}

  // Override me
  // Gets called when the content html code needs to be created (append it to the parent given as a parameter)
  createContent(parent) {}
}

let widgets = [];

function getWidgetByName(name){
  for (let widget of widgets){
    if (widget.name == name){
      return widget;
    }
  }
  return null;
}


class TestWidget extends WidgetBase {
  get name{
    return "TestWidget";
  }
  createContent(parent){
    parent.innerHTML="<p>I Am Test Widget </p>";
  }
}

widgets.push(new TestWidget());
getWidgetByName("TestWidget").enable();
