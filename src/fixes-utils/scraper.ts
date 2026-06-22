function scrape_from_html(query: string, func: (el: Element, data: any[]) => void) {
  const data: any[] = [];
  const scrape_els = document.querySelectorAll(query);
  if (scrape_els.length === 0) return data;

  for (const el of scrape_els) {
    func(el, data);
  }

  return data;
}

function is_valid_data(data: any[]): boolean {
  return !(data == undefined || data.length == 0 || data.length == undefined);
}

function scrape_data_if_needed(name: string, data: any[], query: string, func: (el: Element, data: any[]) => void, done_func: (data: any[]) => void): boolean {
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

function scrape(name: string, query: string, func: (el: Element, data: any[]) => void, done_func: (data: any[]) => void, interval_time = 0) {
  const stored = window.localStorage.getItem(name);
  let data: any[] = stored ? JSON.parse(stored) : [];

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
