let login_app_left = document.querySelector('.login-app__left');
let style = document.documentElement.style;
if (login_app_left != undefined) {
  login_app_left.innerHTML = ' ';
  document.getElementsByClassName('login-app__platform-indicator')[0].innerHTML = '<h1 class="logintitle">Smartschool ++</h1>';
  document.getElementsByClassName('login-app__title--separator')[0].innerHTML = `<h4 class="white_text_button" id="showmore">More</h4>`;
  document.getElementsByClassName('login-app__title--separator')[0].innerHTML = `<button type="button" class="white_text_button" id="showmore">More</button>`;
  document.getElementById('showmore').addEventListener('click', showmore)
  function showmore(){style.setProperty('--show-options', 'flex');}
}