/* globals 
colorMode
HSB
createCanvas
width
height
windowWidth
windowHeight
background
color
noStroke
fill
ellipse
arc
PI
PIE
triangle
cos
sin
line
sqrt
mouseX
mouseY
stroke
strokeWeight
keyCode
UP_ARROW
DOWN_ARROW
keyIsDown
collideCircleCircle
random
text
round
noLoop
loop
soundFormats
loadSound
*/

let frog;
let lily;
let flies;
let maxRadius;
let score;
let numFlies;
let time;
let numTries;
let swampNoise;

function preload() {
  soundFormats("mp3");
  swampNoise = loadSound(
    "https://cdn.glitch.com/d7581248-053b-4805-96d2-3a6fd0b119c0%2Fswamp-sounds.mp3?v=1622161555370"
  );
}

function setup() {
  colorMode(HSB);
  createCanvas(windowWidth, windowHeight);
  maxRadius = Math.min(width / 2, height / 2);
  frog = new Frog();
  lily = new Lily();
  flies = [];
  time = 0;

  numFlies = round(random(3, 21));

  for (let i = 0; i < numFlies; i++) {
    flies.push(new Fly());
  }

  score = 0;
  numTries = 0;

  swampNoise.loop();
}

function draw() {
  time++;

  background(color(200, 80, 80));

  lily.draw();

  frog.draw();

  for (let fly of flies) {
    fly.draw();
    frog.checkCatch(fly);
  }

  drawText();
}

function resetGame() {
  frog = new Frog();
  lily = new Lily();
  flies = [];
  time = 0;
  numTries = 0;

  numFlies = round(random(9, 45));

  for (let i = 0; i < numFlies; i++) {
    flies.push(new Fly());
  }

  score = 0;
  loop();
}

function drawText() {
  fill(color(0, 0, 0));
  text(`elapsed time ${time / 100}s`, 20, 10);
  text(`score: ${score} - there are ${numFlies - score} flies left`, 20, 25);
  text("hold down up arrow to charge your tongue shot", 20, 40);
  text("hold down down arrow to real your tongue back in", 20, 55);
  text("you can hold a maximum of 3 flies on your tongue", 20, 70);
  text("spacebar to reset", 20, 85);
  text(`num tries: ${numTries}`, 20, 100);
}

class Fly {
  constructor() {
    this.x = width / 2 + random(-maxRadius, maxRadius);
    this.y = height / 2 + random(-maxRadius, maxRadius);

    let radius = random(-maxRadius, maxRadius);
    let angle = random(0, 2 * PI);

    this.x = width / 2 + radius * cos(angle);
    this.y = height / 2 + radius * sin(angle);

    this.diameter = 10;

    this.isCaught = false;
    this.isDead = false;
  }

  draw() {
    if (this.isDead) {
      return;
    }

    let wiggle = random(-1, 1);

    noStroke();
    fill(color(0, 100, 0));
    ellipse(this.x + wiggle, this.y, this.diameter);
    fill(color(0, 0, 100));
    ellipse(
      this.x - this.diameter / 2 + wiggle,
      this.y - this.diameter / 2,
      this.diameter / 2
    );
    ellipse(
      this.x + this.diameter / 2 + wiggle,
      this.y - this.diameter / 2,
      this.diameter / 2
    );
  }

  getCaught() {
    this.isCaught = true;
  }
}

function keyPressed() {
  // space bar to reset
  if (keyCode === 32) {
    resetGame();
  }
}

class Frog {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;

    this.tongueAngle = 0;
    this.tongueLength = 0;
    this.tongueX = this.x;
    this.tongueY = this.y + 4;
    this.tongueOut = false;

    this.tongueDiameter = 40;

    this.tipX = this.tongueX;
    this.tipY = this.tongueY;

    this.caughtFlies = [];
  }

  checkCatch(fly) {
    if (fly.isCaught) {
      return;
    }

    if (this.caughtFlies.length > 2) {
      return;
    }

    if (
      collideCircleCircle(
        this.tipX,
        this.tipY,
        this.tongueDiameter,
        fly.x,
        fly.y,
        fly.diameter
      )
    ) {
      fly.getCaught();
      this.catch(fly);
    }
  }

  catch(fly) {
    this.caughtFlies.push(fly);
  }

  draw() {
    noStroke();

    this.drawHead();
    this.drawEyes();
    this.drawMouth();

    if (keyIsDown(UP_ARROW) && !this.tongueOut) {
      this.extendTongue();
    } else {
      if (!this.tongueOut && this.tongueLength > 0) {
        numTries++;
      }
      this.tongueOut = this.tongueLength > 0;

      if (keyIsDown(DOWN_ARROW)) {
        this.retractTongue();
      }
      this.drawTongue();
      this.eat();
    }

    this.drawCaughtFlies();
  }

  eat() {
    if (this.tongueLength === 0) {
      for (let fly of this.caughtFlies) {
        fly.isDead = true;
        score++;
        if (score === numFlies) {
          noLoop();
        }
      }

      this.caughtFlies = [];
    }
  }

  drawCaughtFlies() {
    for (let fly of this.caughtFlies) {
      fly.x = this.tipX;
      fly.y = this.tipY;
    }
  }

  drawTongue() {
    this.moveTongue();

    let radius = this.tongueLength;
    this.tipX = this.tongueX + radius * cos(this.tongueAngle);
    this.tipY = this.tongueY + radius * sin(this.tongueAngle);

    stroke(color(350, 30, 100));
    strokeWeight(8);
    line(this.tongueX, this.tongueY, this.tipX, this.tipY);

    noStroke();
    fill(color(350, 30, 100));
    let tipWidth = this.tongueLength === 0 ? 16 : this.tongueDiameter / 2;
    let tipHeight = this.tongueLength === 0 ? 8 : this.tongueDiameter / 2;

    ellipse(this.tipX, this.tipY, tipWidth, tipHeight);
  }

  moveTongue() {
    this.tongueAngle += PI / 81;
  }

  extendTongue() {
    this.tongueLength += 10;

    this.tongueLength = Math.min(maxRadius, this.tongueLength);
  }

  retractTongue() {
    this.tongueLength -= 5;

    this.tongueLength = Math.max(0, this.tongueLength);
  }

  drawHead() {
    fill(color(90, 80, 100));
    ellipse(this.x, this.y, 40);
  }

  drawEyes() {
    // left eye
    fill(color(90, 80, 100));
    ellipse(this.x - 15, this.y - 15, 20);
    fill(color(60, 80, 80));
    ellipse(this.x - 15, this.y - 15, 16);
    fill(color(0, 100, 0));
    ellipse(this.x - 15, this.y - 15, 12, 4);

    // right eye
    fill(color(90, 80, 100));
    ellipse(this.x + 15, this.y - 15, 20);
    fill(color(60, 80, 80));
    ellipse(this.x + 15, this.y - 15, 16);
    fill(color(0, 100, 0));
    ellipse(this.x + 15, this.y - 15, 12, 4);
  }

  drawMouth() {
    fill(color(0, 60, 100));
    arc(this.x, this.y, 30, 30, PI + (PI * 8) / 9, PI + PI / 9, PIE);
  }
}

class Lily {
  constructor() {
    this.x = width / 2;
    this.y = height / 2;
  }

  draw() {
    noStroke();

    noStroke();
    fill(color(120, 80, 80));
    ellipse(this.x, this.y, 100);

    fill(color(200, 80, 80));
    triangle(
      this.x - 24,
      this.y - 24,
      this.x - 200,
      this.y - 200,
      this.x - 190,
      this.y - 100
    );
  }
}
