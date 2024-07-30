function add_splash_text(){
    console.log('added splash text')
    var login_app = document.querySelector('.login-app')
    var splash_text_element = document.createElement('div')
    login_app.prepend(splash_text_element)
    splash_text_element.classList.add('splashtextcontainer')
    splash_text_element.innerHTML = `<div class='splashtext'>${get_splash_text()}</div>`
}
let splashtexts = [
    `It even works under water!`,
    `minor alert`
]
function get_splash_text() {
    return splashtexts[Math.floor(Math.random() * splashtexts.length)]
}
if (window.location.href.split('/')[3]=="login"){
    add_splash_text()
}