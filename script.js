const card = document.querySelector('.card');
if (card) {
    card.addEventListener('click', function () {
        this.style.transform = 'scale(0.99)';
        setTimeout(() => {
            this.style.transform = '';
        }, 100);
    });
}

let trailThrottle = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - trailThrottle < 50) return;
    trailThrottle = now;

    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
        position: fixed;
        left: ${e.clientX}px;
        top: ${e.clientY}px;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        animation: sparkle-fade 0.6s ease forwards;
        font-size: ${10 + Math.random() * 8}px;
        line-height: 1;
    `;
    sparkle.textContent = ['✨', '🌅', '☀️', '✦'][Math.floor(Math.random() * 4)];
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 600);
});
