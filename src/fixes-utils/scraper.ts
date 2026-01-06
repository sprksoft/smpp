// @ts-nocheck
function scrape_from_html(query, func) {
  data = [];
  let scrape_els = document.querySelectorAll(query);
  if (scrape_els.length == 0) {
    return data;
  }
  for (let i = 0; i < scrape_els.length; i++) {
    func(scrape_els[i], data);
  }

  return data;
}

function is_valid_data(data) {
  return !(data == undefined || data.length == 0 || data.length == undefined);
}

function scrape_data_if_needed(data, query, func, done_func) {
  if (is_valid_data(data)) {
    done_func(data);
    window.localStorage.setItem(name, JSON.stringify(data));
    return true;
  }

  data = scrape_from_html(query, func);
  if (is_valid_data(data)) {
    done_func(data);
    window.localStorage.setItem(name, JSON.stringify(data));
    return true;
  }

  return false;
}

function scrape(name, query, func, done_func, interval_time = 0) {
  let data = JSON.parse(window.localStorage.getItem(name));
  if (scrape_data_if_needed(data, query, func, done_func)) {
    return;
  }
  if (interval_time == 0) {
    return;
  }

  let interval = setInterval(() => {
    if (scrape_data_if_needed(data, query, func, done_func)) {
      clearInterval(interval);
    }
  }, interval_time);
}
