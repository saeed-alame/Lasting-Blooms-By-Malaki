// background.js - floating flowers background (canvas)
// Where the idea comes from:
//  canvas + animation loop setup follows this article:
//   https://techhub.iodigital.com/articles/particle-background-effect-with-canvas
//   (list of particles, a loop with requestAnimationFrame, resize listener)
// the basics of canvas animation: MDN "Basic animations" tutorial
//   https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Basic_animations


const flowerColors = ["plum", "thistle", "violet", "orchid", "pink", "white", "lavender"];
const flowerSizes = [12, 18, 26];

const canvas = document.createElement("canvas");
canvas.id = "background-canvas";
document.body.prepend(canvas);
const ctx = canvas.getContext("2d");

const toggleButton = document.createElement("button");
toggleButton.className = "background-toggle";
toggleButton.type = "button";
document.body.appendChild(toggleButton);

let width = window.innerWidth;
let height = window.innerHeight;

let flowers = [];         
let orbs = [];           
let sparkles = [];        
let pieces = [];          
let shootingPetals = []; 
let mouse = { x: -1000, y: -1000 };
let animationId = null;
let backgroundOn = true;

let bouquetState = "none";
let bouquetStart = 0;
let nextBouquetTime = 0;
let nextPetalTime = 0;
let bouquetFlowers = [];
let bouquetX = 0;
let bouquetY = 0;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function randomColor() {
  return flowerColors[Math.floor(Math.random() * flowerColors.length)];
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

const flowerSprites = {};
let glowSprite = null;

function makeFlowerSprite(color, size) {
  const sprite = document.createElement("canvas");
  const box = size * 2 + 4;
  sprite.width = box;
  sprite.height = box;
  const spriteCtx = sprite.getContext("2d");

  spriteCtx.translate(box / 2, box / 2);
  spriteCtx.fillStyle = color;
  spriteCtx.strokeStyle = "white";
  spriteCtx.lineWidth = 1;

  for (let i = 0; i < 5; i++) {
    spriteCtx.rotate((Math.PI * 2) / 5);
    spriteCtx.beginPath();
    spriteCtx.ellipse(0, -size * 0.55, size * 0.35, size * 0.55, 0, 0, Math.PI * 2);
    spriteCtx.fill();
    spriteCtx.stroke();
  }

  spriteCtx.fillStyle = "gold";
  spriteCtx.beginPath();
  spriteCtx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
  spriteCtx.fill();

  return sprite;
}

function makeSprites() {
  for (let c = 0; c < flowerColors.length; c++) {
    for (let s = 0; s < flowerSizes.length; s++) {
      flowerSprites[flowerColors[c] + flowerSizes[s]] = makeFlowerSprite(flowerColors[c], flowerSizes[s]);
    }
  }

  glowSprite = document.createElement("canvas");
  glowSprite.width = 128;
  glowSprite.height = 128;
  const glowCtx = glowSprite.getContext("2d");
 
  glowCtx.fillStyle = "white";
  glowCtx.globalAlpha = 0.07;
  for (let i = 0; i < 20; i++) {
    glowCtx.beginPath();
    glowCtx.arc(64, 64, 64 - i * 3, 0, Math.PI * 2);
    glowCtx.fill();
  }
}

function drawSprite(sprite, x, y, angle, alpha) {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  ctx.setTransform(cos, sin, -sin, cos, x, y);
  ctx.globalAlpha = alpha;
  ctx.drawImage(sprite, -sprite.width / 2, -sprite.height / 2);
}

function resetTransform() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
}

function makeFlower(anywhere) {
  const sizeIndex = Math.floor(Math.random() * flowerSizes.length);
  const size = flowerSizes[sizeIndex];
  return {
    x: randomBetween(0, width),
    y: anywhere ? randomBetween(0, height) : height + 40,
    size: size,

    speedY: 0.15 + sizeIndex * 0.2 + randomBetween(0, 0.15),
    alpha: 0.5 + sizeIndex * 0.2,
    sway: randomBetween(0, 6),
    angle: randomBetween(0, 6),
    spin: randomBetween(-0.01, 0.01),
    color: randomColor(),
    grouped: false,
    targetX: 0,
    targetY: 0
  };
}

function makeOrb() {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    size: randomBetween(80, 220),
    speedX: randomBetween(-0.15, 0.15),
    speedY: randomBetween(-0.2, -0.05),
    offset: randomBetween(0, 6)
  };
}

function makeSparkle() {
  return {
    x: randomBetween(0, width),
    y: randomBetween(0, height),
    speed: randomBetween(0.001, 0.003),
    offset: randomBetween(0, 6)
  };
}

