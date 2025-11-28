// --- ALIEN CANVAS CLOCK LOGIC (Functional and Complex) ---
(function () {
    const canvas = document.getElementById('digital-clock');
    const sr = document.getElementById('digital-clock-hidden');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        const desiredHeight = rect.height || 120;
        canvas.height = Math.max(1, Math.floor(desiredHeight * ratio));
        canvas.style.height = desiredHeight + 'px';
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }
    function mulberry32(a) {
        return function () {
            var t = (a += 0x6D2B79F5);
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function glyphInstructionsForDigit(digit) {
        const seed = 0x811C9DC5 ^ (digit * 9973);
        const rnd = mulberry32(seed >>> 0);
        const strokes = 3 + Math.floor(rnd() * 4);
        const instr = [];
        for (let i = 0; i < strokes; i++) {
            const type = Math.floor(rnd() * 3);
            const x = rnd();
            const y = rnd();
            const w = 0.08 + rnd() * 0.4;
            const h = 0.08 + rnd() * 0.4;
            const rot = rnd() * Math.PI * 2;
            const sw = 1 + Math.floor(rnd() * 6);
            instr.push({ type, x, y, w, h, rot, sw, a: rnd() });
        }
        return instr;
    }

    function drawGlyph(instr, x, y, w, h, color) {
        ctx.save();
        ctx.translate(x + w / 2, y + h / 2);
        for (const s of instr) {
            ctx.save();
            ctx.rotate(s.rot);
            ctx.globalAlpha = 0.6 + s.a * 0.4;
            ctx.lineWidth = s.sw;
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            const gx = (s.x - 0.5) * w;
            const gy = (s.y - 0.5) * h;
            const gw = s.w * w;
            const gh = s.h * h;

            if (s.type === 0) {
                ctx.beginPath();
                ctx.moveTo(gx - gw / 2, gy - gh / 2);
                ctx.lineTo(gx + gw / 4, gy + gh / 8);
                ctx.lineTo(gx - gw / 8, gy + gh / 2);
                ctx.stroke();
            } else if (s.type === 1) {
                ctx.beginPath();
                ctx.ellipse(gx, gy, gw / 2, gh / 2, 0, 0, Math.PI * (0.6 + s.a * 1.4));
                ctx.stroke();
            } else {
                ctx.beginPath();
                ctx.moveTo(gx, gy - gh / 2);
                ctx.lineTo(gx + gw / 2, gy + gh / 2);
                ctx.lineTo(gx - gw / 2, gy + gh / 2);
                ctx.closePath();
                ctx.globalCompositeOperation = 'source-over';
                ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }

    function renderTime() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        const timeStr = hh + mm + ss;

        if (sr) sr.textContent = hh + ':' + mm + ':' + ss;

        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        ctx.clearRect(0, 0, w, h);

        const cols = 6;
        const gap = Math.min(24, w * 0.02);
        const boxW = (w - gap * (cols - 1)) / cols;
        const boxH = Math.min(h, boxW * 0.9);
        const startX = (w - (boxW * cols + gap * (cols - 1))) / 2;
        const y = (h - boxH) / 2;

        for (let i = 0; i < cols; i++) {
            const digit = parseInt(timeStr[i], 10);
            const instr = glyphCache[digit];
            const hue = 40 + (i * 20) % 360;
            const color = `hsl(${hue} 90% 50%)`;
            const x = startX + i * (boxW + gap);
            drawGlyph(instr, x, y, boxW, boxH, color);
        }
    }

    const glyphCache = [];
    for (let d = 0; d <= 9; d++) glyphCache[d] = glyphInstructionsForDigit(d);

    function startClock() {
        resize();
        renderTime();
        setInterval(renderTime, 1000);
    }

    window.addEventListener('resize', () => { resize(); renderTime(); });

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startClock); } else startClock();
})();


// --- NEW INTERACTIVITY ---

