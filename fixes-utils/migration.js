async function migrateV5() {
  const settingsData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  console.log("Started migration V5 with", settingsData);
  await migrateSettingsV5(settingsData);
  await migrateImageV5(settingsData);
  await migrateWidgetSettingsData();
}

async function migrateWidgetSettingsData() {
  let delijnAppData = await browser.runtime.sendMessage({
    action: "getDelijnAppData",
  });
  let weatherAppData = await browser.runtime.sendMessage({
    action: "getWeatherAppData",
  });

  if (Object.keys(delijnAppData).length !== 0) {
    await setWidgetSetting("DelijnWidget.halte", {
      entiteit: delijnAppData.delijnAppData.entiteitnummer,
      nummer: delijnAppData.delijnAppData.haltenummer,
    });
  }
  if (Object.keys(weatherAppData).length !== 0) {
    let weatherWidgets = widgets.filter((item) =>
      item.name.toLowerCase().includes("weather")
    );
    weatherWidgets.forEach(async (widget) => {
      await widget.setSetting(
        "currentLocation",
        weatherAppData.weatherAppData.lastLocation
      );
    });
  }
}

async function migrateImageV5(oldData) {
  let data;
  switch (oldData.backgroundSelection) {
    case 0: //default
      data = {
        imageData: null,
        link: "",
        type: "default",
      };
      break;
    case 1: //link
      data = {
        imageData: oldData.backgroundLink,
        link: oldData.backgroundLink,
        type: "link",
      };
      break;
    case 2: //file
      let imageData = await browser.runtime.sendMessage({
        action: "getBackgroundImage",
      });
      data = {
        imageData: imageData.backgroundImage,
        link: oldData.backgroundLink,
        type: "file",
      };
      console.log(data);
      break;
    default:
      break;
  }
  await browser.runtime.sendMessage({
    action: "setImage",
    id: "backgroundImage",
    data: data,
  });
}

async function migrateSettingsV5(oldData) {
  let newWeatherOverlayType;
  switch (oldData.weatherOverlaySelection) {
    case 0:
      newWeatherOverlayType = "snow";
      break;

    case 1:
      newWeatherOverlayType = "realtime";
      break;
    case 2:
      newWeatherOverlayType = "snow";
      break;
  }
  console.log(oldData);
  let newSettingsData = {
    profile: {
      username: oldData.customUserName,
    },
    appearance: {
      theme: oldData.theme,
      background: {
        blur: oldData.backgroundBlurAmount,
      },
      weatherOverlay: {
        type: newWeatherOverlayType,
        amount: oldData.weatherOverlayAmount,
        opacity: 1,
      },
      tabLogo: oldData.enableSMPPLogo ? "smpp" : "sm",
      news: oldData.showNews,
    },
    topNav: {
      buttons: {
        GO: false,
        GC: true,
        search: false,
        quickMenu: false,
      },
      switchCoursesAndLinks: true,
      icons: {
        home: true,
        mail: true,
        notifications: true,
        settings: false,
      },
    },
    other: {
      quicks: oldData.quicks,
      performanceMode: oldData.enablePerfomanceMode,
      splashText: true,
      discordButton: true,
      dmenu: {
        centered: true,
        itemScore: false,
        toplevelConfig: false,
      },
      keybinds: {
        dmenu: ":",
        widgetEditMode: "E",
        widgetBag: "Space",
        settings: ",",
        gc: "G",
      },
    },
  };

  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: newSettingsData,
  });
  console.log("migrated settings V5");
}

async function migrate() {
  await removeLegacyData(); // will reload the page if legacy data is present

  let settingsData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  if (settingsData.theme != null) {
    await migrateV5();
  }
}

async function removeLegacyData() {
  if (window.localStorage.getItem("settingsdata")) {
    await clearAllData();
  }
}
