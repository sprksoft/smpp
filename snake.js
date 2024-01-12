function gameOver() {
  // Display game over message
  const gameOverMessage = document.createElement('div');
  gameOverMessage.innerHTML = '<h2>Game Over!</h2><p>Press F5 to restart.</p>';
  gameOverMessage.style.textAlign = 'center';
  gameOverMessage.style.position = 'absolute';
  document.getElementById('rightcontainer').appendChild(gameOverMessage);

  // Stop the game loop
  clearInterval(gameInterval);

  // Remove keyboard input listener
  document.removeEventListener('keydown', handleKeyPress);
}

function handleKeyPress(event) {
  // Handle keyboard input
  if (event.key === 'ArrowUp') {

    document.getElementById('rightcontainer').innerHTML = '';
    snakeGame();
  }
}
function snakeGame(){
let div = document.createElement("div")
document.getElementById("rightcontainer").appendChild(document.createElement("div"))
let rightContainer = document.getElementById("rightcontainer")
console.log("rightcontainer:",rightContainer)
div.innerHTML = `<div class=game-div><canvas id=game-container></div>`
rightContainer.appendChild(div)
console.log("div:",div)
console.log("rightcontainer:",rightContainer)

    const canvas = document.getElementById('game-container');
    console.log(canvas)
    const ctx = canvas.getContext('2d');

    const SNAKE_SIZE = 10;
    const numer_of_colums = 21
    const numer_of_rows = 21
    const WIDTH = numer_of_colums * SNAKE_SIZE * 2;
    const HEIGHT = numer_of_rows * SNAKE_SIZE * 2;
    const SNAKE_SPEED = 100;
    const SNAKE_COLOR = 'black';

    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    class Food {
      constructor() {
        this.x = Math.floor(Math.random() * numer_of_rows) * SNAKE_SIZE*2 + SNAKE_SIZE; // Random x position in multiples of 10
        this.y = Math.floor(Math.random() * numer_of_colums) * SNAKE_SIZE*2 + SNAKE_SIZE; // Random y position in multiples of 10
        this.color = 'red';
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
        if (this.x < 5 || this.x > WIDTH-5 || this.y < 5 || this.y > HEIGHT-5) {
          clearInterval(gameInterval); 
          console.log('Game Over: Boundary hit');
          gameOver()
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
          gameOver()

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