// 1. Image Pre-loading & Source Array
const flashImages = [
    'flash-01.jpg', 'flash-02.jpg', 'flash-03.jpg', 'flash-04.jpg', 
    'flash-05.jpg', 'flash-06.jpg', 'flash-07.jpg', 'flash-08.jpg',
    'flash-09.jpg', 'flash-10.jpg', 'flash-11.jpg', 'flash-12.jpg',
    'flash-13.jpg', 'flash-14.jpg', 'flash-15.jpg', 'flash-16.jpg',
    'flash-17.jpg', 'flash-18.jpg', 'flash-19.jpg', 'flash-20.jpg',
    'flash-21.jpg', 'flash-22.jpg', 'flash-23.jpg', 'flash-24.jpg',
    'flash-25.jpg', 'flash-26.jpg', 'flash-27.jpg', 'flash-28.jpg',
    'flash-29.jpg', 'flash-30.jpg', 'flash-31.jpg', 'flash-32.jpg',
    'flash-33.jpg', 'flash-34.jpg', 'flash-35.jpg', 'flash-36.jpg',
    'flash-37.jpg', 'flash-38.jpg', 'flash-39.jpg', 'flash-40.jpg',
    'flash-41.jpg', 'flash-42.jpg', 'flash-43.jpg', 'flash-44.jpg',
    'flash-45.jpg', 'flash-46.jpg', 'flash-47.jpg', 'flash-48.jpg',
    'flash-49.jpg', 'flash-50.jpg', 'flash-51.jpg', 'flash-52.jpg',
    'flash-53.jpg', 'flash-54.jpg', 'flash-55.jpg', 'flash-56.jpg',
    'flash-57.jpg', 'flash-58.jpg', 'flash-59.jpg', 'flash-60.jpg',
    'flash-61.jpg', 'flash-62.jpg', 'flash-63.jpg', 'flash-64.jpg',
    'flash-65.jpg', 'flash-66.jpg', 'flash-67.jpg', 'flash-68.jpg',
    'flash-69.jpg', 'flash-70.jpg', 'flash-71.jpg', 'flash-72.jpg',
    'flash-73.jpg', 'flash-74.jpg', 'flash-75.jpg', 'flash-76.jpg',
    'flash-77.jpg', 'flash-78.jpg', 'flash-79.jpg', 'flash-80.jpg',
    'flash-81.jpg', 'flash-82.jpg', 'flash-83.jpg', 'flash-84.jpg',
    'flash-85.jpg', 'flash-86.jpg', 'flash-87.jpg', 'flash-88.jpg',
    'flash-89.jpg', 'flash-90.jpg', 'flash-91.jpg', 'flash-92.jpg',
    'flash-93.jpg', 'flash-94.jpg', 'flash-95.jpg', 'flash-96.jpg',
    'flash-97.jpg', 'flash-98.jpg'
];

// Pre-load all images when the page opens to prevent alt text errors during flash
window.onload = function() {
    for (let i = 0; i < flashImages.length; i++) {
        let img = new Image();
        img.src = flashImages[i];
    }
    // Automatically initialize player if elements exist (i.e., on player.html)
    if (typeof initializePlayer === 'function') {
        initializePlayer();
    }
}


// 2. Text Hover (VibeWorld Color Change)
const vibeWorld = document.querySelector('.sub-title');

if (vibeWorld) {
    vibeWorld.addEventListener('mouseover', function() {
        vibeWorld.style.color = '#FF0000'; 
    });
    
    vibeWorld.addEventListener('mouseout', function() {
        vibeWorld.style.color = ''; 
    });
}

// 3. Image Flash Swap Logic (Smoother and Faster)
const mainImage = document.querySelector('.hero-image img'); 
let flashInterval; 
let flashTimeout;

if (mainImage) {
    const originalSrc = 'simulation-scales.jpg';

    function resetFlash() {
        if (flashInterval) clearInterval(flashInterval);
        if (flashTimeout) clearTimeout(flashTimeout); 
        mainImage.src = originalSrc;
        document.body.classList.remove('shake');
    }
    
    function getRandomFlashImage() {
        const randomIndex = Math.floor(Math.random() * flashImages.length);
        return flashImages[randomIndex];
    }
    
    // --- MOUSE OVER: START HYPERSPEED FLASH & SHAKE ---
    mainImage.addEventListener('mouseover', function() {
        resetFlash();
        
        let shouldShake = false;
        
        // FASTER INTERVAL (75ms) and OPACITY/SHAKE TOGGLE
        flashInterval = setInterval(function() {
            mainImage.classList.add('flash-out');
            
            setTimeout(() => {
                mainImage.src = getRandomFlashImage();
                mainImage.classList.remove('flash-out');
            }, 10); // Swap source quickly after hiding
            
            if (shouldShake) {
                document.body.classList.add('shake');
            } else {
                document.body.classList.remove('shake');
            }
            shouldShake = !shouldShake;
            
        }, 75); // Faster interval for hyperspeed effect

        // 4. Set a new 2-second timeout to stop the animation automatically
        flashTimeout = setTimeout(function() {
            resetFlash();
        }, 2000); 
    });
    
    mainImage.addEventListener('mouseout', resetFlash);
}


