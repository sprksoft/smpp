function storeSpeed(){
  let slider = document.getElementById("speedslider").value 
  window.localStorage.setItem("snakespeed", slider)
  let speedMultiplier = Math.round(slider / 10)
  speedMultiplier /= 10
  speedMultiplier = speedMultiplier.toFixed(1)
  document.getElementById('speedmultiplier').innerText = `${speedMultiplier}x`
  window.localStorage.setItem("snakespeedmultiplier", speedMultiplier)
}
function loadSpeed(){
  let speed = window.localStorage.getItem("snakespeed")
  if (speed == undefined) {
    window.localStorage.setItem("snakespeed", 100)
    speed = window.localStorage.getItem("snakespeed")
  }
  document.getElementById("speedslider").value = speed
}
function setSnakeSpeed(){
  sliderElement =  document.getElementById("speedslider")
  sliderValue =  document.getElementById("speedslider").value 
  let speed = window.localStorage.getItem("snakespeed")
  document.getElementById('speedslider').addEventListener("input",
    storeSpeed)
  let speedMultiplier = Math.round(speed / 10)
  speedMultiplier /= 10
  speedMultiplier = speedMultiplier.toFixed(1)
  document.getElementById('speedmultiplier').innerText = `${speedMultiplier}x`
  window.localStorage.setItem("snakespeedmultiplier", speedMultiplier)
}
function startSnakeGame(){
  let div = document.createElement("div")
  let highscore = window.localStorage.getItem("snakehighscore")
  if (highscore == undefined) {
    window.localStorage.setItem("snakehighscore", 0)
    highscore = window.localStorage.getItem("snakehighscore")
  }
  document.getElementById("rightcontainer").appendChild(document.createElement("div"))
  let rightContainer = document.getElementById("rightcontainer")
  rightContainer.appendChild(div)
  div.innerHTML = `<div id=game-div><h2 class=gameover>Snake++</h2><p class=score>High Score: ${highscore}</p><button class="white_text_button" id="play_button">Play</button><p class=score>Speed:</p><div class="textandbutton"><input type="range" min="10" max="300" value="100" class="sliderblur" id="speedslider"><p id=speedmultiplier class=text_next_to_slider>1.5x</p></div></div>`
  loadSpeed()
  document.getElementById('play_button').addEventListener("click", () => {
    div.innerHTML = `<div id=game-div><canvas id=game-container></div>`
    snakeGame()
  })
  setSnakeSpeed()
}

function gameOver(score) {
  const gamediv = document.getElementById("game-div");
  gamediv.innerHTML = `<h2 class=gameover>Game Over!</h2><p class=score>Score: ${score}</p> <button class="white_text_button" id=tryagain>
  Try Again (Enter)</button><p class=score>Speed:</p><div class="textandbutton"><input type="range" min="10" max="300" value="100" class="sliderblur" id="speedslider"><p id=speedmultiplier class=text_next_to_slider>1.5x</p></div>`;
  loadSpeed()
  var enterKeyHandler = function (event) {
    if (event.key === "Enter") {
      gamediv.innerHTML = `<canvas id=game-container>`
      snakeGame()
      document.removeEventListener('keydown', enterKeyHandler);
    }
  };
  document.getElementById("tryagain").addEventListener("click", () => {
    gamediv.innerHTML = `<canvas id=game-container>`
    snakeGame()
  })
  if (score > window.localStorage.getItem("snakehighscore")) {
    window.localStorage.setItem("snakehighscore", score)
  }
  document.addEventListener('keydown', enterKeyHandler);
  setSnakeSpeed()
}

function snakeGame() {
  let style = document.documentElement.style;
  const canvas = document.getElementById('game-container');
  const ctx = canvas.getContext('2d');
  let score = 0
  const SNAKE_SIZE = 10;
  const numer_of_colums = 21
  const numer_of_rows = 21
  const WIDTH = numer_of_colums * SNAKE_SIZE * 2;
  const HEIGHT = numer_of_rows * SNAKE_SIZE * 2;
  const SNAKE_SPEED = 150 / window.localStorage.getItem("snakespeedmultiplier");
  const SNAKE_COLOR = style.getPropertyValue('--color-text');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  class Snake {
    constructor() {
      this.x = WIDTH / 2;
      this.y = HEIGHT / 2;
      this.direction = 'RIGHT';
      this.length = 1;
      this.body = [];
    }

    move() {
      if (this.direction === 'UP') {
        this.y -= 2 * SNAKE_SIZE;
      } else if (this.direction === 'DOWN') {
        this.y += 2 * SNAKE_SIZE;
      } else if (this.direction === 'LEFT') {
        this.x -= 2 * SNAKE_SIZE;
      } else if (this.direction === 'RIGHT') {
        this.x += 2 * SNAKE_SIZE;
      }
      if (this.x < 5 || this.x > WIDTH - 5 || this.y < 5 || this.y > HEIGHT - 5) {
        clearInterval(gameInterval);
        gameOver(score)
      }
    }
    draw() {
      ctx.fillStyle = SNAKE_COLOR;
      this.body.forEach(part => {
        ctx.beginPath();
        ctx.arc(part.x, part.y, SNAKE_SIZE, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
  const snake = new Snake();
  class Food {
    constructor() {
      this.generateNewPosition();
      this.color = style.getPropertyValue('--color-accent');
    }
    generateNewPosition() {
      let overlapping = true;
      while (overlapping) {
        this.x = Math.floor(Math.random() * numer_of_rows) * SNAKE_SIZE * 2 + SNAKE_SIZE;
        this.y = Math.floor(Math.random() * numer_of_colums) * SNAKE_SIZE * 2 + SNAKE_SIZE;
        overlapping = snake.body.some(part => part.x === this.x && part.y === this.y);
      }
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, SNAKE_SIZE, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  let food = new Food();
  function checkFood() {
    if (snake.x === food.x && snake.y === food.y) {
      snake.length++;
      food = new Food();
      score += 1;
    }
  }
  function checkCollision() {
    for (let i = 1; i < snake.body.length; i++) {

      if (snake.x === snake.body[i].x && snake.y === snake.body[i].y) {
        clearInterval(gameInterval);
        gameOver(score)

      }
    }
  }
  function gameLoop() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    snake.move();
    snake.body.unshift({ x: snake.x, y: snake.y });
    if (snake.body.length > snake.length) {
      snake.body.pop();
    }
    checkCollision()
    snake.draw();
    food.draw();
    checkFood();
  }
  let gameInterval = setInterval(gameLoop, SNAKE_SPEED);
  document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' && snake.direction !== 'RIGHT') {
      snake.direction = 'LEFT';
      event.preventDefault();
    } else if (event.key === 'ArrowRight' && snake.direction !== 'LEFT') {
      snake.direction = 'RIGHT';
      event.preventDefault();
    } else if (event.key === 'ArrowUp' && snake.direction !== 'DOWN') {
      snake.direction = 'UP';
      event.preventDefault();
    } else if (event.key === 'ArrowDown' && snake.direction !== 'UP') {
      snake.direction = 'DOWN';
      event.preventDefault();
    }
  });
}
