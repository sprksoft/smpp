/* vim:set shiftwidth=4: */

function updateLoginPanel() {
  let login_app_left = document.querySelector(".login-app__left");
  login_app_left.innerHTML = " ";

  document.getElementsByClassName(
    "login-app__platform-indicator"
  )[0].innerHTML = '<h1 class="logintitle">Smartschool ++</h1>';

  document.getElementsByClassName("login-app__title--separator")[0].innerHTML =
    '<button type="button" class="white_text_button" id="showmore">More</button>';

  document.getElementById("showmore").addEventListener("click", showmore);

  function showmore() {
    document.documentElement.style.setProperty("--show-options", "flex");
    document.getElementById("showmore").style.display = "none";
  }
}

function add_splash_text() {
  var login_app = document.querySelector(".login-app");
  var splash_text_element = document.createElement("div");
  login_app.prepend(splash_text_element);
  splash_text_element.classList.add("splashtextcontainer");
  splash_text_element.innerHTML = `<div class='splashtext'>${get_splash_text()}</div>`;
}

function removeSplashText() {
  document.querySelector("splashtextcontainer")?.remove();
}

let splashtexts = [
  `It even works under water!`,
  `Hoelang is een chinees.`,
  `404 Splashtext not found`,
  `Don't Smartschool \n and drive kids!`,
  `Home-made!`,
  `Pythagoras was used in this`, // where????
  `Like that smash button!`,
  `What <i>DOES</i> the fox say?`,
  `Supercalifragilisticexpialidocious!`,
  `Hottentotententententoonstelling`,
  `Not on steam!`,
  `Made in Belgium!`,
  `De L in frans \n staat voor leuk!`,
  `Doesn't contain nuts!`,
  `Glutenfree!!!`,
  `Colorblind approved!`,
  `Not vegan!`, // :O
  `Never gonna give you up ;)`,
  `The cake is a lie!`,
  `I know what you did...`,
  `Join de discord!`,
  `2 + 2 = 5`,
  `2 * 3 = 4`,
  `Listen to the \n Arctic Monkeys!`,
  `Global chat before GTA VI???`,
  `Water your plant(s)!`,
  `Check out Snake++!`,
  `Je suis une baguette`,
  `Dikke BMW!`,
  `Mand!`,
  `Net pindakaas gegeten dus...`,
  `BINGO!`,
  `GEKOLONISEERD!`,
  `pssst, its free real estate`,
  `Europapa!`,
  `Made by Sprksoft!`,
  `Made by Lukas`,
  `Made by Bjarne`,
  `Made by Sibe`,
  `Not made in China!`,
  `How did we get here?`,
  `Aboo?!`,
  `Check out Insym!`,
  `Do your homework!`,
  `Look mom I'm in \n the splashtext!`,
  `[Insert funny splashtext]`,
  `Totally not ripping off Minecraft!`,
  `Yippieeee`,
  `Chop Suey!`,
  `AAAAAAAAA!!!`,
  `Is tHaT a sUpRA?!?!`,
  `English or Spanish?`,
  `Jennifer eet matrassen! WTF?`,
  `Listen to Amélie Farren!`,
  `"How to exit VIM???"`,
  `Are ya vimming son?`,
  `It's either Spanish or vanish`,
  `Are you hacking??`,
  `:3`,
  `Ma alleee ik word \n gekilled door ne kerstboom!`,
  `<s>SQL</s>,<i> Squil</i> ✓`,
  `undefined is not a function`,
  `:p`,
  `I'm blue dabadie dabadaa`,
  `Chet jipitie`,
  `Bloat`,
  `MERGE CONFLICT!`,
  `In case of fire: git add . \n ; git commit ; git push`,
  `Always remove French language \npack: sudo rm -fr /`,
  `Undefined`,
  `Is tHaT A JOjO ReFEreNce?`,
  `https://ldev.eu.org`,
  `https://smartschoolplusplus.com`,
  `weak fingers`,
  `Beep beep I'm a sheep`,
  `I love yavascript !`,
  `Always take your maths kids`,
  `Gele auto!`,
  `LET ME OUTTT!!!`,
  `HELP`,
  `It's that <i>me</i> espresso!`,
  `You lied about your age, \ndidn't you?`,
  `Check out Undertale`,
  `Nobody expects the \n Spanish Inquisition!`,
  `Beans Beans Beans!`,
  `Baby Shark, doo-doo, \n doo-doo, doo-doo`,
  `Brood int frans`,
  `CORS >:(`,
  `Join our discord!`,
  `Le poisson Steve!`,
  `Il est oraaaange! \n Il a des bras.. et des jambes`,
  `Since Nov 14, 2023`,
  `Over 1000+ commits!`,
  `Took at least \n 5 hours to make!`,
  `Sometimes works!`,
  `Survive, Adapt, Overcome!`,
  `Rode auto!`,
  `Cookie clicker`,
  `Are you serious?`,
  `Breakout++`,
  `Ruby chan, haii!!`,
  `It's so sweet`,
  `Feeling diskinserted?`,
  `Vamipre in the corner.\nIs it scaring you off?`,
  `Whopper Whopper`,
  `<s>nginx</s>, <i>Enginks</i>`,
  `I love ECMAScript`
];
function get_splash_text() {
  return splashtexts[Math.floor(Math.random() * splashtexts.length)];
}
