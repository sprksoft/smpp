//tjafa scrieptje komt hier je weet wel
//ok - ldev
//oke logis - andere ldev

function unbloat() {
  document.body.innerHTML = '';
}

document.getElementsByClassName("login-app__left")[0].innerHTML = '';
function dmenu(params) {
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.remove("dmenu-hidden");
  dmenu.getElementsByTagName("input")[0].focus();
}
function dmenu_close() {
  let dmenu = document.getElementById("dmenu");
  dmenu.classList.add("dmenu-hidden");
}

function init_dmenu(){
  let dmenu = document.createElement("div");
  dmenu.id="dmenu";
  dmenu.classList.add("dmenu");
  dmenu.classList.add("dmenu-hidden");
  dmenu.innerHTML="<div class='top'><label class='dmenu-label'>dmenu:</label><input class='dmenu-input' type='text'></div>";
  document.body.insertBefore(dmenu, document.body.childNodes[-1]);
  dmenu.getElementsByTagName("input")[0].addEventListener("keydown", function(e)
    {
      if (e.key == "Enter"){
        dmenu_close();
      }else if (e.key == "Escape"){
        dmenu_close();
      }
    });

}

init_dmenu();
document.addEventListener("keyup", function(e){
  console.log(e);
  if (e.key == ':'){
    dmenu(["unbloat"]);
  }
});


document.getElementsByClassName("js-btn-logout")[0].innerHTML = "Logout -->"

async function get_all_scores() {
  let response = await fetch("https://takeerbergen.smartschool.be/results/api/v1/evaluations/");
  let json = await response.json();
  scores_class=[]
  json.forEach(async thing => {
    let scores = await get_scores(thing.identifier);
    scores_class.push({
      name: thing.name,
      scores: scores
    });
  });
  return scores_class;
}

async function get_scores(id){
  let responce = await fetch("https://takeerbergen.smartschool.be/results/api/v1/evaluations/"+id)
  let json = await responce.json();
  if (json === undefined){
    return [];
  }
  let scores=[];
  json.details.projectGoals.forEach(goal => {
    scores.push(goal.graphic.color);
  });
  return scores;
}
async function set_scores_on_thingys() {
  let scores = await get_all_scores();
  document.getElementsByClassName("evaluation-list-item").forEach(element => {
    element
  });
}
main()