function resetScene() {
  let amount = Math.floor(width / 70);
  if (amount > 18) {
    amount = 18;
  }
  if (amount < 8) {
    amount = 8;
  }

  flowers = [];
  orbs = [];
  sparkles = [];
  pieces = [];
  shootingPetals = [];
  bouquetState = "none";

  for (let i = 0; i < amount; i++) {
    flowers.push(makeFlower(true));
  }
  for (let i = 0; i < 6; i++) {
    orbs.push(makeOrb());
  }
  for (let i = 0; i < 25; i++) {
    sparkles.push(makeSparkle());
  }

  const now = performance.now();
  nextBouquetTime = now + 15000;
  nextPetalTime = now + 2000;
}
function drawOrbs(now) {
  for (let i = 0; i < orbs.length; i++) {
    const o = orbs[i];
    o.x += o.speedX;
    o.y += o.speedY;

    if (o.y < -o.size) {
      o.y = height + o.size;
      o.x = randomBetween(0, width);
    }

    const alpha = 0.25 + Math.sin(now / 2000 + o.offset) * 0.12;
    ctx.globalAlpha = alpha;
    ctx.drawImage(glowSprite, o.x - o.size / 2, o.y - o.size / 2, o.size, o.size);
  }
  ctx.globalAlpha = 1;
}

function drawSparkles(now) {
  ctx.fillStyle = "white";
  for (let i = 0; i < sparkles.length; i++) {
    const s = sparkles[i];
    const twinkle = (Math.sin(now * s.speed + s.offset) + 1) / 2;
    ctx.globalAlpha = twinkle * 0.9;
    ctx.fillRect(s.x, s.y, 3, 3);
  }
  ctx.globalAlpha = 1;
}

