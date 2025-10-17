// deze file is bedoeld om geinject te worden, smsc te extracten en zichzelf te deleten, niet om gerunt te worden, zie createStaticGlobals() in main.js ...
(() => {
  let value;
  try {
    const v = window.SMSC;
    if (typeof v === "function") {
      value = v.toString();
    } else if (typeof v === "object") {
      value = JSON.parse(JSON.stringify(v));
    } else {
      value = v;
    }
  } catch (err) {
    value = `Error accessing SMSC: ${err.message}`;
  }

  window.postMessage({ type: "SMPP_SC", value }, "*");
})();
