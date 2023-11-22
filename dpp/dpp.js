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

let lesses=null;
function get_books_from_html() {
  if (lesses !== null){
    return true;
  }
  let lesses_els = document.querySelectorAll(".listItem");
  if (lesses_els.length == 0){
    return false;
  }
  console.log(lesses_els);
  
  lesses = {};
  for (let i = 0; i < lesses_els.length; i++) {
    const name = lesses_els[i].querySelector("span > p").innerText.toLowerCase();
    if (name == undefined || name.split(".").length != 3){
      continue; 
    }
    const func = lesses_els[i].click;
    lesses[name] = func;
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
  if (!get_lessen_from_html()){
    return false;
  }
  dmenu(Object.keys(lesses), function(cmd){
    open_url(lesses[cmd]);
  }, "les:");

  return true;
}

function quick_menu() {
  if (window.location.includes("boekentas/")){
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
    book_select_menu();
  }
});
