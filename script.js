const canvas = document.getElementById('starCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const PARTICLE_COUNT = 180;
const CENTER_X = () => canvas.width / 2;
const CENTER_Y = () => canvas.height / 2;

let phase = 'gather';
let phaseTimer = 0;
let sunRadius = 0;
let sunOpacity = 0;

const PHASE_DURATIONS = {
    gather: 320,
    bundle: 60,
    explode: 160,
    rest: 80
};

let particles = [];

function createParticles() {
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(spawnParticle());
    }
}

function spawnParticle() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    return {
        x, y,
        vx: 0, vy: 0,
        radius: Math.random() * 1.8 + 0.5,
        opacity: Math.random() * 0.5 + 0.4,
        color: randomColor(),
        explodeVx: 0,
        explodeVy: 0,
        targetX: Math.random() * canvas.width,
        targetY: Math.random() * canvas.height,
    };
}

function randomColor() {
    const colors = [
        '255, 209, 102',
        '255, 140, 66',
        '255, 107, 157',
        '255, 248, 240',
        '78, 205, 196',
        '255, 107, 53',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
}

function resetParticleToScreen(p) {
    p.targetX = Math.random() * canvas.width;
    p.targetY = Math.random() * canvas.height;
    p.vx = 0; p.vy = 0;
    p.radius = Math.random() * 1.8 + 0.5;
    p.opacity = Math.random() * 0.5 + 0.4;
    p.color = randomColor();
    p.explodeVx = 0;
    p.explodeVy = 0;
}

function update() {
    phaseTimer++;
    const cx = CENTER_X(), cy = CENTER_Y();
    const progress = phaseTimer / PHASE_DURATIONS[phase];

    if (phase === 'gather') {
        sunRadius = Math.min(sunRadius + 0.4, 55);
        sunOpacity = Math.min(sunOpacity + 0.015, 1);

        particles.forEach(p => {
            const dx = cx - p.x;
            const dy = cy - p.y;
            const ease = 0.018 + progress * 0.03;
            p.vx += dx * ease;
            p.vy += dy * ease;
            p.vx *= 0.85;
            p.vy *= 0.85;
            p.x += p.vx;
            p.y += p.vy;
            p.opacity = Math.min(1, p.opacity + 0.005);
        });

    } else if (phase === 'bundle') {
        sunRadius = Math.min(sunRadius + 0.3, 70);
        sunOpacity = 1;

        particles.forEach(p => {
            const dx = cx - p.x;
            const dy = cy - p.y;
            p.vx += dx * 0.15;
            p.vy += dy * 0.15;
            p.vx *= 0.7;
            p.vy *= 0.7;
            p.x += p.vx + (Math.random() - 0.5) * 0.5;
            p.y += p.vy + (Math.random() - 0.5) * 0.5;
            p.opacity = Math.min(1, p.opacity + 0.03);
            p.radius = Math.min(p.radius + 0.03, 3.5);

            if (phaseTimer === PHASE_DURATIONS.bundle - 1) {
                p.targetX = Math.random() * canvas.width;
                p.targetY = Math.random() * canvas.height;
                const angle = Math.atan2(p.targetY - cy, p.targetX - cx);
                const speed = Math.random() * 16 + 8;
                p.explodeVx = Math.cos(angle) * speed;
                p.explodeVy = Math.sin(angle) * speed;
            }
        });

    } else if (phase === 'explode') {
        sunRadius = Math.max(sunRadius - 1.0, 0);
        sunOpacity = Math.max(sunOpacity - 0.02, 0);

        particles.forEach(p => {
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 5) {
                p.vx += dx * 0.015;
                p.vy += dy * 0.015;
                p.vx *= 0.88;
                p.vy *= 0.88;
                p.x += p.vx;
                p.y += p.vy;
            } else {
                p.x = p.targetX;
                p.y = p.targetY;
                p.vx = 0; p.vy = 0;
            }

            p.opacity = Math.min(0.9, p.opacity + 0.02);
            p.radius = Math.max(0.5, p.radius - 0.02);
        });

    } else if (phase === 'rest') {
        sunRadius = 0;
        sunOpacity = 0;

        particles.forEach(p => {
            p.x += (Math.random() - 0.5) * 0.3;
            p.y += (Math.random() - 0.5) * 0.3;
            p.opacity += (Math.random() - 0.5) * 0.02;
            p.opacity = Math.min(0.95, Math.max(0.2, p.opacity));
        });

        if (phaseTimer === PHASE_DURATIONS.rest - 1) {
            particles.forEach(p => resetParticleToScreen(p));
        }
    }

    if (phaseTimer >= PHASE_DURATIONS[phase]) {
        phaseTimer = 0;
        if (phase === 'gather')      phase = 'bundle';
        else if (phase === 'bundle') phase = 'explode';
        else if (phase === 'explode') phase = 'rest';
        else if (phase === 'rest')   phase = 'gather';
    }
}

