const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const captionText = document.getElementById('captionText');
const buttonGroup = document.getElementById('buttonGroup');
const askScreen = document.getElementById('askScreen');
const revealScreen = document.getElementById('revealScreen');
const particlesContainer = document.getElementById('particlesContainer');

let clickAttempts = 0;
let yesScale = 1;

const clickCaptions = [
    "not going to happen.",
    "nice try.",
    "I already said no.",
    "not today either.",
    "you will have to work harder than that.",
    "still no. but I do appreciate the effort."
];

function getCaption(list, count) {
    const index = count - 1;
    if (index < list.length) {
        return list[index];
    }
    return list[list.length - 1]; // Reuse the last one
}

function scaleYesButton() {
    if (yesScale < 1.6) {
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${Math.min(yesScale, 1.6)})`;
    }
}

function spawnParticles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const particleIcons = ['🤍', '🩶', '✨'];
    const particleCount = 16;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
        particle.style.left = `${Math.random() * 100}vw`;
        
        const duration = 4 + Math.random() * 1;
        const delay = Math.random() * 1.5;
        
        const drift = (Math.random() - 0.5) * 50;
        particle.style.setProperty('--drift', `${drift}vw`);
        
        const rot = (Math.random() - 0.5) * 360;
        particle.style.setProperty('--rot', `${rot}deg`);
        
        particle.style.animation = `floatUp ${duration}s ease-in ${delay}s forwards`;
        particlesContainer.appendChild(particle);
    }
}

function startYesReveal() {
    yesBtn.disabled = true;
    // Fade out ask screen
    askScreen.classList.add('fade-out');
    
    setTimeout(() => {
        askScreen.setAttribute('hidden', '');
        revealScreen.removeAttribute('hidden');
        
        const pulsingHeart = revealScreen.querySelector('.pulsing-heart');
        pulsingHeart.classList.add('active');
        
        const lines = revealScreen.querySelectorAll('.reveal-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('active');
            }, 300 * (index + 1));
        });
        
        spawnParticles();
        
    }, 350);
}

// Click activation
yesBtn.addEventListener('click', () => {
    startYesReveal();
});

noBtn.addEventListener('click', () => {
    // A real click via mouse, touch, or keyboard
    clickAttempts++;
    
    // Update caption area with rejection line
    captionText.textContent = getCaption(clickCaptions, clickAttempts);
    captionText.classList.add('visible');
    
    scaleYesButton();
    
    // Page continues exactly as before, buttons fully active, still dodgeable
});
