//Board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns;
let boardHeight = tileSize * rows;
let context;

//Ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
//Ship position
let shipX = (tileSize * columns) / 2 - tileSize; // Middle of the board - tileSize to center ship position
let shipY = tileSize * rows - tileSize * 2; //Two tile spaces above the bottom of the board

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight,
};

let shipImg;
let shipVelocityX = tileSize; // ship movement velocity = 1 tile

//Aliens
let alienGroup = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; // number of aliens on the board
let alienVelocityX = 1; // alien movement velocity

//Lasers
let laserArray = [];
let laserVelocityY = -10; // laser velocity moving up the board

//Scoreboard
let score = 0;
let gameOver = false;

window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d");

  //Draw ship
  shipImg = new Image();
  shipImg.src = "../Assets/ship.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  };

  //Draw alien
  alienImg = new Image();
  alienImg.src = "../Assets/alien.png";
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);
  document.addEventListener("keyup", shoot); // keyup = key needs to be released
};

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    // Stop game-update loop and show Game Over screen
    showGameOverScreen();
    return;
  }

  // clear old draw state
  context.clearRect(0, 0, board.width, board.height);

  //ship redraw
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  //alien redraw
  for (let i = 0; i < alienGroup.length; i++) {
    let alien = alienGroup[i];
    if (alien.alive) {
      //move alien to width (right)
      alien.x += alienVelocityX;

      // alien reaches borders
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2; // move aliens in sync

        //move aliens 1 row lower after touching the borders
        for (let j = 0; j < alienGroup.length; j++) {
          alienGroup[j].y += alienHeight;
        }
      }
      context.drawImage(alien.img, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) gameOver = true;
    }
  }

  // Lasers
  for (let i = 0; i < laserArray.length; i++) {
    let laser = laserArray[i];
    laser.y += laserVelocityY;

    // Draw lasers
    context.fillStyle = "white";
    context.fillRect(laser.x, laser.y, laser.width, laser.height);

    // Remove lasers that are off screen
    if (laser.y < 0) {
      laserArray.splice(i, 1);
      i--; // Decrease index to account for removed element
    }

    // Laser collision with aliens
    for (let j = 0; j < alienGroup.length; j++) {
      let alien = alienGroup[j];
      if (!laser.used && alien.alive && detectCollision(laser, alien)) {
        laser.used = true;
        alien.alive = false;
        alienCount--;
        score += 100;
      }
    }
  }

  //clear bullets
  while (laserArray.length > 0 && (laserArray[0].used || laserArray[0].y < 0)) {
    laserArray.shift(); // removes first element of the array
  }

  //next level
  if (alienCount == 0) {
    //increase the number of aliens in columns
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); // cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4); // cap at 16-4 = 12
    alienVelocityX += 0.2; // increase alien velocity
    alienGroup = [];
    laserArray = [];
    createAliens();
  }

  context.fillStyle = "white";
  context.font = "16px courier";
  context.fillText(score, 5, 20);
}

function moveShip(e) {
  if (gameOver) return;

  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX; // move left
  } else if (
    e.code == "ArrowRight" &&
    ship.x + shipVelocityX < board.width - tileSize
  ) {
    ship.x += shipVelocityX; // move right
  }
}

function createAliens() {
  const alienImages = [
    "../Assets/alien.png", // White alien
    "../Assets/alien-cyan.png", // Blue alien
    "../Assets/alien-magenta.png", // Pink alien
    "../Assets/alien-yellow.png", // Yellow alien
  ];

  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: new Image(),
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true,
      };

      // Choose image based on index
      alien.img.src = alienImages[(c + r) % alienImages.length];

      alienGroup.push(alien);
    }
  }
  alienCount = alienGroup.length;
}

function shoot(e) {
  if (gameOver) return;

  if (e.code == "Space") {
    //shoot
    let laser = {
      x: ship.x + ship.width * 0.5 - tileSize / 16, // Center laser above the ship
      y: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false,
    };
    laserArray.push(laser);
  }
}

function detectCollision(a, b) {
  return (
    a.x < b.x + b.width &&  // a top left corner collision b top right corner
    a.x + a.width > b.x &&  // a top right corner collision b top left corner
    a.y < b.y + b.height && // a top left corner collision b bottom left corner
    a.y + a.height > b.y    // a bottom left corner collision b top left corner
  );
}

function showGameOverScreen() {
  context.fillStyle = "red";
  context.font = "48px courier";
  context.fillText("Game Over", boardWidth / 2 - 100, boardHeight / 2);
  context.font = "24px courier";
  context.fillText(
    "Score: " + score,
    boardWidth / 2 - 60,
    boardHeight / 2 + 30
  );
  context.fillText(
    "Press R to Restart",
    boardWidth / 2 - 120,
    boardHeight / 2 + 60
  );
}

function restartGame() {
  score = 0;
  gameOver = false;
  alienCount = 0;
  alienGroup = [];
  laserArray = [];
  alienRows = 2;
  alienColumns = 3;
  alienVelocityX = 1;
  createAliens();
  requestAnimationFrame(update);
}

document.addEventListener("keydown", function (e) {
  if (gameOver && e.code === "KeyR") {
    restartGame();
  } else {
    moveShip(e);
  }
});
