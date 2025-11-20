var gameChar_x;
var gameChar_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var clouds;
var mountains;
var trees_x;
var collectables;
var canyons;

var eyes;
var game_score;
var flagpole;
var lives;

var gameStarted = false;
var platforms = [];      // platform objects
var platformDefs = [];   // editable placements

// Convert character screen X to WORLD X
function charWorldX() {
  return gameChar_x - scrollPos; 
}


// Find the platform the character is standing on
function SupportingPlatform() {
  var worldx = charWorldX();
  for (var i = 0; i < platforms.length; i++) {
    if (platforms[i].checkContact(worldx, gameChar_y, 7)) {
      return platforms[i];
    }
  }
  return null;
}

function setup() {
    createCanvas(1024, 576);
    floorPos_y = height * 3 / 4;
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;

    trees_x = [60, 250, 450, 690, 800]; // tree array

    clouds = [
    { x_pos: 200, y_pos: 100, width: 70 },
    { x_pos: 500, y_pos: 150, width: 90 },
    { x_pos: 800, y_pos: 120, width: 60 }
    ]; // cloud array

    mountains = [
    { x_pos: 120, y_pos: floorPos_y, width: 120, height: 160 },
    { x_pos: 500, y_pos: floorPos_y, width: 180, height: 220 },
    { x_pos: 850, y_pos: floorPos_y, width: 100, height: 140 }
    ]; // mountain array

    canyons = [
    { x_pos: 300, width: 100 },
    { x_pos: 740, width: 50 },
    { x_pos: 950, width: 120 }
    ];
    
    collectables = [
    { x_pos: 300, y_pos: floorPos_y - 100, size: 50, isFound: false },
    { x_pos: 680, y_pos: floorPos_y - 220, size: 50, isFound: false },
    { x_pos: 850, y_pos: floorPos_y - 30, size: 50, isFound: false }
    ];

    gameScore = 0;

    flagpole = { isReached: false, x_pos: 0, y_pos: 0, height: 180, raise: 0, speed: 3, CoinsHint: false };

    // platform placements
    platformDefs = [
    createPlatform(420, floorPos_y - 130, 120),
    createPlatform(620, floorPos_y - 190, 80),
    createPlatform(270, floorPos_y - 215, 110),
    createPlatform(250, floorPos_y - 70, 100),
    ];

    // build platform objects
    platforms = platformDefs.map(function (d) {
        return createPlatform(d.x, d.y, d.length);
    });

    // places flag on the 3rd platform (x=270)
    var target = platforms[2];           
    flagpole.x_pos = target.x + target.length / 2; // center the flag horizontally
    flagpole.y_pos = target.y;           

    // enemies
    enemies = [];

    // horizontal enemy
    enemies.push(new EnemyH(600, 820, floorPos_y - 200, 2.0, 26));

    // vertical enemy
    enemies.push(new EnemyV(400, floorPos_y - 380, floorPos_y, 1.4, 26));

    lives = 3;
    startGame();

}

