if (browser == undefined) { var browser = chrome };
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveBackgroundImage') {
    browser.storage.local.set({ backgroundImage: message.data }, () => {
      console.log('Background image saved.');
    });
  }
});