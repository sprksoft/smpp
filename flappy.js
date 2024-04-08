let flappy_running = false;
let highscore = window.localStorage.getItem("flappyhighscore")
function storeFlappySpeed() {
    let slider = document.getElementById("flappyspeedslider").value;
    console.log(slider)
    if (slider == 300 && highscore == 911){
        document.getElementById('flappytitle').innerText = "FREE Bird++";
        console.log("should be fREE bird now")
    }
    else if (slider == 300 && highscore != 911) {
        document.getElementById('flappytitle').innerText = "Free Bird++";
        console.log("should be free bird now")
        }
      
    else {
        document.getElementById('flappytitle').innerText = "Flappy Bird++";
      }
    window.localStorage.setItem("flappyspeed", slider);
    let speedMultiplier = Math.round(slider / 10);
    speedMultiplier /= 10;
    speedMultiplier = speedMultiplier.toFixed(1);
    document.getElementById('flappyspeedmultiplier').innerText = `${speedMultiplier}x`;
    window.localStorage.setItem("flappyspeedmultiplier", speedMultiplier);
  }
  function loadFlappySpeed() {
    let speed = window.localStorage.getItem("flappyspeed")
    if (speed == undefined) {
      window.localStorage.setItem("flappyspeed", 100)
      speed = window.localStorage.getItem("flappyspeed")
    }
    document.getElementById("flappyspeedslider").value = speed
  }
  function setFlappySpeed() {
    sliderElement = document.getElementById("flappyspeedslider");
    sliderValue = document.getElementById("flappyspeedslider").value;
    let speed = window.localStorage.getItem("flappyspeed");
    document.getElementById('flappyspeedslider').addEventListener("input", storeFlappySpeed);
    let speedMultiplier = Math.round(speed / 10);
    speedMultiplier /= 10;
    speedMultiplier = speedMultiplier.toFixed(1);
    document.getElementById('flappyspeedmultiplier').innerText = `${speedMultiplier}x`;
    window.localStorage.setItem("flappyspeedmultiplier", speedMultiplier);
    if (sliderValue == 300) {
        document.getElementById('flappytitle').innerText = "Free Bird++";
    } else {
        document.getElementById('flappytitle').innerText = "Flappy Bird++";
    }
  }
function startFlappyGame() {
    let div = document.createElement("div")
    let highscore = window.localStorage.getItem("flappyhighscore")
    if (highscore == undefined) {
        window.localStorage.setItem("flappyhighscore", 0)
        highscore = window.localStorage.getItem("flappyhighscore")
    }
    document.getElementById("weathercontainer").appendChild(document.createElement("div"))
    let rightContainer = document.getElementById("weathercontainer")
    rightContainer.appendChild(div)

        div.innerHTML = `<div id=flappy-game-div><h2 class=gameover id=flappytitle>Flappy Bird++</h2><p class=score>High Score: ${highscore}</p><button class="white_text_button" id="flappy_play_button">Play</button><p class=score></p><p class=score>Speed:</p><div class="textandbutton"><input type="range" min="10" max="300" value="100" class="sliderblur speedslider" id="flappyspeedslider"><p id=flappyspeedmultiplier class=text_next_to_slider>1.5x</p></div>`
        loadFlappySpeed()
        document.getElementById('flappy_play_button').addEventListener("click", () => {
        console.log(div);
        div.innerHTML = '<div id="flappy-game-div"><canvas id="flappy-game-container"></div>';
        console.log(div);
        flappyGame()
    });
    setFlappySpeed()
}

function flappyGameOver(score = 0) {
    const gamediv = document.getElementById("flappy-game-div");
    gamediv.innerHTML = `<h2 class=gameover id=flappytitle>Game Over!</h2><p class=score>Score: ${score}</p> <button class="white_text_button" id=flappytryagain>
    Try Again (Space)</button><p class=score></p><p class=score>Speed:</p><div class="textandbutton"><input type="range" min="10" max="300" value="100" class="sliderblur speedslider" id="flappyspeedslider"><p id=flappyspeedmultiplier class=text_next_to_slider>1.5x</p>
    `;
    loadFlappySpeed()
    var enterKeyHandler = function (event) {
        if (event.code === "Space") {
            gamediv.innerHTML = `<canvas id="flappy-game-container">`
            flappyGame()
            document.removeEventListener('keydown', enterKeyHandler);
        }
    };
    document.getElementById("flappytryagain").addEventListener("click", () => {
        gamediv.innerHTML = `<canvas id="flappy-game-container">`
        document.removeEventListener('keydown', enterKeyHandler);
        flappyGame()
    });
    if (score > window.localStorage.getItem("flappyhighscore")) {
        window.localStorage.setItem("flappyhighscore", score)
    }
    document.addEventListener('keydown', enterKeyHandler);
    setFlappySpeed()
}

