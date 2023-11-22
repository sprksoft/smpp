let books=null;
function get_books_from_html() {
  if (books !== null){
    return true;
  }
  let boeken_els = document.querySelectorAll("#student-vt-2 > div > div > * > div > a");
  if (boeken_els.length == 0){
    return false;
  }
  console.log(boeken_els);
  
  books = {};
  for (let i = 0; i < boeken_els.length; i++) {
    const name = boeken_els[i].querySelector("h3").innerText.toLowerCase();
    const url = boeken_els[i].href;
    books[name] = url;
  }

  console.log(books);
  return true;
}

function get_lessen() {
  lessen = window.localStorage.getItem("lessen");
  console.log("getting lessen: "+lessen);
  return lessen;
}
function store_lessen() {
  console.log("storing lessen");
  window.localStorage.setItem("lessen", lessen);
}

let lesses=get_lessen();
function get_lessen_from_html() {
  if (lesses == null){
    lesses={};
  }
  let lesses_els = document.querySelectorAll(".listItem");
  if (lesses_els.length == 0){
    return false;
  }
  
  for (let i = 0; i < lesses_els.length; i++) {
    const name = lesses_els[i].querySelector("span > p").innerText.toLowerCase();
    if (name == undefined || name.split(".").length != 3){
      continue; 
    }
    lesses[name] = lesses_els[i];
  }

  console.log(lesses);
  return true;
}


function book_select_menu(){
  if (!get_books_from_html()){
    return false;
  }
  dmenu(Object.keys(books), function(cmd){
    open_url(books[cmd]);
  }, "boek:");

  return true;
}

function les_select_menu() {
  console.log(lessen);
  if (lessen == null){
    reload_lessen();
    return false;
  }
  dmenu(Object.keys(lesses), function(cmd){
    lesses[cmd].click();
  }, "les:");

  return true;
}

function quick_menu() {
  if (window.location.pathname.includes("boekentas/")){
    return les_select_menu();
  }else{
    return book_select_menu();
  }
  
}

let query = window.location.search;
if (query.includes("smpp=true")){
  console.log("from smpp");
  let interval = setInterval(() => {
     if (book_select_menu()){
      clearInterval(interval);
     }
  }, 1000);
}

document.addEventListener("keyup", function(e){
  if (e.key == ':'){
    quick_menu();
  }
  if (e.key == 'r'){
    reload_lessen();
  }
});



function reload_lessen(params) {
  let interval = setInterval(() => {
    let button = document.getElementById("student-vt-4_teacher-vt-4");
    if (button != undefined){
      button.click();
      get_lessen_from_html();
      if (button.disabled){
        store_lessen();
        clearInterval(interval);
      }
    }
  }, 500);
}
