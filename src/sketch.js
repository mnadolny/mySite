// sketch.js
const raindrops = [];
let fontHelvetica;

function preload() {
  fontHelvetica = loadFont('src/helvetica.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont(fontHelvetica);
}

class Raindrop {
  constructor() {
    this.x = random(width);
    this.y = random(-height, 0);
    this.size = random(5, 15);
    this.vx = random(-1, 1);
    this.vy = map(this.size, 5, 15, 4, 10);
    this.gravity = 0.5;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;

    if (this.y > height + this.size) {
      this.x = random(width);
      this.y = random(-height, 0);
      this.vy = map(this.size, 5, 15, 4, 10);
    }
  }

  bounceOffCursor() {
    const cursorSize = 75;
    const distance = dist(this.x, this.y, mouseX, mouseY);

    if (distance < cursorSize / 2 + this.size / 2) {
      const angle = random(TWO_PI);
      this.vx = cos(angle) * 0.8;
      this.vy = -abs(sin(angle) * 0.8); // Ensure the raindrops bounce upwards
    }
  }

  bounceOffText() {
    const textWords = ['Matt', 'Nadolny'];
    textSize(128);
    textAlign(LEFT, BOTTOM);
  
    for (const word of textWords) {
      const textX = 10;
      const textY = height - (textWords.indexOf(word) * 128);
      const characters = word.split('');
  
      for (let i = 0; i < characters.length; i++) {
        const char = characters[i];
        const prevCharWidth = textWidth(word.substring(0, i));
        const bounds = fontHelvetica.textBounds(char, textX + prevCharWidth, textY, 128);
  
        if (collideRectCircle(bounds.x, bounds.y, bounds.w, bounds.h, this.x, this.y, this.size)) {
          const angle = random(TWO_PI);
          this.vx = cos(angle) * 0.8;
          this.vy = -abs(sin(angle) * 0.8); // Ensure the raindrops bounce upwards
        }
      }
    }
  }
  
  

  display() {
    fill(0);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}

function collideRectCircle(rx, ry, rw, rh, cx, cy, diameter) {
  const circleDistanceX = Math.abs(cx - rx - rw / 2);
  const circleDistanceY = Math.abs(cy - ry - rh / 2);

  if (circleDistanceX > (rw / 2 + diameter / 2)) {
    return false;
  }
  if (circleDistanceY > (rh / 2 + diameter / 2)) {
    return false;
  }

  if (circleDistanceX <= (rw / 2)) {
    return true;
  }
  if (circleDistanceY <= (rh / 2)) {
    return true;
  }

  const cornerDistanceSq = Math.pow(circleDistanceX - rw / 2, 2) + Math.pow(circleDistanceY - rh / 2, 2);

  return (cornerDistanceSq <= Math.pow(diameter / 2, 2));
}


function spawnRaindrops() {
  if (raindrops.length < 200) {
    raindrops.push(new Raindrop());
  }
}

function drawCursor() {
  fill(255);
  stroke(0);
  strokeWeight(1);
  circle(mouseX, mouseY, 75);
}

function drawText() {
  fill(255);
  stroke(0);
  strokeWeight(1);
  textSize(128);
  textAlign(LEFT, BOTTOM);
  text('Matt', 10, height - 128);
  text('Nadolny', 10, height);
}

function draw() {
  background(255);
  drawCursor();
  drawText();

  spawnRaindrops();

  for (let i = raindrops.length - 1; i >= 0; i--) {
    const raindrop = raindrops[i];
    raindrop.bounceOffCursor();
    raindrop.bounceOffText();
    raindrop.update();
    raindrop.display();

    // Remove raindrops that are off the screen
    if (raindrop.y > height + raindrop.size || raindrop.x < -raindrop.size || raindrop.x > width + raindrop.size) {
      raindrops.splice(i, 1);
    }
  }
}
