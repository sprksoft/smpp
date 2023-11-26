
function scrape_from_html(data, query, func) {
  if (data == undefined){
    data = {}
  }
  let scrape_els = document.querySelectorAll(query);
  if (scrape_els.length == 0){
    return data;
  }
  for (let i = 0; i < scrape_els.length; i++) {
    func(scrape_els[i], data);
  }

  return data;
}

function get_data(name, query, func) {
  let data = window.localStorage.getItem(name);
  if (data == undefined){
    data = scrape_from_html(data, query, func);
  }
  window.localStorage.setItem(name, data);
  return data;
}
