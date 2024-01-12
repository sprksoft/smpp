
function snakeGame(){
let div = document.createElement("div")
document.getElementById("rightcontainer").appendChild(document.createElement("div"))
let rightContainer = document.getElementById("rightcontainer")
console.log("rightcontainer:",rightContainer)
div.innerHTML = `<div><canvas id=game-container></canvas></div>`
rightContainer.appendChild(div)
console.log("div:",div)
console.log("rightcontainer:",rightContainer)
// Set up the canvas and context
    const canvas = document.getElementById('game-container');
    console.log(canvas)
    const ctx = canvas.getContext('2d');
    
    // Constants
    const WIDTH = 300;
    const HEIGHT = 325;
    const SNAKE_SIZE = 5;
    const SNAKE_SPEED = 500;
    const SNAKE_COLOR = 'green';
    
    // Set canvas dimensions
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    
    // Snake class
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
    
    // Create a new snake
    const snake = new Snake();
    
    // Game loop
    // Game loop
function gameLoop() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT); // Clear the canvas

  // Move and draw the snake
  snake.move();
  snake.body.unshift({ x: snake.x, y: snake.y }); // Add new head position to the front of the body array
  if (snake.body.length > snake.length) {
    snake.body.pop(); // Remove the last part of the snake's body
  }
  snake.draw();
}

// Start the game loop
let gameInterval = setInterval(gameLoop, SNAKE_SPEED);

// Handle keyboard input
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