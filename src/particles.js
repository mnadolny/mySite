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
let fallingCircles = [];


function preload() {
  customFont = loadFont('src/helvetica.ttf');
}

function setup() {
  noCursor(); // Hide the default cursor
  createCanvas(windowWidth, windowHeight);

  let fontSize = 128;
  let xOffset = 0;
  let letterSpacing = 10; // Add this line before the for loop

  if (windowWidth <= 768) {
    fontSize = 64;
    if (windowWidth < 600) {
      xOffset = 0;
    }
  }

  engine = Engine.create();
  world = engine.world;

  textSize(fontSize);

  // Calculate the total width of the name
  let nameWidth = 0;
  for (let i = 0; i < name.length; i++) {
    let char = name.charAt(i);
    nameWidth += textWidth(char) + letterSpacing + (windowWidth < 600 ? 0 : -15);
  }

  let startX = (width - nameWidth) / 2;
  let startY = (height - fontSize) / 2;

  for (let i = 0; i < name.length; i++) {
    let char = name.charAt(i);
    let sampleFactor = 0.099; // Set number of particles on desktop
    if (windowWidth < 600) {
      sampleFactor = 0.07; // Set number of particles on mobile
    }
    let charPath = customFont.textToPoints(char, startX + xOffset, startY, fontSize, { sampleFactor: sampleFactor });

    charPath.forEach(pt => {
      let particle = new Particle(pt.x, pt.y);
      particles.push(particle);
    });

    xOffset += textWidth(char) + letterSpacing + (windowWidth < 600 ? 0 : -15);
  }
}




function draw() {
  background(0);
  Engine.update(engine);

  let cursorX = mouseX;
  let cursorY = mouseY;

  if (frameCount % 5 == 0) { // Change the interval to create circles more frequently for a rain-like effect
    createFallingCircle();
  }

  fallingCircles = fallingCircles.filter(circle => {
    if (circle.body.position.y - circle.radius > height) {
      World.remove(world, circle.body);
      return false;
    } else {
      circle.bounceOffCursor(cursorX, cursorY, 200);
      circle.show();
      return true;
    }
  });
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
  noFill();
  stroke(255);
  strokeWeight(1);
  ellipse(cursorX, cursorY, 200 * 2);
}

class FallingCircle {
  constructor(x, y, radius) {
    this.radius = radius;
    this.body = Bodies.circle(x, y, this.radius);
    World.add(world, this.body);

    Body.setVelocity(this.body, { x: 0, y: random(5, 10) }); // Add initial velocity for a rain-like falling effect
  }

  bounceOffCursor(cursorX, cursorY, radius) {
    let d = dist(cursorX, cursorY, this.body.position.x, this.body.position.y);
    if (d <= radius) {
      let force = createVector(this.body.position.x - cursorX, this.body.position.y - cursorY);
      force.normalize().mult(0.02);
      Body.applyForce(this.body, this.body.position, force);
    }
  }

  show() {
    noFill();
    stroke(255);
    strokeWeight(1);
    ellipse(this.body.position.x, this.body.position.y, this.radius * 2);
  }
}


function createFallingCircle() {
  let x = random(0, width);
  let y = 0;
  let radius = random(2, 20); // Generate a random radius between 2 and 4 for a more rain-like size
  let fallingCircle = new FallingCircle(x, y, radius);
  fallingCircles.push(fallingCircle);
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
    } else if (d >= 30 && d <= 200) { // New condition to apply a smaller force when the cursor is between 30 and 300px away
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


