// @ts-nocheck
function scrape_from_html(query, func) {
  const data = [];
  const scrapeEls = document.querySelectorAll(query);
  if (scrapeEls.length === 0) {
    return data;
  }

  for (const scrapeElement of scrapeEls) {
    func(scrapeElement, data);
  }

  return data;
}

function is_valid_data(data) {
  return !(data === undefined || data.length === 0 || data.length === undefined);
}

function scrape_data_if_needed(name, data, query, func, done_func) {
  if (is_valid_data(data)) {
    done_func(data);
    window.localStorage.setItem(name, JSON.stringify(data));
    return true;
  }

  const scrapedData = scrape_from_html(query, func);
  if (is_valid_data(scrapedData)) {
    done_func(scrapedData);
    window.localStorage.setItem(name, JSON.stringify(scrapedData));
    return true;
  }

  return false;
}

function _scrape(name, query, func, done_func, interval_time = 0) {
  const data = JSON.parse(window.localStorage.getItem(name));
  if (scrape_data_if_needed(name, data, query, func, done_func)) {
    return;
  }
  if (interval_time === 0) {
    return;
  }

  const interval = setInterval(() => {
    if (scrape_data_if_needed(name, data, query, func, done_func)) {
      clearInterval(interval);
    }
  }, interval_time);
}
