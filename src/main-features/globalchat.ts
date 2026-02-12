// @ts-nocheck

import { browser } from "../common/utils.ts";
import { gcIconSvg } from "../fixes-utils/svgs.js";
import { getPlantSvg } from "../widgets/plant.js";
import { currentTheme, getThemeQueryString } from "./appearance/themes.js";
import { BaseWindow } from "./modules/windows.js";

const GC_DOMAINS = {
  main: "https://gc.smartschoolplusplus.com",
  beta: "https://gcbeta.smartschoolplusplus.com",
};

class GlobalChatWindow extends BaseWindow {
  iframe: HTMLIFrameElement;
  gcContent: HTMLDivElement;
  beta: boolean;
  glass: boolean;
  constructor(hidden = true) {
    super("global_chat_window", hidden);
  }

  override async renderContent() {
    this.gcContent = document.createElement("div");
    const queryString = getThemeQueryString(currentTheme);
    this.iframe = document.createElement("iframe");
    this.iframe.style = "width:100%; height:100%; border:none";
    this.iframe.src = `${GC_DOMAINS[this.beta ? "beta" : "main"]}/v1?${queryString}&glass=${gcGlass}`;
    this.gcContent.appendChild(this.iframe);
    return this.gcContent;
  }
}

let gcWindow: GlobalChatWindow;
let gcGlass: boolean;

export async function openGlobalChat(event, beta = false) {
  if (gcWindow?.beta !== beta) {
    recreateGlobalChat();
  }
  if (!gcWindow?.element?.isConnected) {
    gcWindow = new GlobalChatWindow();
    gcWindow.beta = beta;
    await gcWindow.create();
  }
  gcWindow.show(event);
}

export function recreateGlobalChat() {
  if (gcWindow) {
    gcWindow.remove();
    gcWindow = null;
  }
}
export function setGlobalGlass(glass: boolean) {
  gcGlass = glass;
}

export function createGC() {
  const GlobalChatOpenButton = document.createElement("button");
  GlobalChatOpenButton.title = "Global chat (chat met iedereen die de extensie gebruikt)";
  GlobalChatOpenButton.id = "global_chat_button";
  GlobalChatOpenButton.className = "topnav__btn";
  GlobalChatOpenButton.innerHTML = gcIconSvg;
  GlobalChatOpenButton.addEventListener("click", (e) => openGlobalChat(e));
  return GlobalChatOpenButton;
}

// public smpp api
// Versions will change when a breaking change is required (Adding fields is not a breaking change)
window.addEventListener("message", async (e) => {
  if (!Object.values(GC_DOMAINS).includes(e.origin)) {
    console.warn("Got a message but it was not from one of the global chat domains.");
    return;
  }
  let response = { error: "not found" };
  switch (e.data.action) {
    // Get the current plant.
    case "plantapi.v1.get_current":
      response = await getPlantV1();
      break;
    case "plantapi.v1.get_stage_svg":
      response = {
        svg: getPlantSvg(stageDataToInternalPlantData(e.data.stageData)),
      };
      break;
  }
  response.callId = e.data.callId;
  e.source.postMessage(response, e.origin);
});

function stageDataToInternalPlantData(stageData) {
  return {
    uniqueColor: stageData.color,
    isAlive: stageData.isAlive,
    age: stageData.stage,
  };
}

async function getPlantV1() {
  const data = await browser.runtime.sendMessage({
    action: "getPlantAppData",
  });
  if (!data) {
    return {
      stageData: {
        color: "#fff",
        isAlive: true,
        stage: 0,
      },
      age: 0,
    };
  }
  return {
    stageData: {
      color: data.uniqueColor,
      isAlive: data.isAlive,
      stage: data.age,
    },
    age: data.daysSinceBirthday,
  };
}