function draw() {

    if (!gameStarted) {
        push();                           // save drawing state

        background(100, 155, 255);
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(28);
        text("Collect all the coins 🪙, then reach the flag 🚩!", width/2, height/2 - 40);
        text("Avoid the evil red circle 🔴 and blue square 🟦!", width/2, height/2);
        textSize(20);
        text("Click anywhere to start", width/2, height/2 + 60);

        pop();                            // restore previous state
        // HUD defaults
        textAlign(LEFT, BASELINE);
        textSize(20);

        return;                           
    }

    if (lives <= 0) {
        textSize(32);
        fill(255);
        text("Game Over", width / 2 - 80, height / 2);
        noLoop();
        return;
    }

    if (lives <= 0 || levelComplete()) {
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;
    }   

    background(100, 155, 255); // sky

    cameraPosX = gameChar_x - width / 2;
    gameChar_world_x = cameraPosX + width / 2;

    noStroke();
    fill(0, 155, 0);
    rect(0, floorPos_y, width, height - floorPos_y); // ground

    // camera start
    push();
    translate(-cameraPosX, 0);

    // score
    fill(0);
    noStroke();
    textSize(20);
    text("Score: " + gameScore, cameraPosX + 20, 30);

    // draw trees
    drawTrees();

    // draw clouds
    drawClouds();

    // draw mountains
    drawMountains();

    // draw canyon
    for (var i = 0; i < canyons.length; i++) {
    drawCanyon(canyons[i]);
    checkCanyon(canyons[i]);
    }

    // draw platforms
    platforms.forEach(function (p) { p.draw(scrollPos); });

    // draw collectable
    for (var i = 0; i < collectables.length; i++) {
        if (!collectables[i].isFound) {
            drawCollectable(collectables[i]);
        }
        checkCollectable(collectables[i]);
    }

    // enemy collision check
    if (lives > 0 && !levelComplete() && enemies && enemies.length) {
        const worldX = charWorldX();
        var hit = false;

        for (var i = 0; i < enemies.length; i++) {
            if (enemies[i].checkContact(worldX, gameChar_y, 10)) {
            hit = true;
            break;
            }
        }

        if (hit) {
            lives -= 1;
            if (SoundFX.hit) SoundFX.hit.play();
            if (lives > 0) {
                startGame();   // respawn
                return;        // stop the rest of this frame
            } else {
            isLeft = isRight = isFalling = isPlummeting = false;
            }
        }
    }

    // flag logic
    checkFlagpole();                             // sets flagpole.isReached when character is up there
    if (flagpole.isReached) {
        flagpole.raise = min(flagpole.raise + flagpole.speed, flagpole.height);
    }


    renderFlagpole();
    checkPlayerDie();
    drawGameChar();
    
    
    for (var i = 0; i < lives; i++) {
    fill(255, 0, 0);
    ellipse(gameChar_x - 485 + i * 30, 60, 20); // spacing
    }

    for (var i = 0; i < enemies.length; i++) {
        enemies[i].draw(scrollPos);
    }

    pop(); // camera end 

    if (flagpole.CoinsHint && !flagpole.isReached) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(20);
        text("Collect all coins first!", width / 2, height / 2);
        textAlign(LEFT, BASELINE); // restore defaults if your UI expects them
    }

    if (isPlummeting) {
        gameChar_y += 5;
    } else {
        // Movement
        if (isLeft) { gameChar_x -= 5; }
        if (isRight) { gameChar_x += 5; }

        // platform support
        var worldx = gameChar_x - scrollPos;

        // find a supporting platform
        var supporting = null;
        for (var i = 0; i < platforms.length; i++) {
            if (platforms[i].checkContact(worldx, gameChar_y, 7)) { // small tolerance
                supporting = platforms[i];
                break;
            }
        }

        if (supporting) {
            // stand on platform
            gameChar_y = supporting.y;   // snap feet to platform top
            isFalling = false;
        } else if (gameChar_y < floorPos_y) {
            // in the air: apply gravity
            gameChar_y += 2;
            isFalling = true;
        } else {
            // on ground
            gameChar_y = floorPos_y;
            isFalling = false;
        }
    }

    if (levelComplete()){

        if (SoundFX.flag && !SoundFX.flag.isPlaying()) {
        SoundFX.flag.play();
    }

        fill(255);
        textSize(32);
        text("Level Complete", width / 2 - 100, height / 2 - 50);
    }
}

