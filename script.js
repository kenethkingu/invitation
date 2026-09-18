const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const captionText = document.getElementById('captionText');
const replyText = document.getElementById('replyText');
const buttonGroup = document.getElementById('buttonGroup');
const askScreen = document.getElementById('askScreen');
const revealScreen = document.getElementById('revealScreen');
const particlesContainer = document.getElementById('particlesContainer');

let attempts = 0;
let isFixed = false;
let yesScale = 1;

const captions = [
    "not yet.",
    "you will have to catch me first.",
    "I am not going anywhere though.",
    "still hoping you mean yes.",
    "okay, you could just say yes.",
    "I will wait as long as it takes."
];

function getCaption(index) {
    if (index < captions.length) {
        return captions[index];
    }
    return captions[captions.length - 1]; // Reuse the last one
}

function handleDodge(pointerX, pointerY) {
    const rect = noBtn.getBoundingClientRect();
    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    // Calculate distance from pointer to button center
    const dx = btnCenterX - pointerX;
    const dy = btnCenterY - pointerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // If pointer is within 90px of button center, flee!
    if (distance < 90) {
        flee(pointerX, pointerY, rect);
    }
}

function flee(pointerX, pointerY, rect) {
    attempts++;
    
    // Update caption
    captionText.textContent = getCaption(attempts - 1);
    captionText.classList.add('visible');
    
    // Scale up "Yes" button (cap at 1.6x)
    if (yesScale < 1.6) {
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${Math.min(yesScale, 1.6)})`;
    }

    // Switch to fixed positioning on first flee to detach from document flow
    if (!isFixed) {
        const startWidth = rect.width;
        const startHeight = rect.height;
        noBtn.style.width = `${startWidth}px`;
        noBtn.style.height = `${startHeight}px`;
        
        // Disable transitions temporarily so it doesn't animate from 'auto'
        noBtn.style.transition = 'none';
        
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;
        
        noBtn.classList.add('fixed');
        isFixed = true;
        
        // Force reflow
        noBtn.offsetHeight;
        
        // Restore CSS transitions
        noBtn.style.transition = '';
        
        // Re-read rect now that it's fixed
        rect = noBtn.getBoundingClientRect();
    }

    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    let dx = btnCenterX - pointerX;
    let dy = btnCenterY - pointerY;
    
    // If exact center, pick random direction
    if (dx === 0 && dy === 0) {
        dx = Math.random() - 0.5;
        dy = Math.random() - 0.5;
    }

    // Normalize vector (away from pointer)
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / length;
    const ny = dy / length;
    
    // Distance to move (150-180px)
    const moveDist = 150 + Math.random() * 30;
    
    // Add random wobble (±40px)
    const wobbleX = (Math.random() - 0.5) * 80;
    const wobbleY = (Math.random() - 0.5) * 80;
    
    let targetX = rect.left + (nx * moveDist) + wobbleX;
    let targetY = rect.top + (ny * moveDist) + wobbleY;
    
    // Clamp to viewport with margin
    const margin = 20;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;
    
    targetX = Math.max(margin, Math.min(targetX, maxX));
    targetY = Math.max(margin, Math.min(targetY, maxY));
    
    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;
}

// Mouse trigger
document.addEventListener('mousemove', (e) => {
    if (noBtn.disabled) return;
    handleDodge(e.clientX, e.clientY);
});

// Mobile touch trigger on the button itself
noBtn.addEventListener('touchstart', (e) => {
    if (noBtn.disabled) return;
    e.preventDefault(); // Prevent click from firing
    
    const touch = e.touches[0];
    handleDodge(touch.clientX, touch.clientY);
}, { passive: false });

function spawnParticles() {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const particleIcons = ['🤍', '🩶', '✨'];
    const particleCount = 16;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random icon
        particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
        
        // Random start position along the bottom (0 to 100vw)
        particle.style.left = `${Math.random() * 100}vw`;
        
        // Random animation duration (4-5s)
        const duration = 4 + Math.random() * 1;
        // Random delay (0-1.5s staggered)
        const delay = Math.random() * 1.5;
        
        // Random drift (-50vw to 50vw)
        const drift = (Math.random() - 0.5) * 50;
        particle.style.setProperty('--drift', `${drift}vw`);
        
        // Random rotation (-180deg to 180deg)
        const rot = (Math.random() - 0.5) * 360;
        particle.style.setProperty('--rot', `${rot}deg`);
        
        particle.style.animation = `floatUp ${duration}s ease-in ${delay}s forwards`;
        
        particlesContainer.appendChild(particle);
    }
}

function startYesReveal() {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    
    // Hide NO button if it's currently floating out of flow
    if (isFixed) {
        noBtn.style.display = 'none';
    }
    
    // Fade out ask screen
    askScreen.classList.add('fade-out');
    
    setTimeout(() => {
        askScreen.setAttribute('hidden', '');
        revealScreen.removeAttribute('hidden');
        
        // Start animations
        const pulsingHeart = revealScreen.querySelector('.pulsing-heart');
        pulsingHeart.classList.add('active');
        
        const lines = revealScreen.querySelectorAll('.reveal-line');
        lines.forEach((line, index) => {
            setTimeout(() => {
                line.classList.add('active');
            }, 300 * (index + 1)); // staggered 0.3s apart
        });
        
        // Spawn floating particles
        spawnParticles();
        
    }, 350);
}

// Click / Keyboard activation
yesBtn.addEventListener('click', () => {
    startYesReveal();
});

noBtn.addEventListener('click', (e) => {
    // Only accept keyboard clicks (where detail is 0). If it's a mouse/pointer click, ignore it.
    if (e.detail !== 0) {
        return;
    }
    
    // Real "No" via keyboard
    yesBtn.disabled = true;
    noBtn.disabled = true;
    yesBtn.style.opacity = '0.5';
    noBtn.style.opacity = '0.5';
    yesBtn.style.cursor = 'default';
    noBtn.style.cursor = 'default';
    
    captionText.classList.remove('visible');
    
    replyText.textContent = "that is alright. I am still glad I asked.";
    replyText.removeAttribute('hidden');
});
