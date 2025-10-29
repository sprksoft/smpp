async function migrateSnake() {
  let newData = {
    options: {
      size: 100,
      speed: window.localStorage.getItem("snakespeed"),
    },
    score: window.localStorage.getItem("snakehighscore"),
  };
  await browser.runtime.sendMessage({
    action: "setGameData",
    game: "SnakeWidget",
    data: newData,
  });
  window.localStorage.removeItem("snakespeed");
  window.localStorage.removeItem("snakehighscore");
  window.localStorage.removeItem("snakespeedmultiplier");
  return newData;
}
async function migrateFlappy() {
  let newData = {
    options: {
      speed: window.localStorage.getItem("flappyspeed"),
    },
    score: window.localStorage.getItem("flappyhighscore"),
  };
  await browser.runtime.sendMessage({
    action: "setGameData",
    game: "FlappyWidget",
    data: newData,
  });
  window.localStorage.removeItem("flappyspeed");
  window.localStorage.removeItem("flappyhighscore");
  window.localStorage.removeItem("flappyspeedmultiplier");
  return newData;
}

async function migrateDelijnData() {
  const lijnData = JSON.parse(localStorage.getItem("lijnData"));
  if (lijnData) {
    await setDelijnAppData(lijnData);
    localStorage.removeItem("lijnData");
  }
}

async function migratePlantData() {
  let oldData = JSON.parse(
    window.localStorage.getItem("current_plant_conditions")
  );
  await browser.runtime.sendMessage({
    action: "setPlantAppData",
    data: {
      age: oldData.age,
      lastWaterTime: oldData.last_time_watered,
      lastGrowTime: oldData.last_time_grew,
      uniqueColor: oldData.plant_color,
      plantVersion: oldData.plant_version,
      birthday: oldData.birth_day,
      daysSinceBirthday: oldData.time_since_birthday_days,
      isAlive: oldData.is_alive,
    },
  });
  window.localStorage.removeItem("current_plant_conditions");
}

function migrate_theme_data(old_themeData) {
  console.warn("migrating theme data");
  const themeData = {
    color_base00: old_themeData.base0,
    color_base01: old_themeData.base1,
    color_base02: old_themeData.base2,
    color_base03: old_themeData.base3,
    color_accent: old_themeData.accent,
    color_text: old_themeData.text,
  };
  window.localStorage.setItem("themedata", JSON.stringify(themeData));
  return themeData;
}

async function migrateWeaterData() {
  console.warn("Migrating weather data");
  let newWeatherData = JSON.parse(localStorage.getItem("weatherdata"));
  if (newWeatherData == null) {
    newWeatherData = await browser.runtime.sendMessage({
      action: "fetchWeatherData",
      location: localStorage.getItem("lastlocation"),
    });
  }
  await browser.runtime.sendMessage({
    action: "setWeatherAppData",
    data: {
      weatherData: newWeatherData,
      lastUpdateDate: localStorage.getItem("lastupdate"),
      lastLocation: localStorage.getItem("lastlocation"),
    },
  });

  localStorage.removeItem("weatherdata");
  localStorage.removeItem("lastupdate");
  localStorage.removeItem("lastlocation");
}