function drawGameChar() {
    // hat
    fill(255, 0, 0);
    triangle(
  		gameChar_x - 5, gameChar_y - 60,
  		gameChar_x + 5, gameChar_y - 60,
  		gameChar_x, gameChar_y - 70
	);
    // body + arms + legs
    if (isLeft && isFalling) {              // jumping left
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);        // body
        fill(60);
        rect(gameChar_x - 9, gameChar_y - 8, 6, 8);            // legs
        rect(gameChar_x + 3, gameChar_y - 8, 6, 8);
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 36, 5, 16);         // arms up
        rect(gameChar_x + 10, gameChar_y - 32, 5, 16);

    } else if (isRight && isFalling) {      // jumping right
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);
        fill(60);
        rect(gameChar_x - 9, gameChar_y - 8, 6, 8);
        rect(gameChar_x + 3, gameChar_y - 8, 6, 8);
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 32, 5, 16);         // arms up
        rect(gameChar_x + 10, gameChar_y - 36, 5, 16);

    } else if (isLeft) {                     // walking left
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);
        fill(60);
        rect(gameChar_x - 11, gameChar_y - 10, 6, 10);         // left leg forward
        rect(gameChar_x + 3,  gameChar_y - 8,  6,  8);         // right leg back
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 30, 5, 16);         // left arm down
        rect(gameChar_x + 10, gameChar_y - 26, 5, 16);         // right arm up

    } else if (isRight) {                    // walking right
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);
        fill(60);
        rect(gameChar_x - 9,  gameChar_y - 8,  6,  8);         // left leg back
        rect(gameChar_x + 5,  gameChar_y - 10, 6, 10);         // right leg forward
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 26, 5, 16);         // left arm up
        rect(gameChar_x + 10, gameChar_y - 30, 5, 16);         // right arm down

    } else if (isFalling || isPlummeting) {  // jumping
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);
        fill(60);
        rect(gameChar_x - 9, gameChar_y - 8, 6, 8);            // legs
        rect(gameChar_x + 3, gameChar_y - 8, 6, 8);
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 34, 5, 16);         // darms up
        rect(gameChar_x + 10, gameChar_y - 34, 5, 16);

    } else {                                 // standing
        fill(0);
        rect(gameChar_x - 10, gameChar_y - 40, 20, 40);
        fill(60);
        rect(gameChar_x - 9,  gameChar_y - 10, 6, 10);         // straight legs
        rect(gameChar_x + 3,  gameChar_y - 10, 6, 10);
        fill(255, 200, 200);
        rect(gameChar_x - 15, gameChar_y - 28, 5, 16);         // arms down
        rect(gameChar_x + 10, gameChar_y - 28, 5, 16);
    }

    fill(255, 200, 200); // head
    ellipse(gameChar_x, gameChar_y - 50, 20, 20);

    // eyes
    var eyes;
    if (isLeft) {
    eyes = -1.5;
    } else if (isRight) {
    eyes = 1.5;
    } else {
    eyes = 0;
    } // eye movement
    fill(0);
    ellipse(gameChar_x - 4 + eyes, gameChar_y - 52, 2.5, 2.5); // left eye
    ellipse(gameChar_x + 4 + eyes, gameChar_y - 52, 2.5, 2.5); // right eye

    noFill();
    stroke(0);
    strokeWeight(2);
    arc(gameChar_x, gameChar_y - 48, 10, 8, 0, PI); // smile 
    noStroke();

    }

// handle key press events
function keyPressed() {
    if (lives <= 0 || levelComplete()) return;

    if (keyCode == 65 && !isPlummeting) {
        isLeft = true;
    }
    else if (keyCode == 68 && !isPlummeting) {
        isRight = true;
    }
    else if (keyCode == 32 && !isPlummeting) {
    var onGround = (gameChar_y === floorPos_y);

    // check if standing on a platform
    var onPlat = false;
    for (var i = 0; i < platforms.length; i++) {
        if (platforms[i].checkContact(gameChar_x - scrollPos, gameChar_y, 7)) {
            onPlat = true;
            break;
        }
    }

        if (!isFalling && (onGround || onPlat)) {
            gameChar_y -= 100;   // jump 
        }

          if (SoundFX.jump && SoundFX.jump.isLoaded()) {
            SoundFX.jump.play();
        }
    }
}

function keyReleased() {
    if (keyCode == 65) {
        isLeft = false;
    }
    else if (keyCode == 68) {
        isRight = false;
    }
}

function drawClouds() {
    for (var i = 0; i < clouds.length; i++) {
        var c = clouds[i];

        fill(255);
        ellipse(c.x_pos, c.y_pos, c.width / 2);
        ellipse(c.x_pos + 30, c.y_pos, c.width / 2);
        ellipse(c.x_pos + 15, c.y_pos - 10, c.width / 2);
    }
}

function drawMountains() {
    for (var i = 0; i < mountains.length; i++) {
        var m = mountains[i];
        
        fill(128);
        triangle(m.x_pos, m.y_pos, m.x_pos + m.width / 2, m.y_pos - m.height, m.x_pos + m.width, m.y_pos);

        fill(255);
        triangle(m.x_pos + m.width / 2 - 10, m.y_pos - m.height + 20, m.x_pos + m.width / 2,
        m.y_pos - m.height, m.x_pos + m.width / 2 + 10, m.y_pos - m.height + 20);
    }
}

function drawTrees() {
    for (var i = 0; i < trees_x.length; i++) {
    var tree_x = trees_x[i];

    // tree trunk
    fill(120, 100, 40);
    rect(tree_x, floorPos_y - 120, 40, 120);

    // tree canopy - lower (larger) triangle
    fill(0, 155, 0);
    triangle(
      tree_x - 30, floorPos_y - 80,         // left base
      tree_x + 70, floorPos_y - 80,         // right base
      tree_x + 20, floorPos_y - 170          // top
    );

    // tree canopy - upper (smaller) triangle
    triangle(
      tree_x - 15, floorPos_y - 140,         // left base
      tree_x + 55, floorPos_y - 140,         // right base
      tree_x + 20, floorPos_y - 200          // top
    );
  }
}

