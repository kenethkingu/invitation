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
    
    // If pointer is within 110px of button center, flee!
    if (distance < 110) {
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
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    let targetX, targetY;
    const margin = 20;
    const maxX = window.innerWidth - rect.width - margin;
    const maxY = window.innerHeight - rect.height - margin;

    // Fallback: jump to the farthest corner
    const jumpToFarthestCorner = () => {
        targetX = (pointerX > window.innerWidth / 2) ? margin : maxX;
        targetY = (pointerY > window.innerHeight / 2) ? margin : maxY;
    };

    if (distanceToCenter < 6) {
        // Bug 1: Dead-center approach
        jumpToFarthestCorner();
    } else {
        // Normalize vector (away from pointer)
        const nx = dx / distanceToCenter;
        const ny = dy / distanceToCenter;
        
        // Distance to move (150-180px)
        const moveDist = 150 + Math.random() * 30;
        
        // Add random wobble (±40px)
        const wobbleX = (Math.random() - 0.5) * 80;
        const wobbleY = (Math.random() - 0.5) * 80;
        
        targetX = rect.left + (nx * moveDist) + wobbleX;
        targetY = rect.top + (ny * moveDist) + wobbleY;
        
        // Clamp to viewport
        targetX = Math.max(margin, Math.min(targetX, maxX));
        targetY = Math.max(margin, Math.min(targetY, maxY));
        
        // Bug 2: Corner/edge trap check
        const clampedCenterX = targetX + rect.width / 2;
        const clampedCenterY = targetY + rect.height / 2;
        const distBackToPointer = Math.sqrt(Math.pow(clampedCenterX - pointerX, 2) + Math.pow(clampedCenterY - pointerY, 2));
        
        if (distBackToPointer < 110) {
            jumpToFarthestCorner();
        }
    }
    
    noBtn.style.left = `${targetX}px`;
    noBtn.style.top = `${targetY}px`;
}

// Mouse trigger
document.addEventListener('mousemove', (e) => {
    if (noBtn.disabled) return;
    handleDodge(e.clientX, e.clientY);
});

// Mobile touch trigger on the document
function handleTouch(e) {
    if (noBtn.disabled) return;
    const touch = e.touches[0];
    handleDodge(touch.clientX, touch.clientY);
}
document.addEventListener('touchstart', handleTouch, { passive: true });
document.addEventListener('touchmove', handleTouch, { passive: true });

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

noBtn.addEventListener('click', () => {
    // With pointer-events: none in CSS, this is only reachable via keyboard (Tab + Enter/Space)
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