function drawSun(cx, cy) {
    if (sunRadius <= 0 || sunOpacity <= 0) return;

    const outerGlow = ctx.createRadialGradient(cx, cy, sunRadius * 0.8, cx, cy, sunRadius * 3.5);
    outerGlow.addColorStop(0, `rgba(255, 209, 102, ${0.35 * sunOpacity})`);
    outerGlow.addColorStop(0.4, `rgba(255, 140, 66, ${0.2 * sunOpacity})`);
    outerGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius * 3.5, 0, Math.PI * 2);
    ctx.fillStyle = outerGlow;
    ctx.fill();

    const ringGrad = ctx.createRadialGradient(cx, cy, sunRadius * 0.75, cx, cy, sunRadius * 1.6);
    ringGrad.addColorStop(0,    `rgba(255, 248, 200, ${0.7 * sunOpacity})`);
    ringGrad.addColorStop(0.35, `rgba(255, 180, 80, ${0.45 * sunOpacity})`);
    ringGrad.addColorStop(0.7,  `rgba(255, 120, 50, ${0.15 * sunOpacity})`);
    ringGrad.addColorStop(1,    'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius * 1.6, 0, Math.PI * 2);
    ctx.fillStyle = ringGrad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, sunRadius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 200, 80, ${0.85 * sunOpacity})`;
    ctx.fill();
}

function drawSky() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, 'rgba(255, 107, 53, 0.35)');
    grad.addColorStop(0.35, 'rgba(255, 140, 66, 0.25)');
    grad.addColorStop(0.65, 'rgba(255, 209, 102, 0.2)');
    grad.addColorStop(1, 'rgba(78, 205, 196, 0.3)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSky();

    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity * 0.15})`;
        ctx.fill();
    });

    drawSun(CENTER_X(), CENTER_Y());

    if (phase === 'bundle' && phaseTimer > PHASE_DURATIONS.bundle * 0.7) {
        const flashProgress = (phaseTimer - PHASE_DURATIONS.bundle * 0.7) / (PHASE_DURATIONS.bundle * 0.3);
        const gradient = ctx.createRadialGradient(CENTER_X(), CENTER_Y(), 0, CENTER_X(), CENTER_Y(), 80 * flashProgress);
        gradient.addColorStop(0, `rgba(255, 240, 180, ${0.6 * flashProgress})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function animate() {
    update();
    draw();
    requestAnimationFrame(animate);
}

createParticles();
animate();

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
    phase = 'gather';
    phaseTimer = 0;
    sunRadius = 0;
    sunOpacity = 0;
});

const card = document.querySelector('.card');
if (card) {
    card.addEventListener('click', function () {
        this.style.transform = 'translate(-50%, -50%) scale(0.98)';
        setTimeout(() => {
            this.style.transform = 'translate(-50%, -50%) scale(1)';
        }, 100);
    });
}

document.addEventListener('mousemove', (e) => {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        width: 8px;
        height: 8px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%) rotate(${Math.random() * 360}deg);
        animation: sparkle-fade 0.6s ease forwards;
        font-size: ${10 + Math.random() * 10}px;
        line-height: 1;
    `;
    sparkle.textContent = ['☀️', '✨', '🌊', '🍉', '🌴', '☀️'][Math.floor(Math.random() * 6)];
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
});