function drawCollectable(t_collectable) {
    
    // base coin
    noStroke();
    fill(255, 204, 0);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 28, 28);

    // inner 
    fill(255, 235, 120);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 20, 20);

    // rim
    noFill();
    stroke(255, 210, 60);
    strokeWeight(2);
    ellipse(t_collectable.x_pos, t_collectable.y_pos, 24, 24);

    // shine
    noStroke();
    fill(255, 255, 255, 180);
    rect(t_collectable.x_pos - 5, t_collectable.y_pos - 9, 3, 12, 2);
    triangle(
        t_collectable.x_pos + 4, t_collectable.y_pos - 4,
        t_collectable.x_pos + 9, t_collectable.y_pos - 7,
        t_collectable.x_pos + 7, t_collectable.y_pos - 1
  );
}

// collectable logic 
function checkCollectable(t_collectables) {
    if (!t_collectables.isFound && dist(gameChar_x, gameChar_y, t_collectables.x_pos, t_collectables.y_pos) < 40) {
        t_collectables.isFound = true;
        gameScore += 1;

        if (SoundFX.coin) SoundFX.coin.play();
    }
}

// returns true only if all collectables are collected.
function allCollectablesFound() {
  return collectables.every(c => c.isFound);
}


function drawCanyon(t_canyon) {
    fill(100, 155, 255);
    rect(t_canyon.x_pos, floorPos_y, t_canyon.width, height - floorPos_y);
}

// canyon logic

function checkCanyon(t_canyon) {
    if (
        gameChar_x > t_canyon.x_pos &&
        gameChar_x < t_canyon.x_pos + t_canyon.width &&
        gameChar_y >= floorPos_y
    ) {
        isPlummeting = true;
    }
}

// flagpole

function renderFlagpole() {
    push();
    translate(scrollPos, 0);

    const x = flagpole.x_pos;
    const baseY = flagpole.y_pos;                 // platform top
    const topY  = baseY - flagpole.height - 25;
    const flagY = baseY - flagpole.raise - 25;   

    // pole
    stroke(180);
    strokeWeight(6);
    line(x, baseY, x, topY);

    // base
    noStroke();
    fill(200, 0, 200);

    // flag
    fill(255, 0, 0);
    triangle(
        x,      flagY,
        x + 50, flagY + 15,
        x,      flagY + 30
    );

    pop();
}

function mousePressed() {
  if (!gameStarted) {
    gameStarted = true;
    if (SoundFX.bgm && !SoundFX.bgm.isPlaying()) {
        SoundFX.bgm.setLoop(true);
        SoundFX.bgm.setVolume(0.15); 
        SoundFX.bgm.play();
    }
  }
}

function checkFlagpole() {
    const worldX = gameChar_x - scrollPos;

    // collision checks with the flagpole
    const withinX = Math.abs(worldX - flagpole.x_pos) < 20; // close enough horizontally
    const onPlatformTop = Math.abs(gameChar_y - flagpole.y_pos) < 12; // standing on the flag base
    const withinPoleHeight = gameChar_y <= flagpole.y_pos && // vertically aligned with pole
                            gameChar_y >= flagpole.y_pos - 200; // within pole height range

    // final condition: only "at pole" if all three are true
    const atPole = withinX && onPlatformTop && withinPoleHeight;

    // reset every frame so HUD can decide whether to show hint
    flagpole.CoinsHint = false;

    // flagpole logic
    if (atPole && allCollectablesFound()) {
        flagpole.isReached = true;        // coins already collected → allow reach
    } else if (atPole && !allCollectablesFound()) {
        flagpole.CoinsHint = true;    // show the hint
    }
}

function checkPlayerDie() {
    // if player falls below the canvas
    if (gameChar_y > height) {
        lives--;

        if (lives > 0) {
            startGame(); // reset position
        }
    }
}

function levelComplete() {
    // level is only complete if:
    // 1. player has reached the flagpole
    // 2. all collectables (coins) have been collected
    return flagpole.isReached && allCollectablesFound();
}

function startGame() {
    floorPos_y = height * 3 / 4;
    gameChar_x = width / 2;
    gameChar_y = floorPos_y;
    scrollPos = 0;
    gameChar_world_x = gameChar_x - scrollPos;

    isFalling = false;
    isPlummeting = false;

    // reset position and camera
    cameraPosX = gameChar_x - width / 2;

}

function preload() {
  SoundFX.preload();
}