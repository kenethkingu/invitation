const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const captionText = document.getElementById('captionText');
const buttonGroup = document.getElementById('buttonGroup');
const askScreen = document.getElementById('askScreen');
const revealScreen = document.getElementById('revealScreen');
const particlesContainer = document.getElementById('particlesContainer');

let dodgeAttempts = 0;
let clickAttempts = 0;
let isFixed = false;
let yesScale = 1;

const dodgeCaptions = [
    "not yet.",
    "you will have to catch me first.",
    "I am not going anywhere though.",
    "still hoping you mean yes.",
    "okay, you could just say yes.",
    "I will wait as long as it takes.",
    "are you even trying.",
    "almost had it that time.",
    "a little to the left.",
    "too slow.",
    "this is getting embarrassing.",
    "I have all day.",
    "just click yes already.",
    "you are very persistent.",
    "I admire the dedication.",
    "we could have been on a date by now.",
    "do you need some help.",
    "maybe use two hands.",
    "I am rooting for you.",
    "okay now you are just playing.",
    "the yes button is right there.",
    "still no luck.",
    "I believe in you.",
    "take a deep breath and try again."
];

const clickCaptions = [
    "not going to happen.",
    "nice try.",
    "I already said no.",
    "not today either.",
    "you will have to work harder than that.",
    "still no. but I do appreciate the effort."
];

function getCaption(list, count) {
    const index = (count - 1) % list.length;
    return list[index];
}

function scaleYesButton() {
    if (yesScale < 1.6) {
        yesScale += 0.15;
        yesBtn.style.transform = `scale(${Math.min(yesScale, 1.6)})`;
    }
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
    dodgeAttempts++;
    
    // Update caption
    captionText.textContent = getCaption(dodgeCaptions, dodgeAttempts);
    captionText.classList.add('visible');
    
    scaleYesButton();

    // Switch to fixed positioning on first flee to detach from document flow
    if (!isFixed) {
        const startWidth = rect.width;
        const startHeight = rect.height;
        noBtn.style.width = `${startWidth}px`;
        noBtn.style.height = `${startHeight}px`;
        
        noBtn.style.transition = 'none';
        
        // Ensure the initial starting position is strictly clamped within the viewport
        const initialClientWidth = document.documentElement.clientWidth;
        const initialClientHeight = document.documentElement.clientHeight;
        const initialMaxX = initialClientWidth - startWidth - 10;
        const initialMaxY = initialClientHeight - startHeight - 10;
        
        const clampedStartX = Math.max(10, Math.min(rect.left, initialMaxX));
        const clampedStartY = Math.max(10, Math.min(rect.top, initialMaxY));
        
        noBtn.style.left = `${clampedStartX}px`;
        noBtn.style.top = `${clampedStartY}px`;
        
        noBtn.classList.add('fixed');
        isFixed = true;
        
        // Move the button to the body so it escapes the backdrop-filter containing block
        document.body.appendChild(noBtn);
        
        noBtn.offsetHeight; // Force reflow
        noBtn.style.transition = ''; // Restore CSS transitions
        
        rect = noBtn.getBoundingClientRect();
    }

    const btnCenterX = rect.left + rect.width / 2;
    const btnCenterY = rect.top + rect.height / 2;
    
    let dx = btnCenterX - pointerX;
    let dy = btnCenterY - pointerY;
    const distanceToCenter = Math.sqrt(dx * dx + dy * dy);

    let targetX, targetY;
    const clientWidth = document.documentElement.clientWidth;
    const clientHeight = document.documentElement.clientHeight;
    
    const isMobile = clientWidth < 480;
    const margin = isMobile ? 10 : 20;
    const maxX = clientWidth - rect.width - margin;
    const maxY = clientHeight - rect.height - margin;

    const jumpToFarthestCorner = () => {
        targetX = (pointerX > clientWidth / 2) ? margin : maxX;
        targetY = (pointerY > clientHeight / 2) ? margin : maxY;
    };

    if (distanceToCenter < 6) {
        jumpToFarthestCorner();
    } else {
        const nx = dx / distanceToCenter;
        const ny = dy / distanceToCenter;
        
        const jumpBase = isMobile ? 90 : 150;
        const moveDist = jumpBase + Math.random() * 30;
        
        const wobbleMag = isMobile ? 40 : 80;
        const wobbleX = (Math.random() - 0.5) * wobbleMag;
        const wobbleY = (Math.random() - 0.5) * wobbleMag;
        
        targetX = rect.left + (nx * moveDist) + wobbleX;
        targetY = rect.top + (ny * moveDist) + wobbleY;
        
        targetX = Math.max(margin, Math.min(targetX, maxX));
        targetY = Math.max(margin, Math.min(targetY, maxY));
        
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const particleIcons = ['🤍', '🩶', '✨'];
    const particleCount = 16;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        particle.textContent = particleIcons[Math.floor(Math.random() * particleIcons.length)];
        const clientWidth = document.documentElement.clientWidth;
        const maxLeft = Math.max(0, clientWidth - 40);
        particle.style.left = `${Math.random() * maxLeft}px`;
        
        const duration = 4 + Math.random() * 1;
        const delay = Math.random() * 1.5;
        
        const maxDrift = Math.min(clientWidth / 3, 100);
        const drift = (Math.random() - 0.5) * maxDrift * 2;
        particle.style.setProperty('--drift', `${drift}px`);
        
        const rot = (Math.random() - 0.5) * 360;
        particle.style.setProperty('--rot', `${rot}deg`);
        
        particle.style.animation = `floatUp ${duration}s ease-in ${delay}s forwards`;
        particlesContainer.appendChild(particle);
    }
}

function startYesReveal() {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    
    if (isFixed) {
        noBtn.style.display = 'none';
    }
    
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
});
