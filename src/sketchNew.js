let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

let engine;
let world;
let particles = [];
let customFont;
const name = "Matt Nadolny";

function preload() {
  customFont = loadFont('src/helvetica.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  engine = Engine.create();
  world = engine.world;

  const fontSize = 192;

  textSize(fontSize);

  let startX = (width - textWidth(name)) / 2;
  let startY = (height - fontSize) / 2;
  let xOffset = 0;

  for (let i = 0; i < name.length; i++) {
    let char = name.charAt(i);
    let charPath = customFont.textToPoints(char, startX + xOffset, startY, fontSize, { sampleFactor: 0.2 });

    charPath.forEach(pt => {
      let particle = new Particle(pt.x, pt.y);
      particles.push(particle);
    });

    xOffset += textWidth(char);

  }
}



function draw() {
  background(0);
  Engine.update(engine);

  let cursorX = mouseX;
  let cursorY = mouseY;

  particles.forEach((particle, index) => {
    if (index < particles.length - 1) {
      let nextParticle = particles[index + 1];
      let d = dist(particle.body.position.x, particle.body.position.y, nextParticle.body.position.x, nextParticle.body.position.y);
      if (d < 100) {
        stroke(255);
        line(particle.body.position.x, particle.body.position.y, nextParticle.body.position.x, nextParticle.body.position.y);
      }
    }
    particle.interact(cursorX, cursorY);
    particle.show();
  });
}


class Particle {
  constructor(x, y) {
    this.body = Bodies.circle(x, y, 3);
    this.pos = { x: x, y: y };
    World.add(world, this.body);
    
    this.spring = Constraint.create({
      pointA: { x: x, y: y },
      bodyB: this.body,
      stiffness: 0.1,
      damping: 0.5,
      length: 1
    });
    World.add(world, this.spring);
  }

  interact(x, y) {
    let d = dist(x, y, this.body.position.x, this.body.position.y);
    if (d < 30) { // Decrease the distance threshold
      let force = createVector(x - this.body.position.x, y - this.body.position.y);
      force.normalize().mult(0.15); // Reduce the force applied
      Body.applyForce(this.body, this.body.position, force);
    } else if (d >= 30 && d <= 100) { // New condition to apply a smaller force when the cursor is between 30 and 300px away
      let force = createVector(x - this.body.position.x, y - this.body.position.y);
      force.normalize().mult(0.1); // Apply a smaller force
      Body.applyForce(this.body, this.body.position, force);
    }
  }
  
  

  show() {
    fill(255);
    noStroke();
    ellipse(this.body.position.x, this.body.position.y, 6);
  }
}


