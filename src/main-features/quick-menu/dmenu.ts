// @ts-nocheck
import { randomChance, browser } from "../../common/utils.js";
import { do_qm } from "./quick.js";

let active_dmenu = null;
export let dmenuConfig = null;

// Called by apply
export async function reloadDMenuConfig() {
  dmenuConfig = await browser.runtime.sendMessage({
    action: "getSetting",
    name: "other.dmenu",
  });
}

// Load the config if it wasn't already loaded
export async function loadDMenuConfig() {
  if (!dmenuConfig) {
    await reloadDMenuConfig();
  }
}

class DMenu {
  openerEl;
  menuEl;

  #endFunc;
  #inputEl;
  #itemListEl;
  #userText;
  #selectedIndex;

  constructor(
    itemList,
    endFunc = undefined,
    title = "dmenu:",
    openerEl = undefined
  ) {
    this.endFunc = endFunc;
    this.openerEl = openerEl;

    this.userText = "";
    this.selectedIndex = 0;

    this.#mkDmenu(itemList, title);
    this.inputEl.focus();
  }
  isOpen() {
    return this.menuEl != null;
  }
  close() {
    if (!this.isOpen()) {
      return;
    }
    this.menuEl.remove();
    this.menuEl = null;
  }

  #accept(row = undefined) {
    if (row == undefined) {
      row = this.itemListEl.childNodes[this.selectedIndex];
    }
    let content = this.inputEl.value;
    if (row != undefined && !row.classList.contains("hidden")) {
      content = row.dataset.content;
    }

    if (this.endFunc != undefined && content !== "") {
      this.endFunc(content);
    }
    this.close();
  }

  #onKeydown(e) {
    if (e.key == "Enter") {
      this.#accept();
    } else if (e.key == "Escape") {
      this.close();
    } else if ((e.key == "Tab" && e.shiftKey) || e.key == "ArrowUp") {
      this.#selPrev();
    } else if ((e.key == "Tab" && !e.shiftKey) || e.key == "ArrowDown") {
      this.#selNext();
    } else {
      return;
    }
    e.preventDefault();
  }
  #oninput() {
    this.#sort();
    return;
  }

  #selNext() {
    this.#select(this.selectedIndex + 1);
  }
  #selPrev() {
    this.#select(this.selectedIndex - 1);
  }

  #validIndex(index) {
    if (index < 0 || index >= this.itemListEl.childNodes.length) {
      return false;
    }

    return !this.itemListEl.childNodes[index].classList.contains("hidden");
  }

  #select(index) {
    if (!this.#validIndex(index)) {
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
    let items = [];
    for (let node of this.itemListEl.childNodes) {
      let score = this.#matchScore(node.dataset.content, searchq);

      if (score == 0 && searchq != "") {
        node.classList.add("hidden");
      } else {
        node.classList.remove("hidden");
      }
      items.push({ score: score, htmlNode: node });

      if (dmenuConfig.itemScore) {
        node.getElementsByClassName("dmenu-score")[0].innerText = score;
      }
    }

    let sortedItems = items.sort(function (a, b) {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    });

    for (let i = 0; i < sortedItems.length; i++) {
      let item = sortedItems[i];
      if (i == 0) {
        item.htmlNode.classList.add("dmenu-selected");
      } else {
        item.htmlNode.classList.remove("dmenu-selected");
      }

      this.itemListEl.appendChild(item.htmlNode);
    }
  }

  #matchScore(str, match) {
    str = str.toLowerCase();
    match = match.toLowerCase();
    let score = 0;
    let mi = 0;
    let i = 0;
    let streak = 0;
    let streakStartI = 0;
    while (true) {
      if (i >= str.length || mi >= match.length) {
        break;
      }
      if (str[i] == match[mi]) {
        score +=
          (streak + 1) *
          (streak + 1) *
          ((str.length - streakStartI) / str.length);
        mi += 1;
        streak += 1;
      } else {
        streakStartI = i;
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

  #mkRow(item, parent) {
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
    row.innerHTML =
      '<div class="dmenu-content"></div><div class="dmenu-meta"></div><div class="dmenu-score"></div>';
    row.getElementsByClassName("dmenu-content")[0].innerText = cmd;
    row.dataset.content = cmd;
    if (meta != undefined) {
      row.getElementsByClassName("dmenu-meta")[0].innerText = meta;
    }

    if (dmenuConfig.itemScore) {
      row.getElementsByClassName("dmenu-score")[0].innerText = "0";
    }

    let klass = this;
    row.addEventListener("click", function (e) {
      klass.#accept(row);
    });
    parent.appendChild(row);
    return row;
  }

  #mkDmenu(itemList, title) {
    this.menuEl = document.createElement("div");
    this.menuEl.classList.add("dmenu");
    if (randomChance(1 / 100)) this.menuEl.classList.add("jokeDmenu");
    if (dmenuConfig.centered) {
      this.menuEl.classList.add("dmenu-centered");
    }

    let top = document.createElement("div");
    top.classList.add("dmenu-top");

    let dtitle = document.createElement("label");
    dtitle.innerText = title;
    dtitle.classList.add("dmenu-title");
    top.appendChild(dtitle);

    this.inputEl = document.createElement("input");
    this.inputEl.type = "text";
    this.inputEl.classList.add("dmenu-input");
    let klass = this;
    this.inputEl.addEventListener("keydown", (e) => {
      klass.#onKeydown(e);
    });
    this.inputEl.addEventListener("input", (e) => {
      klass.#oninput();
    });
    top.appendChild(this.inputEl);

    this.menuEl.appendChild(top);

    this.itemListEl = document.createElement("div");
    this.itemListEl.classList.add("dmenu-itemlist");
    this.menuEl.appendChild(this.itemListEl);

    let first = true;
    for (let item of itemList) {
      let row = this.#mkRow(item, this.itemListEl);
      if (first) {
        row.classList.add("dmenu-selected");
        first = false;
      }
    }

    document.body.appendChild(this.menuEl);
  }
}

export function dmenu(
  itemList,
  endFunc = undefined,
  title = "dmenu:",
  opener = undefined
) {
  if (active_dmenu !== null && active_dmenu.isOpen()) {
    active_dmenu.close();
  }
  let menu = new DMenu(itemList, endFunc, title, opener);
  active_dmenu = menu;
  return menu;
}

export function createQuickMenuButton() {
  const quickMenuButton = document.createElement("button");
  quickMenuButton.id = "quick-menu-button";
  quickMenuButton.className = "topnav__btn";
  quickMenuButton.innerHTML = "Quick";
  quickMenuButton.addEventListener("click", function () {
    do_qm(quickMenuButton);
  });
  return quickMenuButton;
}

document.addEventListener("click", function (e) {
  if (active_dmenu == null || !active_dmenu.isOpen()) {
    return;
  }
  if (
    !active_dmenu.menuEl.contains(e.target) &&
    e.target != active_dmenu.openerEl
  ) {
    active_dmenu.close();
    e.preventDefault();
  }
});
