function startSnakeGame() {
  let div = document.createElement("div")
  let highscore = window.localStorage.getItem("snakehighscore")
  if (highscore == undefined) {
    window.localStorage.setItem("snakehighscore", 0)
    highscore = window.localStorage.getItem("snakehighscore")
  }
  document.getElementById("rightcontainer").appendChild(document.createElement("div"))
  let rightContainer = document.getElementById("rightcontainer")
  rightContainer.appendChild(div)
  div.innerHTML = `<div id=game-div><h2 class=gameover>Snake++</h2><p class=score>High Score: ${highscore}</p><button class="white_text_button" id="play_button">Play</button></div>`
  document.getElementById('play_button').addEventListener("click", () => {
    div.innerHTML = `<div id=game-div><canvas id=game-container></div>`
    snakeGame()
  })
}

function gameOver(score) {
  // Display game over message
  const gamediv = document.getElementById("game-div");
  gamediv.innerHTML = `<h2 class=gameover>Game Over!</h2><p class=score>Score: ${score}</p> <button class="white_text_button" id=tryagain>
  Try Again (Enter)</button>`;
  // Stop the game loop
  var enterKeyHandler = function (event) {
    if (event.key === "Enter") {
      gamediv.innerHTML = `<canvas id=game-container>`
      snakeGame()
      // Remove the event listener when the game starts
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

}

function snakeGame() {
  let style = document.documentElement.style;
  const canvas = document.getElementById('game-container');
  console.log(canvas)
  const ctx = canvas.getContext('2d');
  let score = 0
  const SNAKE_SIZE = 10;
  const numer_of_colums = 21
  const numer_of_rows = 21
  const WIDTH = numer_of_colums * SNAKE_SIZE * 2;
  const HEIGHT = numer_of_rows * SNAKE_SIZE * 2;
  const SNAKE_SPEED = 100;
  const SNAKE_COLOR = style.getPropertyValue('--color-text');

  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  class Food {
    constructor() {
      this.x = Math.floor(Math.random() * numer_of_rows) * SNAKE_SIZE * 2 + SNAKE_SIZE; // Random x position in multiples of 10
      this.y = Math.floor(Math.random() * numer_of_colums) * SNAKE_SIZE * 2 + SNAKE_SIZE; // Random y position in multiples of 10
      this.color = style.getPropertyValue('--color-accent');
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
        console.log('Game Over: Boundary hit');
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
  function checkCollision() {
    for (let i = 1; i < snake.body.length; i++) {

      if (snake.x === snake.body[i].x && snake.y === snake.body[i].y) {
        clearInterval(gameInterval);
        console.log('Game Over: Self collision');
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
    } else if (event.key === 'ArrowRight' && snake.direction !== 'LEFT') {
      snake.direction = 'RIGHT';
    } else if (event.key === 'ArrowUp' && snake.direction !== 'DOWN') {
      snake.direction = 'UP';
    } else if (event.key === 'ArrowDown' && snake.direction !== 'UP') {
      snake.direction = 'DOWN';
    }
  });
}


