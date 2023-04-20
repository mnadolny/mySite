// matter.js aliases
const { Engine, World, Bodies, Body } = Matter;

let engine, world;
let raindrops = [];
let bigCircle;
let intensity = 5;
let intensityChange = 0.01;

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;
  engine.world.gravity.y = 0.5;
  
  bigCircle = new BigCircle(random(width), -50);
}

function draw() {
  background(255);

  Engine.update(engine);

  // Rain intensity changes over time
  intensity += intensityChange;
  if (intensity >= 7 || intensity <= 3) {
    intensityChange *= -1;
  }

  // Create raindrops with varying intensity
  if (random() < intensity / 50) {
    raindrops.push(new Raindrop());
  }

  // Display and update raindrops
  for (let i = raindrops.length - 1; i >= 0; i--) {
    let drop = raindrops[i];
    drop.display();
    drop.update();

    if (drop.isOffScreen()) {
      World.remove(world, drop.body);
      raindrops.splice(i, 1);
    }
  }

  // Display and update bigCircle
  bigCircle.display();
  bigCircle.update();
}

class Raindrop {
  constructor() {
    this.body = Bodies.circle(random(width), -10, 2);
    World.add(world, this.body);
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    fill(0);
    stroke(0);
    ellipse(0, 0, 4);
    pop();
  }

  update() {
    if (this.body.position.y > height) {
      World.remove(world, this.body);
      return true;
    }
    return false;
  }

  isOffScreen() {
    return this.body.position.y > height;
  }
}

class BigCircle {
  constructor(x, y) {
    this.body = Bodies.circle(x, y, 50, { restitution: 0.8 });
    World.add(world, this.body);
  }

  display() {
    push();
    translate(this.body.position.x, this.body.position.y);
    rotate(this.body.angle);
    fill(0);
    stroke(0);
    ellipse(0, 0, 100);
    pop();
  }

  update() {
    if (this.body.position.y + 50 >= height) {
      Body.setVelocity(this.body, { x: 0, y: -abs(this.body.velocity.y) });
    }
  }
}
