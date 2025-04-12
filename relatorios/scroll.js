// Variáveis globais
let isEnabled = false;
let isScrolling = false;
let lastX = 0;
let lastY = 0;
let isDragging = false;
let startTime = 0;
let initialX = 0;
let initialY = 0;
let velocityX = 0;
let velocityY = 0;
let lastTimeStamp = 0;
let animationFrame = null;

// Constantes globais
const INERTIA_DECAY = 0.93;
const MIN_VELOCITY = 0.1;

// Verifica estado inicial
chrome.storage.sync.get('touchScroll', function(data) {
    isEnabled = data.touchScroll ?? false;
    if (isEnabled) {
        enableTouchScroll();
    }
});

// Listener para mudanças de estado
chrome.runtime.onMessage.addListener((message) => {
    if ('touchScroll' in message) {
        isEnabled = message.touchScroll;
        if (isEnabled) {
            enableTouchScroll();
        } else {
            disableTouchScroll();
        }
    }
});

function enableTouchScroll() {
    const style = document.createElement('style');
    style.textContent = `
        body.scrolling {
            cursor: grabbing !important;
            user-select: none;
            scroll-behavior: smooth;
        }
        
        body.scrolling a,
        body.scrolling .router-link,
        body.scrolling [draggable] {
            -webkit-user-drag: none;
            -webkit-touch-callout: none;
            -webkit-user-select: none;
        }
    `;
    document.head.appendChild(style);
    addEventListeners();
}

function disableTouchScroll() {
    document.body.classList.remove('scrolling');
    removeEventListeners();
}

function addEventListeners() {
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('dragstart', handleDragStart, true);
}

function removeEventListeners() {
    document.removeEventListener('mousedown', handleMouseDown);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('dragstart', handleDragStart, true);
}

// Converter os event listeners existentes em funções nomeadas
function handleMouseDown(e) {
    if (!isEnabled) return;
    if (e.button === 0) {
        isScrolling = true;
        lastX = initialX = e.pageX;
        lastY = initialY = e.pageY;
        lastTimeStamp = Date.now();
        document.body.classList.add('scrolling');
        startTime = Date.now();
        isDragging = false;
        velocityX = velocityY = 0;
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
        }
    }
}

function handleMouseMove(e) {
    if (!isEnabled) return;
    if (!isScrolling) return;
    
    const currentTime = Date.now();
    const deltaTime = Math.max(currentTime - lastTimeStamp, 1);
    const moveX = e.pageX - lastX;
    const moveY = e.pageY - lastY;
    
    isDragging = true;
    
    // Cálculo suavizado da velocidade
    const speedFactor = 15.0;
    velocityX = (-moveX / deltaTime) * speedFactor;
    velocityY = (-moveY / deltaTime) * speedFactor;
    
    // Movimento direto mais preciso
    window.scrollBy({
        left: -moveX,
        top: -moveY,
        behavior: 'auto'
    });
    
    lastX = e.pageX;
    lastY = e.pageY;
    lastTimeStamp = currentTime;
    e.preventDefault();
}

function handleMouseUp(e) {
    if (!isEnabled) return;
    if (isScrolling) {
        const clickDuration = Date.now() - startTime;
        
        if (clickDuration < 200 && !isDragging) {
            const target = e.target.closest('a') || e.target.closest('.router-link');
            if (target) {
                const href = target.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        } else if (isDragging) {
            // Aplica um limite máximo à velocidade final
            const maxVelocity = 1000;
            velocityX = Math.max(Math.min(velocityX, maxVelocity), -maxVelocity);
            velocityY = Math.max(Math.min(velocityY, maxVelocity), -maxVelocity);
            
            requestAnimationFrame(applyInertia);
        }
        
        isScrolling = false;
        document.body.classList.remove('scrolling');
    }
}

function handleMouseLeave() {
    if (!isEnabled) return;
    if (isScrolling) {
        isScrolling = false;
        document.body.classList.remove('scrolling');
        if (isDragging) {
            requestAnimationFrame(applyInertia);
        }
    }
}

function handleDragStart(e) {
    if (!isEnabled) return;
    if (isDragging) {
        e.preventDefault();
    }
}

function applyInertia() {
    if (Math.abs(velocityX) > MIN_VELOCITY || Math.abs(velocityY) > MIN_VELOCITY) {
        window.scrollBy({
            left: velocityX,
            top: velocityY,
            behavior: 'auto'
        });

        velocityX *= INERTIA_DECAY;
        velocityY *= INERTIA_DECAY;
        
        animationFrame = requestAnimationFrame(applyInertia);
    }
}
