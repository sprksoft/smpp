if(browser==undefined){var browser=chrome};
browser.runtime.onMessage.addListener(async (message) => {
    if (message === "count") {
      let items = await browser.storage.session.get({ myStoredCount: 101 });
      let count = items.myStoredCount;
      ++count;
      await browser.storage.session.set({ myStoredCount: count });
      return count;
    }
    console.log(message)
  });
  
  