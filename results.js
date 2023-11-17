

async function get_all_scores() {
  let response = await fetch("https://takeerbergen.smartschool.be/results/api/v1/evaluations/");
  let json = await response.json();
  scores_class=[]
  json.forEach(async thing => {
    let scores = await get_scores(thing.identifier);
    scores_class.push({
      scores: scores,
      name: thing.name,
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
    scores.push({
      name: goal.graphic.color,
      imgurl: "https://static6.smart-school.net/smsc/svg/bullet_square_blue/"+goal.graphic.value+"_24x24.svg",
    });
  });
  return scores;
}
async function set_scores_on_thingys() {
  try {
    let scores = await get_all_scores(); // Wait for the scores to be retrieved asynchronously
    let thingys = document.getElementsByClassName("evaluation-list-item");
    
    console.log("Array:", thingys); // Print out the "thingys" array before the loop
    
    for (let i = 0; i < thingys.length; i++) {
      let thingy = thingys[i];
      let name = thingy.querySelector(".evaluation-list-item__container > *").innerText;
      
      let score = get_score_from_list(scores, name);
      
      if (score && score.length > 0) { // Check if score is not undefined and has at least one element
        thingy.querySelector(".evaluation-graphic > .graphic--icon").style="background-image: url("+score[0].imgurl+")!important;";
      }
    }
    
    console.log("Final array length:", thingys.length);
  } catch (error) {
    console.error(error);
  }
}

set_scores_on_thingys();