function drawStems() {
  const tieX = bouquetX;
  const tieY = bouquetY + 90;

  ctx.strokeStyle = "seagreen";
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.8;

  ctx.beginPath();
  for (let i = 0; i < bouquetFlowers.length; i++) {
    ctx.moveTo(bouquetFlowers[i].x, bouquetFlowers[i].y);
    ctx.lineTo(tieX, tieY);
  }
  ctx.moveTo(tieX, tieY);
  ctx.lineTo(tieX, tieY + 90);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawBow() {
  const tieX = bouquetX;
  const tieY = bouquetY + 90;

  ctx.fillStyle = "orchid";
  ctx.globalAlpha = 0.9;

  // two loops of the bow
  ctx.beginPath();
  ctx.ellipse(tieX - 20, tieY + 5, 20, 9, -0.4, 0, Math.PI * 2);
  ctx.ellipse(tieX + 20, tieY + 5, 20, 9, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // knot in the middle
  ctx.fillStyle = "plum";
  ctx.beginPath();
  ctx.arc(tieX, tieY + 5, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawSweepLine(progress) {
  const reach = progress * (width + 400);

  ctx.strokeStyle = "orchid";
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = reach - 500; x <= reach; x += 10) {
    const y = bouquetY + Math.sin(x / 60) * 40;
    if (x === reach - 500) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();
}

function drawWrapLine(progress) {
  const radius = 230 - progress * 120;

  ctx.strokeStyle = "orchid";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(bouquetX, bouquetY, radius, radius * 0.6, progress * 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(bouquetX, bouquetY, radius, radius * 0.6, progress * 6 + 1, 0, Math.PI * 2);
  ctx.stroke();
}

function addShootingPetal() {
  shootingPetals.push({
    x: randomBetween(width * 0.3, width),
    y: -20,
    speedX: randomBetween(-9, -6),
    speedY: randomBetween(4, 6),
    angle: 0,
    trail: []
  });
}

function updateShootingPetals() {
  for (let i = shootingPetals.length - 1; i >= 0; i--) {
    const p = shootingPetals[i];
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 14) {
      p.trail.shift();
    }
    p.x += p.speedX;
    p.y += p.speedY;
    p.angle += 0.15;

    if (p.y > height + 50 || p.x < -50) {
      shootingPetals.splice(i, 1);
    }
  }
}

function drawShootingPetals() {
  ctx.fillStyle = "orchid";
  for (let i = 0; i < shootingPetals.length; i++) {
    const p = shootingPetals[i];

    for (let j = 0; j < p.trail.length; j++) {
      ctx.globalAlpha = j / p.trail.length / 2;
      ctx.beginPath();
      ctx.arc(p.trail[j].x, p.trail[j].y, j / 3, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSprite(flowerSprites["white18"], p.x, p.y, p.angle, 1);
    resetTransform();
  }
  ctx.globalAlpha = 1;
}

function startBouquet(now) {
  bouquetState = "sweep";
  bouquetStart = now;
  bouquetX = width / 2;
  bouquetY = height * 0.45;

  const sorted = flowers.slice();
  sorted.sort(function (a, b) {
    const distA = Math.hypot(a.x - bouquetX, a.y - bouquetY);
    const distB = Math.hypot(b.x - bouquetX, b.y - bouquetY);
    return distA - distB;
  });
  bouquetFlowers = sorted.slice(0, 7);

  for (let i = 0; i < bouquetFlowers.length; i++) {
    const spread = (i - (bouquetFlowers.length - 1) / 2) * 0.5;
    const distance = i % 2 === 0 ? 110 : 70;
    bouquetFlowers[i].grouped = true;
    bouquetFlowers[i].alpha = 1;
    bouquetFlowers[i].targetX = bouquetX + Math.sin(spread) * distance * 1.3;
    bouquetFlowers[i].targetY = bouquetY - Math.cos(spread) * distance * 0.8;
  }
}

function shatterBouquet(now) {
  for (let i = 0; i < bouquetFlowers.length; i++) {
    const f = bouquetFlowers[i];
    for (let j = 0; j < 8; j++) {
      pieces.push({
        x: f.x,
        y: f.y,
        speedX: randomBetween(-5, 5),
        speedY: randomBetween(-6, 2),
        size: randomBetween(4, 9),
        angle: randomBetween(0, 6),
        spin: randomBetween(-0.2, 0.2),
        color: f.color,
        alpha: 1
      });
    }
  }

  const amount = bouquetFlowers.length;
  flowers = flowers.filter(function (f) {
    return !f.grouped;
  });
  for (let i = 0; i < amount; i++) {
    flowers.push(makeFlower(false));
  }

  bouquetFlowers = [];
  bouquetState = "none";
  nextBouquetTime = now + 15000;
}

function updatePieces() {
  for (let i = pieces.length - 1; i >= 0; i--) {
    const p = pieces[i];
    p.x += p.speedX;
    p.y += p.speedY;
    p.speedY += 0.12; 
    p.angle += p.spin;
    p.alpha -= 0.012;

    if (p.alpha <= 0) {
      pieces.splice(i, 1);
    }
  }
}

function drawPieces() {
  for (let i = 0; i < pieces.length; i++) {
    const p = pieces[i];
    const cos = Math.cos(p.angle);
    const sin = Math.sin(p.angle);
    ctx.setTransform(cos, sin, -sin, cos, p.x, p.y);
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  resetTransform();
}

function updateBouquet(now) {
  const elapsed = now - bouquetStart;

  if (bouquetState === "none" && now > nextBouquetTime) {
    startBouquet(now);
  } else if (bouquetState === "sweep" && elapsed > 1500) {
    bouquetState = "gather";
    bouquetStart = now;
  } else if (bouquetState === "gather" && elapsed > 2000) {
    bouquetState = "hold";
    bouquetStart = now;
  } else if (bouquetState === "hold" && elapsed > 3000) {
    shatterBouquet(now);
  }
}


function updateFlowers(now) {
  for (let i = 0; i < flowers.length; i++) {
    const f = flowers[i];
    f.angle += f.spin;

    if (f.grouped) {
      // flowers in the bouquet move to their spot
      if (bouquetState === "gather" || bouquetState === "hold") {
        f.x += (f.targetX - f.x) * 0.07;
        f.y += (f.targetY - f.y) * 0.07;
      }
    } else {
      f.y -= f.speedY;
      f.x += Math.sin(now / 1000 + f.sway) * 0.4;

      if (f.size === 26) {
        const dx = f.x - mouse.x;
        const dy = f.y - mouse.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 120 && distance > 0) {
          f.x += (dx / distance) * 2;
          f.y += (dy / distance) * 2;
        }
      }

      if (f.y < -40) {
        f.y = height + 40;
        f.x = randomBetween(0, width);
      }
    }
  }
}

// ---------- main loop ----------
function animate() {
  const now = performance.now();

 
  ctx.clearRect(0, 0, width, height);

 
  if (now > nextPetalTime) {
    addShootingPetal();
    nextPetalTime = now + randomBetween(3000, 5000);
  }

  updateBouquet(now);
  updateFlowers(now);
  updateShootingPetals();
  updatePieces();

  drawOrbs(now);
  drawSparkles(now);

  if (bouquetState === "gather" || bouquetState === "hold") {
    drawStems();
  }

  for (let i = 0; i < flowers.length; i++) {
    const f = flowers[i];
    drawSprite(flowerSprites[f.color + f.size], f.x, f.y, f.angle, f.alpha);
  }
  resetTransform();

  drawShootingPetals();
  drawPieces();

  if (bouquetState === "sweep") {
    drawSweepLine((now - bouquetStart) / 1500);
  } else if (bouquetState === "gather") {
    drawWrapLine((now - bouquetStart) / 2000);
  } else if (bouquetState === "hold") {
    drawBow();
  }

  animationId = requestAnimationFrame(animate);
}


function turnOn() {
  backgroundOn = true;
  canvas.style.display = "block";
  document.body.classList.add("fancy-background");
  toggleButton.textContent = "Background: On";
  resizeCanvas();
  resetScene();
  animate();
}

function turnOff() {
  backgroundOn = false;
  cancelAnimationFrame(animationId);
  canvas.style.display = "none";
  document.body.classList.remove("fancy-background");
  toggleButton.textContent = "Background: Off";
}

toggleButton.addEventListener("click", function () {
  if (backgroundOn) {
    turnOff();
    localStorage.setItem("background", "off");
  } else {
    turnOn();
    localStorage.setItem("background", "on");
  }
});

window.addEventListener("resize", resizeCanvas);

window.addEventListener("mousemove", function (event) {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

window.addEventListener("mouseout", function () {
  mouse.x = -1000;
  mouse.y = -1000;
});

makeSprites();
const savedChoice = localStorage.getItem("background");
const lessMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (savedChoice === "off" || (savedChoice === null && lessMotion)) {
  resizeCanvas();
  turnOff();
} else {
  turnOn();
}
