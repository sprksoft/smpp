/* vim:set shiftwidth=4: */

function add_splash_text() {
    var login_app = document.querySelector('.login-app')
    var splash_text_element = document.createElement('div')
    login_app.prepend(splash_text_element)
    splash_text_element.classList.add('splashtextcontainer')
    splash_text_element.innerHTML = `<div class='splashtext'>${get_splash_text()}</div>`
}
let splashtexts = [
    `It even works under water!`,
    `Hoelang is een chinees.`,
    `404 Splashtext not found`,
    `Don't Smartschool \n and drive kids!`,
    `Home-made!`,
    `Pythagoras was used in this`, // where????
    `Like that smash button!`,
    `What DOES the fox say?`,
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
    `+1000 aura`,
    `What in the skibidi sigma?!`,
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
    `Ma aleee ik word \ngekilled door ne kerstboom!`,
    `<s>SQL</s>,<i> Squil</i> ✓`,
    `undefined is not a function`,
    `:p`,
    `I'm blue dabadie dabadaa`,
    `Chet jipitie`,
    `Bloat`,
    `MERGE CONFLICT!`,
    `In case of fire: git add . \n ; git commit ; git push`,
    `Always remove French language \npack: sudo rm -fr /`,
    undefined,
    `Is tHaT A JOjO ReFEreNce?`,
    `https://ldev.eu.org`,
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
    `Oh No! anyways`,
    `Nobody expects the \n Spanish Inquisition!`,
    `Beans Beans Beans!`,
    `Baby Shark, doo-doo, \n doo-doo, doo-doo`,
    `Brood int frans`,
    `CORS >:(`,
    `We have a discord!`
]
function get_splash_text() {
    return splashtexts[Math.floor(Math.random() * splashtexts.length)]
}
if (window.location.href.split('/')[3] == "login") {
    add_splash_text()
}