function flappyGame() {
    if (flappy_running) {
        return
    }

    flappy_running = true;

    const canvas = document.getElementById('flappy-game-container');
    const ctx = canvas.getContext('2d');

    canvas.width = 420;
    canvas.height = 420;
    let flappyspeed = window.localStorage.getItem("flappyspeed")
    const lineWidth = 6;
    let pipes = [];
    let birdX = canvas.width / 4;
    let birdY = 110;
    let bgX = 0;
    let gravity = 0.5;
    let gravitySpeed = 0.2

    const pipeGap = 65
    const pipeSpeed = (flappyspeed/100) * 3;

    let score = 0;
    const pipeWidth = lineWidth * 3;
    const color = document.documentElement.style.getPropertyValue('--color-accent');
    const birdColor = document.documentElement.style.getPropertyValue('--color-text');

    class Pipe {
        constructor() {
            this.y = Math.random() * (canvas.height - 90) + 20;
            this.x = canvas.width;
            this.didScored = false;
        }
        update() {
            this.x -= pipeSpeed;
            if (this.x < birdX) {
                if (!this.didScored) {
                    this.didScored = true;
                    score++;
                }
            }
            if (this.x < -pipeWidth) {
                this.x = canvas.width;
                this.y = Math.random() * (canvas.height - 90) + 20;
                this.didScored = false;
            }
        }
        draw() {
            ctx.fillStyle = color;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.roundRect(this.x, -10, pipeWidth, this.y, 10);
            ctx.fill();
            ctx.beginPath();
            ctx.roundRect(this.x, this.y + pipeGap, pipeWidth, canvas.height - 15 - (this.y + pipeGap), [10, 10, 0, 0]);
            ctx.fill();
        }
    }


    function tickAndRenderBird() {
        birdY += gravity;
        ctx.fillStyle = birdColor;
        ctx.beginPath();
        ctx.arc(birdX - lineWidth, birdY - lineWidth, lineWidth, 0, 2 * Math.PI);
        ctx.fill();
    }

    function tickAndRenderPipes() {
        pipes.forEach((pipe) => {
            pipe.update();
            pipe.draw();
        });
    }

    function drawGround() {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 15);
        ctx.lineTo(canvas.width, canvas.height - 15);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.strokeStyle = document.documentElement.style.getPropertyValue('--color-base01');
        ctx.fillRect(0, canvas.height - 15, canvas.width, 15);
        ctx.strokeRect(0, canvas.height - 15, canvas.width, 15);

        for (let i = 0; i < (canvas.width / 20) * 2; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 20 + bgX, canvas.height - 15);
            ctx.lineTo(i * 20 + bgX + 15, canvas.height);
            ctx.stroke();
        }
    }

    function checkDead() {
        if (birdY - 1 + lineWidth * 2 > 405) {
            // console.log('BIRD TO LOW!');
            return true;
        }
        for (let i = 0; i < pipes.length; i++) {
            let pipe = pipes[i];
            if (birdX > pipe.x && birdX < pipe.x + pipeWidth && (birdY < pipe.y || birdY > pipe.y + pipeGap)) {
                // console.log('Poor pipe...');
                return true;
            }
        };
        return false;
    }

    pipes.push(new Pipe());

    function tick() {
        // console.log("tick");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        gravity += gravitySpeed;
        bgX = (bgX - 5) % canvas.width;
        tickAndRenderBird();
        tickAndRenderPipes();
        drawGround();

        if (!checkDead()) {
            requestAnimationFrame(tick);
        } else {
            setTimeout(() => {
                flappyGameOver(score);
                flappy_running = false;
                return;
            }, 500);
            return;
        }
    }

    tick();

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            gravity = -4;
        }
    });
}