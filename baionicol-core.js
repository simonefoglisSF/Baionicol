/* =========================================
   BAIONICOL OS - CORE LOGIC & AUDIO ENGINE
   ========================================= */

// 1. Setup Audio
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let audioInitialized = false;

document.addEventListener('click', () => {
    if (!audioInitialized) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        audioInitialized = true;
    }
}, { once: true });

// LA LIBRERIA SUONI UNIVERSALE
const SoundEngine = {
    playTone: function(freq, type, dur, vol) {
        if(audioCtx.state === 'suspended') return;
        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
    },
    playNoise: function(dur, vol) { 
        if(audioCtx.state === 'suspended') return;
        const bufferSize = audioCtx.sampleRate * dur; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = audioCtx.createBufferSource(); noise.buffer = buffer; const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(vol, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
        noise.connect(gain); gain.connect(audioCtx.destination); noise.start();
    },
    
    hover: () => SoundEngine.playTone(1500, 'sine', 0.05, 0.02),
    click: () => { SoundEngine.playTone(200, 'square', 0.1, 0.06); SoundEngine.playNoise(0.08, 0.1); },
    sliderTick: () => SoundEngine.playTone(800, 'triangle', 0.02, 0.01),
    levelUp: () => { SoundEngine.playTone(800, 'sine', 0.1, 0.05); setTimeout(() => SoundEngine.playTone(1200, 'sine', 0.3, 0.05), 100); },
    success: () => { SoundEngine.playTone(440, 'sine', 0.1, 0.05); setTimeout(() => SoundEngine.playTone(554, 'sine', 0.1, 0.05), 100); setTimeout(() => SoundEngine.playTone(659, 'sine', 0.3, 0.05), 200); },
    warning: () => { SoundEngine.playTone(150, 'sawtooth', 0.2, 0.08); setTimeout(() => SoundEngine.playTone(120, 'sawtooth', 0.3, 0.08), 100); },
    calcBeep: () => SoundEngine.playTone(2000, 'square', 0.05, 0.02),
    dataLoad: () => { SoundEngine.playTone(800, 'square', 0.05, 0.03); setTimeout(() => SoundEngine.playTone(1200, 'square', 0.1, 0.03), 80); },
    printTicket: () => { let t = 0; let int = setInterval(() => { SoundEngine.playTone(800 + Math.random()*400, 'square', 0.05, 0.02); t++; if(t>10) clearInterval(int); }, 80); },
    
    // Suoni Specifici Diagnostica aggiunti:
    alarm: () => { SoundEngine.playTone(100, 'sawtooth', 0.5, 0.1); setTimeout(() => SoundEngine.playTone(150, 'sawtooth', 0.5, 0.1), 500); },
    resultGood: () => { SoundEngine.playTone(600, 'sine', 0.1, 0.05); setTimeout(() => SoundEngine.playTone(800, 'sine', 0.2, 0.05), 100); },
    resultBad: () => { SoundEngine.playTone(150, 'sawtooth', 0.3, 0.1); setTimeout(() => SoundEngine.playTone(100, 'sawtooth', 0.5, 0.1), 300); },
    scanSymptom: () => { SoundEngine.playTone(2000, 'triangle', 0.05, 0.02); setTimeout(() => SoundEngine.playTone(2200, 'triangle', 0.05, 0.02), 100); },
    good: () => { SoundEngine.playTone(400, 'sine', 0.1, 0.05); setTimeout(() => SoundEngine.playTone(600, 'sine', 0.2, 0.05), 100); },
    bad: () => { SoundEngine.playTone(150, 'sawtooth', 0.2, 0.08); setTimeout(() => SoundEngine.playTone(100, 'sawtooth', 0.3, 0.08), 100); }
};

// 2. Setup Animazione Cursore
document.addEventListener("DOMContentLoaded", () => {
    const cursorRing = document.getElementById('cursor-ring');
    if (!cursorRing) return;

    let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2, ringX = mouseX, ringY = mouseY;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    
    function animateCursor() {
        ringX += (mouseX - ringX) * 0.2; ringY += (mouseY - ringY) * 0.2;
        cursorRing.style.transform = `translate(calc(${ringX}px - 50%), calc(${ringY}px - 50%))`;
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Applica effetti a tutti gli elementi interattivi
    const applyInteractiveEffects = () => {
        document.querySelectorAll('.interactive-el, button, a').forEach(el => {
            // Evita di assegnare eventi multipli
            if(el.dataset.hasCoreEvents) return; 
            
            el.addEventListener('mouseenter', () => { 
                if(el.classList.contains('close-modal-btn') || document.body.classList.contains('defcon-mode')) {
                    cursorRing.classList.add('hovering-danger');
                } else if (!el.classList.contains('slider-input')) {
                    cursorRing.classList.add('hovering'); 
                }
                SoundEngine.hover(); 
            });
            el.addEventListener('mouseleave', () => { 
                cursorRing.classList.remove('hovering', 'hovering-danger'); 
            });
            
            if(el.tagName !== 'INPUT' && el.tagName !== 'SELECT' && !el.classList.contains('profile-badge') && !el.classList.contains('task-card') && !el.classList.contains('slider-input')) {
                el.addEventListener('click', () => { SoundEngine.click(); });
            }
            
            el.dataset.hasCoreEvents = "true";
        });

        // Sliders specifici
        document.querySelectorAll('.slider-input').forEach(el => {
            if(el.dataset.hasSliderEvents) return;
            el.addEventListener('mousedown', () => cursorRing.classList.add('grabbing'));
            el.addEventListener('mouseup', () => cursorRing.classList.remove('grabbing'));
            el.addEventListener('mouseleave', () => cursorRing.classList.remove('grabbing'));
            el.dataset.hasSliderEvents = "true";
        });
    };

    applyInteractiveEffects();
    
    // MutationObserver per applicare gli eventi anche agli elementi caricati dinamicamente (es. da Spline o JS)
    const observer = new MutationObserver(applyInteractiveEffects);
    observer.observe(document.body, { childList: true, subtree: true });
});

// 3. Funzione Globale di Reset Profilo
function resetProfile() {
    SoundEngine.click();
    if(confirm("ATTENZIONE: Vuoi ricalibrare l'architettura del sistema? Tutti i moduli si formatteranno. Verrai reindirizzato al terminale principale.")) {
        localStorage.removeItem('baionicol_profile');
        window.location.href = 'index.html';
    }
}

// 4. Navigazione con Zoom
function animateAndNavigate(targetUrl) {
    document.body.classList.add('zoom-in');
    setTimeout(() => { window.location.href = targetUrl; }, 550);

}
// ==========================================
// 5. SMART VIDEO OBSERVER (Ottimizzazione CPU)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Cerca tutti i video presenti nella pagina
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) return; // Se non ci sono video, si ferma

    // Impostazioni: il video deve essere visibile almeno al 10% per partire
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 
    };

    // Crea l'osservatore
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Il video è nello schermo -> PLAY
                entry.target.play().catch(e => console.log("Play bloccato dal browser:", e));
            } else {
                // Il video è fuori dallo schermo -> PAUSA
                entry.target.pause();
            }
        });
    }, observerOptions);

    // Assegna l'osservatore a ogni video trovato
    videos.forEach(video => {
        videoObserver.observe(video);
    });
});
