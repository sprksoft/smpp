let div = document.createElement
let rightContainer = document.getElementById("rightcontainer")
rightContainer.appendChild(div)
div.innerHTML = `<div id= game-container></div>`
document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('game-container');
    const gridSize = 20;
    const snake = [{ x: 5, y: 5 }];
    const direction = { x: 1, y: 0 };

    function update() {
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };
        snake.unshift(head);

        // Check for collision with the boundaries
        if (head.x < 0 || head.x >= gameContainer.clientWidth / gridSize || head.y < 0 || head.y >= gameContainer.clientHeight / gridSize) {
            // Game over logic - you might want to display a message or restart the game
            alert('Game Over!');
            resetGame();
            return;
        }

        // Render the snake
        render();
    }

    function render() {
        // Clear the previous frame
        gameContainer.innerHTML = '';

        // Draw the snake
        snake.forEach(segment => {
            const segmentElement = document.createElement('div');
            segmentElement.className = 'snake-segment';
            segmentElement.style.left = segment.x * gridSize + 'px';
            segmentElement.style.top = segment.y * gridSize + 'px';
            gameContainer.appendChild(segmentElement);
        });
    }

    function resetGame() {
        // Reset snake to initial position
        snake.length = 1;
        snake[0] = { x: 5, y: 5 };
        // Reset direction
        direction.x = 1;
        direction.y = 0;
    }

    function gameLoop() {
        update();
        setTimeout(gameLoop, 100); // Adjust the speed of the game by changing the delay
    }

    // Start the game loop
    gameLoop();
});
