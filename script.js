const noBtn = document.getElementById('noBtn');
const yesBtn = document.getElementById('yesBtn');
const captionText = document.getElementById('captionText');
const attemptCounter = document.getElementById('attemptCounter');
const attemptCountSpan = document.getElementById('attemptCount');
const replyText = document.getElementById('replyText');
const buttonGroup = document.getElementById('buttonGroup');

let attempts = 0;
let isFixed = false;
let yesScale = 1;

const captions = [
    "nice try.",
    "not today.",
    "you'll have to be quicker than that.",
    "still missing you, by the way.",
    "at this point just say yes."
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
    // Increment attempts
    attempts++;
    attemptCountSpan.textContent = attempts;
    attemptCounter.removeAttribute('hidden');
    
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
        // Lock in current dimensions to avoid layout jumping
        const startWidth = rect.width;
        const startHeight = rect.height;
        noBtn.style.width = `${startWidth}px`;
        noBtn.style.height = `${startHeight}px`;
        
        // Set initial fixed position to current on-screen location
        noBtn.style.left = `${rect.left}px`;
        noBtn.style.top = `${rect.top}px`;
        
        // Need a tiny delay before adding the 'fixed' class so CSS transition works properly for the next move, 
        // but 'fixed' class itself sets position: fixed. 
        // Actually, setting inline left/top with position:fixed immediately is fine.
        noBtn.classList.add('fixed');
        isFixed = true;
        
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

    // Normalize vector
    const length = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / length;
    const ny = dy / length;
    
    // Distance to move (150-180px)
    const moveDist = 150 + Math.random() * 30;
    
    // Add random wobble (-30 to +30)
    const wobbleX = (Math.random() - 0.5) * 60;
    const wobbleY = (Math.random() - 0.5) * 60;
    
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
    // Only dodge if the buttons are still active
    if (noBtn.disabled) return;
    handleDodge(e.clientX, e.clientY);
});

// Mobile touch trigger on the button itself (before a tap registers)
noBtn.addEventListener('touchstart', (e) => {
    if (noBtn.disabled) return;
    e.preventDefault(); // Prevent click from firing
    
    const touch = e.touches[0];
    handleDodge(touch.clientX, touch.clientY);
}, { passive: false });

function disableButtons() {
    yesBtn.disabled = true;
    noBtn.disabled = true;
    
    yesBtn.style.opacity = '0.5';
    noBtn.style.opacity = '0.5';
    yesBtn.style.cursor = 'default';
    noBtn.style.cursor = 'default';
    
    // Stop ambient interactions
    captionText.classList.remove('visible');
    setTimeout(() => { captionText.style.display = 'none'; }, 300);
}

// Click / Keyboard activation
yesBtn.addEventListener('click', () => {
    disableButtons();
    replyText.textContent = "good — I'll text you the details 🤍";
    replyText.removeAttribute('hidden');
});

noBtn.addEventListener('click', () => {
    // If the user managed to click it (e.g. via keyboard tabbing + space/enter)
    disableButtons();
    replyText.textContent = "fair enough. I still miss you though.";
    replyText.removeAttribute('hidden');
});
