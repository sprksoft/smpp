
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
  let data = JSON.parse(window.localStorage.getItem(name));
  if ( data == undefined || Object.keys(data).length == 0 ){
    data = scrape_from_html(data, query, func);
  }
  window.localStorage.setItem(name, JSON.stringify(data));
  return data;
}

function get_data_bg(name, query, func, set_func, interval_time=3000) {
  data = get_data(name, query, func);
  set_func(data);
  let interval = setInterval(() => {
    data = get_data(name, query, func);
    set_func(data);
    if (Object.keys(data).length != 0){
      clearInterval(interval);
      console.log("stop scrape "+name);
    }
  }, interval_time);
}