// 5. PLAYLIST MANAGER & CONTROL LOGIC (Used on player.html only)
const playlist = [
    // 🔑 FINAL FIX: Corrected file names and added the 'audio/' path 
    { name: "Track 01", artist: "", src: "audio/01-track.wav" },
    { name: "Track 02", artist: "", src: "audio/02-track.wav" },
    { name: "Track 03", artist: "", src: "audio/03-track.wav" },
    { name: "Track 04", artist: "", src: "audio/04-track.wav" },
    { name: "Track 05", artist: "", src: "audio/05-track.wav" },
    { name: "Track 06", artist: "", src: "audio/06-track.wav" },
    { name: "Track 07", artist: "", src: "audio/07-track.wav" },
    { name: "Track 08", artist: "", src: "audio/08-track.wav" },
    { name: "Track 09", artist: "", src: "audio/09-track.wav" }
]; 

// --- IMPROVEMENT: Declaring all related variables in one place ---
let currentTrackIndex = 0;
let audio, songTitle, songArtist, playPauseBtn, nextBtn, prevBtn, trackButtons;


function loadTrack(index, autoPlay = true) {
    if (index < 0) {
        index = playlist.length - 1; 
    } else if (index >= playlist.length) {
        index = 0;
    }
    currentTrackIndex = index;
    const track = playlist[index];
    
    audio.src = track.src;
    songTitle.textContent = track.name;
    // IMPROVEMENT: Set text content to track artist property
    songArtist.textContent = track.artist; 

    if (trackButtons) {
        trackButtons.forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });
    }
    
    audio.load();

    if (autoPlay) {
        // IMPROVEMENT: Use the track name in the console log for easier debugging
        audio.play().catch(e => console.log(`Playback failed for ${track.name} (Browser Policy):`, e)); 
        playPauseBtn.textContent = 'Pause';
    } else {
        audio.pause();
        playPauseBtn.textContent = 'Play';
    }
}

function togglePlayback() {
    if (audio.paused) {
        audio.play().catch(e => console.log(`Playback failed on toggle (Browser Policy):`, e));
        playPauseBtn.textContent = 'Pause';
    } else {
        audio.pause();
        playPauseBtn.textContent = 'Play';
    }
}

// Global function to be called by player.html on load
function initializePlayer() {
    // Look up elements (safely done here)
    audio = document.getElementById('vibe-audio');
    songTitle = document.querySelector('.song-title');
    // IMPROVEMENT: Correctly targeting the class for song artist
    songArtist = document.querySelector('.song-artist'); 
    playPauseBtn = document.getElementById('play-pause-btn');
    nextBtn = document.getElementById('next-btn');
    prevBtn = document.getElementById('prev-btn');

    // Build track buttons array
    trackButtons = [];
    for (let i = 1; i <= 9; i++) {
        const btn = document.getElementById(`track-${i}`);
        if (btn) trackButtons.push(btn);
    }
    
    // Only run if the player controls exist on the page
    if (audio && playPauseBtn) {
        // FINAL FIX: Source starts empty to prevent autoload error
        audio.src = ''; 
        
        // Setup Control Listeners
        playPauseBtn.addEventListener('click', togglePlayback);
        nextBtn.addEventListener('click', () => loadTrack(currentTrackIndex + 1));
        prevBtn.addEventListener('click', () => loadTrack(currentTrackIndex - 1));
        audio.addEventListener('ended', () => loadTrack(currentTrackIndex + 1));

        // Setup Numerical Button Listeners
        trackButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                loadTrack(index, true); 
            });
        });
        
        // 🚀 CRITICAL FIX: Initialize the player with the first track
        loadTrack(currentTrackIndex, false); // Load track 0, but DO NOT autoplay

    } else {
        console.error("Audio playback elements not found. Check player.html IDs (vibe-audio, play-pause-btn, song-title).");
    }
}