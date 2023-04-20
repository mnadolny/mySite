let Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint;

let engine;
let world;
let particles = [];
let customFont;
const name = "MATT NADOLNY";

function preload() {
  customFont = loadFont('src/helvetica.ttf');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  let fontSize = 192;
  let xOffset = 0;

  if (windowWidth <= 768) {
    fontSize = 64;
    if (windowWidth < 600) {
      xOffset = 0;
    }
  }

  engine = Engine.create();
  world = engine.world;

  textSize(fontSize);

  let startX = (width - textWidth(name)) / 2;
  let startY = (height - fontSize) / 2;

  for (let i = 0; i < name.length; i++) {
    let char = name.charAt(i);
    let sampleFactor = 0.03; // Set number of particles on desktop
    if (windowWidth < 600) {
      sampleFactor = 0.07; // Set number of particles on mobile
    }
    let charPath = customFont.textToPoints(char, startX + xOffset, startY, fontSize, { sampleFactor: sampleFactor });

    charPath.forEach(pt => {
      let particle = new Particle(pt.x, pt.y);
      particles.push(particle);
    });

    xOffset += textWidth(char) + (windowWidth < 600 ? 0 : -15);
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

      if (d >= 100 && d <= 200) { // New condition to apply random movement when the cursor is more than 100px away
        particle.randomMove();
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

    this.randomForce = createVector(random(-0.001, 0.001), random(-0.001, 0.009));

    this.spring = Constraint.create({
      pointA: { x: x, y: y },
      bodyB: this.body,
      stiffness: 0.1,
      damping: 0.5,
      length: 1
    });
    World.add(world, this.spring);
  }

  randomMove() {
    Body.applyForce(this.body, this.body.position, this.randomForce);
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


