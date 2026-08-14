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
    if (now - trailThrottle < 40) return;
    trailThrottle = now;

    const pixel = document.createElement('div');
    pixel.className = 'pixel-trail';
    pixel.style.left = `${e.clientX}px`;
    pixel.style.top = `${e.clientY}px`;
    document.body.appendChild(pixel);
    setTimeout(() => pixel.remove(), 500);
});