async function migrateSettingsV1() {
  let oldData = JSON.parse(window.localStorage.getItem("settingsdata"));
  console.log("Old data:", oldData);
  // Convert to widgets
  let widgetData = {
    leftPannels: [],
    rightPannels: [],
  };
  if (!liteMode) {
    widgetData.leftPannels.push({
      widgets: ["TutorialWidget"],
    });

    if (oldData.showplanner) {
      widgetData.leftPannels[0].widgets.push("PlannerWidget");
      if (oldData.halte) {
        widgetData.leftPannels.push({
          widgets: ["DelijnWidget"],
        });
      }
    } else if (oldData.halte) {
      widgetData.leftPannels[0].widgets.push("DelijnWidget");
    }

    let firstRightPanel = {
      widgets: [],
    };
    let secondRightPanel = {
      widgets: [],
    };

    if (oldData.show_plant) {
      firstRightPanel.widgets.push("PlantWidget");
    }

    if (oldData.location && oldData.location !== "") {
      let weatherWidget = oldData.isbig
        ? "WeatherWidget"
        : "CompactWeatherWidget";
      secondRightPanel.widgets.push(weatherWidget);
    }

    if (oldData.showsnake) {
      secondRightPanel.widgets.push("SnakeWidget");
    }

    if (oldData.showflappy) {
      secondRightPanel.widgets.push("FlappyWidget");
    }

    if (firstRightPanel.widgets.length > 0) {
      widgetData.rightPannels.push(firstRightPanel);
    }
    if (secondRightPanel.widgets.length > 0) {
      widgetData.rightPannels.push(secondRightPanel);
    }
  } else {
    widgetData.leftPannels.push({
      widgets: ["TutorialWidget"],
    });

    if (oldData.showplanner) {
      widgetData.leftPannels[0].widgets.push("PlannerWidget");
      if (oldData.halte) {
        widgetData.leftPannels.push({
          widgets: ["DelijnWidget"],
        });
      }
    } else if (oldData.halte) {
      widgetData.leftPannels[0].widgets.push("DelijnWidget");
    }

    let firstRightPanel = {
      widgets: [],
    };

    if (oldData.show_plant) {
      firstRightPanel.widgets.push("PlantWidget");
    }

    if (oldData.location && oldData.location !== "") {
      let weatherWidget = oldData.isbig
        ? "WeatherWidget"
        : "CompactWeatherWidget";
      firstRightPanel.widgets.push(weatherWidget);
    }

    if (firstRightPanel.widgets.length > 0) {
      widgetData.rightPannels.push(firstRightPanel);
    }
  }
  // Convert to quickSettings
  let quickSettings;
  if (!liteMode) {
    quickSettings = {
      theme: oldData.profile,
      tabLogo: oldData.smpp_logo,
      performanceMode: !oldData.enableanimations,
      selection: oldData.overwrite_theme,
      link: oldData.link,
      blur: oldData.blur,
      news: oldData.news,
      quicks: oldData.quicks,
      type: oldData.weatherSelection,
      amount: oldData.weatherAmount,
      username: oldData.name_override,
    };
  } else {
    quickSettings = {
      theme: oldData.profile,
      tabLogo: oldData.smpp_logo,
      performanceMode: !oldData.enableanimations,
      selection: oldData.overwrite_theme,
      link: oldData.link,
      blur: oldData.blur,
      news: oldData.news,
      username: oldData.name_override,
      quicks: oldData.quicks,
    };
  }

  console.log("new data:", quickSettings, widgetData);

  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: quickSettings,
  });

  await browser.runtime.sendMessage({
    action: "setWidgetData",
    widgetData: widgetData,
  });

  window.localStorage.removeItem("settingsdata");
  migrateSettingsV2();
}

async function migrateV2() {
  migrateSettingsV2();
  migrateWidgetSettingsData();
  migrate;
}

async function migrateSettingsV2() {
  const data = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });
  let newSettingsData;
  if (!liteMode) {
    newSettingsData = {
      profile: {
        username: data.username,
        profilePicture: false,
      },
      appearance: {
        theme: data.theme,
        tabLogo: data.tabLogo,
        background: {
          selection: data.selection,
          link: data.link,
          blur: data.blur,
        },
        weatherOverlay: {
          type: data.type,
          amount: data.amount,
        },
      },
      topNav: {
        GO: false,
        search: false,
        GC: true,
        quickMenu: false,
        switchCoursesAndLinks: true,
        icons: {
          home: true,
          mail: true,
          notifications: true,
          settings: false,
        },
      },
      widgets: {
        news: data.news,
        delijn: {
          monochrome: false,
        },
      },
      other: {
        quicks: data.quicks,
        performanceMode: data.performanceMode,
      },
    };
  } else {
    newSettingsData = {
      profile: {
        username: data.username,
        profilePicture: false,
      },
      appearance: {
        theme: data.theme,
        tabLogo: data.tabLogo,
        background: {
          selection: data.selection,
          link: data.link,
          blur: data.blur,
        },
      },
      topNav: {
        GO: false,
        search: false,
        quickMenu: false,
        switchCoursesAndLinks: true,
        icons: {
          home: true,
          mail: true,
          notifications: true,
          settings: false,
        },
      },
      widgets: {
        news: data.news,
        delijn: {
          monochrome: true,
        },
      },
      other: {
        quicks: data.quicks,
        performanceMode: data.performanceMode,
      },
    };
  }
  await browser.runtime.sendMessage({
    action: "setSettingsData",
    data: newSettingsData,
  });
  console.log("migrated v2");
}

async function migrate() {
  await removeLegacyData(); // will reload the page if legacy data is present

  let settingsData = await browser.runtime.sendMessage({
    action: "getSettingsData",
  });

  if (settingsData.theme != null) {
    await migrateSettingsV2();
    settingsData = await browser.runtime.sendMessage({
      action: "getSettingsData",
    });
  }
}

async function removeLegacyData() {
  if (window.localStorage.getItem("settingsdata")) {
    await clearAllData();
  }
}
