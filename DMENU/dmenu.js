let menus = []

class DMenu {
  openerEl;
  menuEl;

  #endFunc;
  #inputEl;
  #itemListEl;
  #userText;
  #selectedIndex;
  #showItemScore;
  #lock;

  constructor(itemList, endFunc=undefined, title="dmenu:", openerEl=undefined){
    this.endFunc = endFunc;
    this.openerEl = openerEl;

    this.userText="";
    this.selectedIndex = 0;
    this.lock=false;

    let dconfig = get_dconfig();
    this.showItemScore = dconfig.item_score;

    this.#mkDmenu(itemList, title);
    this.inputEl.focus();
  }
  close(){
    if (this.lock) {
      return;
    }
    this.menuEl.remove();
  }

  #accept(row=undefined){
    if (row == undefined){
      row = this.itemListEl.childNodes[this.selectedIndex];
    }
    let content = this.inputEl.value;
    if (row != undefined && !row.classList.contains("hidden")){
      content = row.dataset.content;
    }

    if (this.endFunc != undefined && content !== "") {
      this.endFunc(content);
    }
    this.close();
  }

  #onKeydown(e){
    if (e.key == "Enter"){
      this.#accept();
    }else if (e.key == "Escape"){
      this.close();
    }else if ((e.key == "Tab" && e.shiftKey) || e.key == "ArrowUp") {
      this.#selPrev();
    } else if ((e.key == "Tab" && !e.shiftKey) || e.key == "ArrowDown") {
      this.#selNext();
    }else{
      return;
    }
    e.preventDefault();
  }
  #oninput(){
    this.#sort();
    return;
  }

  #selNext(){
    this.#select(this.selectedIndex+1);
  }
  #selPrev(){
    this.#select(this.selectedIndex-1);
  }

  #validIndex(index){
    if (index < 0 || index >= this.itemListEl.childNodes.length){
      return false;
    }

    return !this.itemListEl.childNodes[index].classList.contains("hidden");
  }

  #select(index){
    if (!this.#validIndex(index)){
      return;
    }
    let row = this.itemListEl.childNodes[this.selectedIndex];
    row.classList.remove("dmenu-selected");
    this.selectedIndex = index;

    let newrow = this.itemListEl.childNodes[this.selectedIndex];
    newrow.classList.add("dmenu-selected");
    newrow.scrollIntoView(false);
  }

  #sort() {
    this.selectedIndex = 0;
    let searchq = this.inputEl.value;

    // update scores
    for (let node of this.itemListEl.childNodes){
      let score = this.#matchScore(node.dataset.content, searchq);

      node.dataset.score = score;
      if (this.showItemScore) {
        node.getElementsByClassName("score")[0].innerText = score;
      }
    }

    let sorted = Array.from(this.itemListEl.childNodes)
      .sort(function(a,b){
        if (parseInt(a.dataset.score) < parseInt(b.dataset.score))
          return 1;
        if (parseInt(a.dataset.score) > parseInt(b.dataset.score))
          return -1;
        return 0;
    });

    for (let i=0; i < sorted.length; i++) {
      let node = sorted[i];
      if (i == 0){
        node.classList.add("dmenu-selected");
      }else{
        node.classList.remove("dmenu-selected");
      }

      if (node.dataset.score == 0 && searchq != "") {
        node.classList.add("hidden");
      } else {
        node.classList.remove("hidden");
      }

      this.itemListEl.appendChild(sorted[i]);
    }
  }

  #matchScore(str, match) {
    let score = 0;
    let mi = 0;
    let i = 0;
    let streak = 0;
    let distFromStart=0;
    while(true){
      if (i >= str.length || mi >= match.length){
        break;
      }
      if (str[i] == match[mi]) {
        score += (streak + 1)*((str.length-distFromStart)/str.length);
        mi += 1;
        streak += 1;
      } else {
        distFromStart = i;
        streak = 0;
      }
      i++;
    }
    if (mi < match.length) {
      return 0;
    }
    if (score < 0) {
      score = 0;
    }
    return score;
  }


  #mkRow(item, parent){
    let cmd;
    let meta = undefined;
    if (typeof item == "string") {
      cmd = item.toLowerCase();
    } else {
      cmd = item.value;
      meta = item.meta;
    }
    let row = document.createElement("div");
    row.classList.add("dmenu-row");
    row.innerHTML = '<div class="content"></div><div class="meta"></div><div class="score"></div>'
    row.getElementsByClassName("content")[0].innerText = cmd;
    row.dataset.content = cmd;
    if (meta != undefined) {
      row.getElementsByClassName("meta")[0].innerText = meta;
    }
    if (this.showItemScore) {
      row.getElementsByClassName("score")[0].innerText = "0";
    }

    let klass = this;
    row.addEventListener("click", function (e) {
      klass.#accept(row);
    });
    parent.appendChild(row);
    return row;
  }

  #mkDmenu(itemList, title){
    let dconfig = get_dconfig();

    this.menuEl = document.createElement("div");
    this.menuEl.classList.add("dmenu");
    if (dconfig.centered) {
        this.menuEl.classList.add("dmenu-centered");
    }

    let top = document.createElement("div");
    top.classList.add("dmenu-top");

    let dtitle = document.createElement("label");
    dtitle.innerText=title;
    dtitle.classList.add("dmenu-title");
    top.appendChild(dtitle);

    this.inputEl = document.createElement("input");
    this.inputEl.type="text";
    this.inputEl.classList.add("dmenu-input");
    let klass = this;
    this.inputEl.addEventListener("keydown", (e)=>{klass.#onKeydown(e)});
    this.inputEl.addEventListener("input", (e)=>{klass.#oninput()});
    top.appendChild(this.inputEl);

    this.menuEl.appendChild(top);

    this.itemListEl = document.createElement("div");
    this.itemListEl.classList.add("dmenu-itemlist");
    this.menuEl.appendChild(this.itemListEl);

    let first = true;
    for (let item of itemList) {
      let row = this.#mkRow(item, this.itemListEl);
      if (first){
        row.classList.add("dmenu-selected");
        first=false;
      }
    }

    document.body.appendChild(this.menuEl);
  }

}

function dmenu(itemList, endFunc=undefined, title="dmenu:", opener=undefined) {
  let menu = new DMenu(itemList, endFunc, title, opener);
  menus.push(menu);
  return menu;
}

document.addEventListener("click", function(e){
  if (menus.length == 0){
    return;
  }
  let menu = menus[menus.length-1];
  if (!menu.menuEl.contains(e.target) && e.target != menu.openerEl){
    menu.close();
  }
});
