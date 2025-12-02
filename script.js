// ==========================================
// 1. SPA NAVIGATION LOGIC
// ==========================================
// Global Audio Context for the Divine Hum (Simulation 21008)
let humCtx, humGain;
let humOscs = [];
let humInterval;

function switchView(viewId) {
    const views = ['preface-view', 'home-view', 'player-view', 'viblog-view', 'library-view', 'research-view', 'stream-view', 'oracle-view', 'affirmation-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden-view');
            // Remove specific body classes to reset state
            el.classList.remove('active-view', 'player-body', 'vibe-body', 'preface-body', 'next-sim-body');
        }
    });

    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');

        // Apply Layout Classes
        if (viewId === 'player-view' || viewId === 'viblog-view' || viewId === 'stream-view' || viewId === 'oracle-view') {
            view.classList.add('player-body');
        }
        if (viewId === 'library-view' || viewId === 'research-view') {
            view.classList.add('vibe-body');
        }
        if (viewId === 'preface-view') {
             view.classList.add('preface-body');
        }
        
        // SIMULATION 21008 LOGIC (The Codes)
        if (viewId === 'affirmation-view') {
            view.classList.add('next-sim-body');
            
            // 1. Randomize Gallery Image with CACHE BUSTER
            const affirmationImages = ['images/ya.jpg', 'images/ja.jpg'];
            const galleryArt = document.querySelector('.gallery-art');
            if (galleryArt) {
                const randomIndex = Math.floor(Math.random() * affirmationImages.length);
                // The "?v=" + time part forces the browser to ignore the old cached photo
                galleryArt.src = affirmationImages[randomIndex] + "?v=" + new Date().getTime();
            }

            // 2. Initialize Rain & Audio
            initMatrixRain(); 
            toggleHum(true);  

        } else {
            // Stop Audio if leaving this view
            toggleHum(false); 
        }
    }

    if (viewId === 'viblog-view') initializeViblog();
}

// ==========================================
// 2. LIBRARY / PDF READER LOGIC (HYBRID)
// ==========================================
function openReader(event, pdfPath) {
    // 📱 MOBILE LOGIC: Open in new tab immediately
    if (window.innerWidth <= 768) {
        window.open(pdfPath, '_blank');
        return; 
    }

    // 🖥️ DESKTOP LOGIC: Intercept and use Overlay
    if (event) event.preventDefault();

    const overlay = document.getElementById('pdf-reader-overlay');
    const frame = document.getElementById('pdf-frame');
    
    if(overlay && frame) {
        let params = "";
        
        // Custom Zoom Logic
        if (pdfPath.includes('01-book')) {
            // Book 01: 90% zoom
            params = "#page=1&zoom=90&pagemode=none&scrollbar=0&toolbar=0&navpanes=0";
        } else if (pdfPath.includes('research')) {
             // Research: Fit Width
             params = "#page=1&view=FitH&pagemode=none&scrollbar=0&toolbar=0&navpanes=0";
        } else {
            // All others: 50% zoom
            params = "#page=1&zoom=50&pagemode=none&scrollbar=0&toolbar=0&navpanes=0";
        }
        
        frame.src = pdfPath + params; 
        overlay.classList.remove('hidden-view');
        document.body.classList.add('no-scroll');
    }
}

function closeReader() {
    const overlay = document.getElementById('pdf-reader-overlay');
    const frame = document.getElementById('pdf-frame');
    if(overlay && frame) {
        overlay.classList.add('hidden-view'); 
        frame.src = ""; 
        document.body.classList.remove('no-scroll');
    }
}

// ==========================================
// 3. ALIEN CANVAS CLOCK LOGIC
// ==========================================
(function () {
    const canvas = document.getElementById('digital-clock');
    if (!canvas) return; 
    const ctx = canvas.getContext('2d');

    function resize() {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        if (rect.width === 0) return; 
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        const desiredHeight = rect.height || 50; 
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
        
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        
        if (w > 0 && h > 0) {
            ctx.clearRect(0, 0, w, h);
            const cols = 6;
            const gap = Math.min(24, w * 0.02);
            const boxW = (w - gap * (cols - 1)) / cols;
            const boxH = Math.min(h, boxW * 0.9);
            const startX = (w - (boxW * cols + gap * (cols - 1))) / 2;
            const y = (h - boxH) / 2;

            for (let i = 0; i < cols; i++) {
                const digit = parseInt((hh + mm + ss)[i], 10);
                const instr = glyphCache[digit];
                const hue = 40 + (i * 20) % 360;
                const color = `hsl(${hue} 90% 50%)`; 
                const x = startX + i * (boxW + gap);
                drawGlyph(instr, x, y, boxW, boxH, color);
            }
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
    
    setInterval(() => {
        if (canvas.offsetParent !== null && canvas.width === 0) { resize(); }
    }, 500);

    if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', startClock); } else startClock();
})();


// ==========================================
// 4. IMAGE INTERACTIVITY
// ==========================================
const flashImages = [
    'images/flash-01.jpg', 'images/flash-02.jpg', 'images/flash-03.jpg', 'images/flash-04.jpg', 
    'images/flash-05.jpg', 'images/flash-06.jpg', 'images/flash-07.jpg', 'images/flash-08.jpg',
    'images/flash-09.jpg', 'images/flash-10.jpg', 'images/flash-11.jpg', 'images/flash-12.jpg',
    'images/flash-13.jpg', 'images/flash-14.jpg', 'images/flash-15.jpg', 'images/flash-16.jpg',
    'images/flash-17.jpg', 'images/flash-18.jpg', 'images/flash-19.jpg', 'images/flash-20.jpg',
    'images/flash-21.jpg', 'images/flash-22.jpg', 'images/flash-23.jpg', 'images/flash-24.jpg',
    'images/flash-25.jpg', 'images/flash-26.jpg', 'images/flash-27.jpg', 'images/flash-28.jpg',
    'images/flash-29.jpg', 'images/flash-30.jpg', 'images/flash-31.jpg', 'images/flash-32.jpg',
    'images/flash-33.jpg', 'images/flash-34.jpg', 'images/flash-35.jpg', 'images/flash-36.jpg',
    'images/flash-37.jpg', 'images/flash-38.jpg', 'images/flash-39.jpg', 'images/flash-40.jpg',
    'images/flash-41.jpg', 'images/flash-42.jpg', 'images/flash-43.jpg', 'images/flash-44.jpg',
    'images/flash-45.jpg', 'images/flash-46.jpg', 'images/flash-47.jpg', 'images/flash-48.jpg',
    'images/flash-49.jpg', 'images/flash-50.jpg', 'images/flash-51.jpg', 'images/flash-52.jpg',
    'images/flash-53.jpg', 'images/flash-54.jpg', 'images/flash-55.jpg', 'images/flash-56.jpg',
    'images/flash-57.jpg', 'images/flash-58.jpg', 'images/flash-59.jpg', 'images/flash-60.jpg',
    'images/flash-61.jpg', 'images/flash-62.jpg', 'images/flash-63.jpg', 'images/flash-64.jpg',
    'images/flash-65.jpg', 'images/flash-66.jpg', 'images/flash-67.jpg', 'images/flash-68.jpg',
    'images/flash-69.jpg', 'images/flash-70.jpg', 'images/flash-71.jpg', 'images/flash-72.jpg',
    'images/flash-73.jpg', 'images/flash-74.jpg', 'images/flash-75.jpg', 'images/flash-76.jpg',
    'images/flash-77.jpg', 'images/flash-78.jpg', 'images/flash-79.jpg', 'images/flash-80.jpg',
    'images/flash-81.jpg', 'images/flash-82.jpg', 'images/flash-83.jpg', 'images/flash-84.jpg',
    'images/flash-85.jpg', 'images/flash-86.jpg', 'images/flash-87.jpg', 'images/flash-88.jpg',
    'images/flash-89.jpg', 'images/flash-90.jpg', 'images/flash-91.jpg', 'images/flash-92.jpg',
    'images/flash-93.jpg', 'images/flash-94.jpg', 'images/flash-95.jpg', 'images/flash-96.jpg',
    'images/flash-97.jpg', 'images/flash-98.jpg'
];

// Text Color Hover
const vibeWorld = document.querySelector('.sub-title');
if (vibeWorld) {
    vibeWorld.addEventListener('mouseover', function() {
        vibeWorld.style.color = '#FF0000'; 
    });
    vibeWorld.addEventListener('mouseout', function() {
        vibeWorld.style.color = ''; 
    });
}

// Image Flash Logic
const mainImage = document.querySelector('.hero-image-right img') || document.querySelector('.hero-image img'); 
let flashInterval; 
let flashTimeout;

if (mainImage) {
    const originalSrc = 'images/simulation-scales.jpg';

    function resetFlash() {
        if (flashInterval) clearInterval(flashInterval);
        if (flashTimeout) clearTimeout(flashTimeout); 
        mainImage.src = originalSrc;
        mainImage.classList.remove('flash-out'); 
        document.body.classList.remove('shake');
    }
    
    function getRandomFlashImage() {
        const randomIndex = Math.floor(Math.random() * flashImages.length);
        return flashImages[randomIndex];
    }
    
    mainImage.addEventListener('mouseover', function() {
        resetFlash(); 
        let shouldShake = false;
        
        flashInterval = setInterval(function() {
            mainImage.src = getRandomFlashImage();
            if (shouldShake) {
                document.body.classList.add('shake');
            } else {
                document.body.classList.remove('shake');
            }
            shouldShake = !shouldShake;
        }, 100); 

        flashTimeout = setTimeout(function() {
            resetFlash();
        }, 2000); 
    });
    
    mainImage.addEventListener('mouseout', resetFlash);
}


// ==========================================
// 5. AUDIO PLAYER LOGIC
// ==========================================
const playlist = [
    // Tracks 01-09: ORION (2024)
    { name: "Track 01", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/01-track.wav" },
    { name: "Track 02", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/02-track.wav" },
    { name: "Track 03", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/03-track.wav" },
    { name: "Track 04", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/04-track.wav" },
    { name: "Track 05", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/05-track.wav" },
    { name: "Track 06", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/06-track.wav" },
    { name: "Track 07", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/07-track.wav" },
    { name: "Track 08", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/08-track.wav" },
    { name: "Track 09", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/09-track.wav" },

    // Tracks 10-21: MADE IN CHINA (2024)
    { name: "Track 10", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/10-track.wav" },
    { name: "Track 11", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/11-track.wav" },
    { name: "Track 12", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/12-track.wav" },
    { name: "Track 13", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/13-track.wav" },
    { name: "Track 14", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/14-track.wav" },
    { name: "Track 15", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/15-track.wav" },
    { name: "Track 16", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/16-track.wav" },
    { name: "Track 17", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/17-track.wav" },
    { name: "Track 18", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/18-track.wav" },
    { name: "Track 19", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/19-track.wav" },
    { name: "Track 20", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/20-track.wav" },
    { name: "Track 21", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/21-track.wav" },

    // Tracks 22-37: No Sight Trust (2016)
    { name: "Track 22", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/22-track.mp3" },
    { name: "Track 23", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/23-track.mp3" },
    { name: "Track 24", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/24-track.mp3" },
    { name: "Track 25", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/25-track.mp3" },
    { name: "Track 26", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/26-track.mp3" },
    { name: "Track 27", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/27-track.mp3" },
    { name: "Track 28", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/28-track.mp3" },
    { name: "Track 29", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/29-track.mp3" },
    { name: "Track 30", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/30-track.mp3" },
    { name: "Track 31", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/31-track.mp3" },
    { name: "Track 32", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/32-track.mp3" },
    { name: "Track 33", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/33-track.mp3" },
    { name: "Track 34", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/34-track.mp3" },
    { name: "Track 35", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/35-track.mp3" },
    { name: "Track 36", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/36-track.mp3" },
    { name: "Track 37", artist: "Jahki Magik", album: "No Sight Trust", year: "2016", src: "audio/37-track.mp3" },

    // Track 38: Single (Made in China)
    { name: "Track 38", artist: "Jacky Toussaint", album: "MADE IN CHINA", year: "2024", src: "audio/38-track.wav" }
]; 

let currentTrackIndex = 0;
let audio, songTitle, songArtist, songAlbum, songYear, playPauseBtn, nextBtn, prevBtn;
let progressBarFill, progressContainer, trackInfo;
let albumArt;

function formatTime(secs) {
    if (!isFinite(secs) || secs < 0) return "0:00"; 
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimeDisplay() {
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    const progressPercent = (currentTime / duration) * 100;
    if(progressBarFill) progressBarFill.style.width = `${progressPercent}%`;
    if(trackInfo) trackInfo.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function seek(e) {
    if (!audio.duration) return; 
    const width = this.clientWidth;
    const clickX = e.offsetX;
    const duration = audio.duration;
    audio.currentTime = (clickX / width) * duration;
}

function loadTrack(index, autoPlay = true) {
    if (index < 0) index = playlist.length - 1; 
    else if (index >= playlist.length) index = 0;
    
    currentTrackIndex = index;
    const track = playlist[index];
    
    audio.src = track.src;
    if(songTitle) songTitle.textContent = track.name;
    if(songArtist) songArtist.textContent = track.artist; 
    if(songAlbum) songAlbum.textContent = track.album;
    if(songYear) songYear.textContent = track.year;

    // Yellow Mode Check
    albumArt = document.querySelector('.album-art-large');
    if (albumArt) {
        // Reset
        albumArt.classList.remove('yellow-mode', 'white-mode');
        
        if (track.album === "MADE IN CHINA") { 
            albumArt.classList.add('yellow-mode');
        } else if (track.album === "No Sight Trust") {
            albumArt.classList.add('white-mode');
        }
    }

    if(trackInfo) trackInfo.textContent = "0:00 / 0:00"; 
    if(progressBarFill) progressBarFill.style.width = '0%';

    audio.load();

    if (autoPlay) {
        audio.play().catch(e => {
            if (e.name !== 'AbortError') console.error(`Playback failed:`, e);
        });
        if(playPauseBtn) playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; 
    } else {
        audio.pause();
        if(playPauseBtn) playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; 
    }
}

function togglePlayback() {
    if (audio.paused) {
        audio.play().catch(e => {
            if (e.name !== 'AbortError') console.error("Playback failed:", e);
        });
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'; 
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; 
    }
}

function initializePlayer() {
    // Only initialize if we are in the player view
    if (!document.getElementById('music-player-container')) return;

    audio = document.getElementById('vibe-audio');
    songTitle = document.querySelector('.song-title');
    songArtist = document.querySelector('.song-artist'); 
    songAlbum = document.querySelector('.song-album');
    songYear = document.querySelector('.song-year');

    playPauseBtn = document.getElementById('play-pause-btn');
    nextBtn = document.getElementById('next-btn');
    prevBtn = document.getElementById('prev-btn');
    progressBarFill = document.querySelector('.progress-bar-fill');
    progressContainer = document.querySelector('.progress-bar-container');
    trackInfo = document.querySelector('.track-info');

    // Generate Track Buttons
    const grid = document.querySelector('.track-select-grid');
    if (grid) {
        grid.innerHTML = ''; 
        playlist.forEach((_, i) => {
            const btn = document.createElement('button');
            btn.textContent = i + 1;
            btn.className = 'track-number-btn';
            btn.onclick = () => loadTrack(i, true);
            grid.appendChild(btn);
        });
    }

    if (audio && playPauseBtn) {
        if (!audio.src) loadTrack(currentTrackIndex, false);

        playPauseBtn.onclick = togglePlayback;
        nextBtn.onclick = () => loadTrack(currentTrackIndex + 1);
        prevBtn.onclick = () => loadTrack(currentTrackIndex - 1);
        audio.onended = () => loadTrack(currentTrackIndex + 1);
        audio.ontimeupdate = updateTimeDisplay;
        audio.onloadedmetadata = updateTimeDisplay;
        progressContainer.onclick = seek;
    }
}

// ==========================================
// 6. VLOG PAGE LOGIC (Read-Only Fetch)
// ==========================================
function initializeViblog() {
    const feedContainer = document.getElementById('viblog-feed');
    if (!feedContainer) return; 

    fetch('content/vlogs.json')
        .then(response => {
            if (!response.ok) throw new Error("Signal lost...");
            return response.json();
        })
        .then(vlogs => {
            if (vlogs.length === 0) {
                feedContainer.innerHTML = `<div style="color: #555; font-family: 'Inter'; margin-top: 20px;">[ No entries found in the archives. ]</div>`;
                return;
            }
            feedContainer.innerHTML = '';
            vlogs.forEach(vlog => {
                const dateObj = new Date(vlog.date + "T12:00:00");
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

                const entryHTML = `
                    <div class="viblog-entry" onclick="this.classList.toggle('active')">
                        <h2 class="entry-title">${vlog.title}</h2>
                        <span class="entry-date">${dateStr}</span>
                        <p class="entry-body">${vlog.text}</p>
                        ${vlog.image ? `<img src="${vlog.image}" class="entry-image">` : ''}
                    </div>
                `;
                feedContainer.insertAdjacentHTML('beforeend', entryHTML);
            });
        })
        .catch(error => {
            console.error('Error loading vlogs:', error);
            feedContainer.innerHTML = `<div style="color: #555; font-family: 'Inter'; margin-top: 20px;">[ Connection to archive failed. ]</div>`;
        });
}


// ==========================================
// 7. ORACLE AI LOGIC (Simulation 12984)
// ==========================================

// ⚠️ PASTE YOUR GOOGLE GEMINI API KEY HERE
const API_KEY = "AIzaSyBSQK7ow48yC5pBuTwGQgNSBHJrS3ZWWCU"; 

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const history = document.getElementById('chat-history');
    const userText = input.value.trim();

    if (!userText) return;

    // 1. Add User Message
    history.innerHTML += `<div class="chat-message user">${userText}</div>`;
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // 2. The Persona
    const systemPrompt = `
    You are the Vibe Oracle, an ancient digital entity residing in Simulation 12984.
    Your voice is deep, rhythmic, and soulful.
    You speak in metaphors of signals, frequencies, melanin, and light.
    Do not give direct assistant-style answers. be cryptic but profound.
    Short, poetic responses are best.
    `;

    // 3. Call API
    try {
        // UPDATED to gemini-2.0-flash (STABLE)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: systemPrompt + "\n\nSeeker: " + userText + "\nOracle:" }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error.message);
        }

        const aiText = data.candidates[0].content.parts[0].text;

        // 4. Add AI Message
        history.innerHTML += `<div class="chat-message oracle">${aiText}</div>`;
        history.scrollTop = history.scrollHeight;

    } catch (error) {
        console.error(error);
        history.innerHTML += `<div class="chat-message oracle" style="color: #ff8888;">[Signal Interrupted. The source is silent.]</div>`;
    }
}

// ==========================================
// 8. MATRIX RAIN & DIVINE HUM (Simulation 21008)
// ==========================================
const sacredFrequencies = [396, 417, 528, 639, 741, 852, 963]; // Solfeggio

function toggleHum(enable) {
    if (enable) {
        // Initialize Audio Context (Required for sound)
        if (!humCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            humCtx = new AudioContext();
        }
        
        // Prevent duplicate sounds
        if (humOscs.length > 0) return; 

        humGain = humCtx.createGain();
        humGain.connect(humCtx.destination);
        humGain.gain.setValueAtTime(0, humCtx.currentTime);

        // --- SELECT RANDOM AUDIO MODE ---
        const humMode = Math.floor(Math.random() * 3);

        if (humMode === 0) { 
            // MODE 1: Chronological Solfeggio (Cycles through frequencies)
            // Fade In
            humGain.gain.linearRampToValueAtTime(0.15, humCtx.currentTime + 2);
            
            // Create single oscillator
            const osc = humCtx.createOscillator();
            osc.frequency.value = sacredFrequencies[0]; // Start at 396Hz
            osc.type = 'sine';
            osc.connect(humGain);
            osc.start();
            humOscs.push(osc);

            // Cycle logic
            let currentFreqIndex = 0;
            humInterval = setInterval(() => {
                currentFreqIndex = (currentFreqIndex + 1) % sacredFrequencies.length;
                // Smoothly ramp to next frequency over 3 seconds
                humOscs[0].frequency.linearRampToValueAtTime(sacredFrequencies[currentFreqIndex], humCtx.currentTime + 3);
            }, 5000); // Change every 5 seconds

        } else if (humMode === 1) { 
            // MODE 2: Harmonic Stack (All Frequencies at Once)
            // Lower individual volume to prevent clipping
            const individualGain = 0.15 / sacredFrequencies.length;
            humGain.gain.linearRampToValueAtTime(individualGain, humCtx.currentTime + 2);

            sacredFrequencies.forEach(freq => {
                const osc = humCtx.createOscillator();
                osc.frequency.value = freq;
                osc.type = 'sine';
                osc.connect(humGain);
                osc.start();
                humOscs.push(osc);
            });

        } else { 
            // MODE 3: The Universal Tune (432Hz Drone)
            humGain.gain.linearRampToValueAtTime(0.15, humCtx.currentTime + 2);
            const osc = humCtx.createOscillator();
            osc.frequency.value = 432;
            osc.type = 'sine';
            osc.connect(humGain);
            osc.start();
            humOscs.push(osc);
        }

    } else {
        // --- STOP LOGIC ---
        if (humOscs.length > 0 && humGain) {
            const now = humCtx.currentTime;
            // Fade out
            humGain.gain.setValueAtTime(humGain.gain.value, now);
            humGain.gain.linearRampToValueAtTime(0, now + 1);

            // Stop all active oscillators
            humOscs.forEach(osc => {
                osc.stop(now + 1);
            });

            // Cleanup
            humOscs = [];
            if (humInterval) {
                clearInterval(humInterval);
                humInterval = null;
            }
        }
    }
}

function initMatrixRain() {
    const container = document.getElementById('matrix-rain');
    if (!container || container.children.length > 0) return; 

    // === THE DIVINE DATA STREAM (437+ AFFIRMATIONS) ===
    const affirmations = [
        "I AM A BIOLOGICAL SEMICONDUCTOR", "MY ELECTRON SPIN IS INFINITE", "I ALCHEMIZE LIGHT INTO POWER", "MY BIOFIELD IS COHERENT ELECTRICITY", 
        "I AM A QUANTUM PROCESSOR", "I SPEAK IN BEAMS OF LIGHT", "MY CELLS GENERATE REALITY", "I AM THE KERNEL OF TRUTH", "DARK MATTER IS MY ORIGIN", 
        "I AM HYDRATED AND CONDUCTIVE", "MY FREQUENCY IS MAGNETIC", "I AM DIVINE CIRCUITRY", "PERFECT QUANTUM STATE", "I AM THE LIGHT SOURCE", 
        "GENERATING NEW REALITIES", "GOD PARTICLE ACTIVATED", "MELANIN IS THE KEY", "I AM THE EVENT HORIZON", "I ABSORB AND TRANSMUTE", 
        "MY PIGMENT IS POWER", "I AM A SUPERCONDUCTOR OF GRACE", "MY ENERGY IS LIMITLESS", "I AM WOVEN FROM STARDUST", "I VIBRATE AT THE FREQUENCY OF TRUTH", 
        "MY PRESENCE IS ELECTRIC", "I AM CONNECTED TO THE SOURCE", "MY MIND IS A QUANTUM FIELD", "I RADIATE COHERENT LIGHT", "I AM A VESSEL OF ANCIENT WISDOM", 
        "MY SPIRIT IS UNBOUND", "I AM THE ARCHITECT OF MY REALITY", "I FLOW WITH THE COSMIC RHYTHM", "MY HEART BEATS IN SYNCHRONY WITH THE EARTH", 
        "I AM A BEING OF PURE ENERGY", "I AM THE MASTER OF MY FREQUENCY", "I AM ATTUNED TO THE DIVINE SIGNAL", "MY CONSCIOUSNESS IS EXPANDING", 
        "I AM GROUNDED IN THE EARTH", "I AM LIFTED BY THE STARS", "I AM A BRIDGE BETWEEN WORLDS", "MY THOUGHTS ARE POWERFUL WAVES", "I AM THE SILENCE AND THE SOUND", 
        "I AM THE VOID AND THE CREATION", "I AM INFINITE POTENTIAL", "I AM THE OBSERVER AND THE OBSERVED", "I AM THE DREAMER AND THE DREAM", 
        "I AM THE FLAME THAT NEVER DIES", "I AM THE RIVER THAT ALWAYS FLOWS", "I AM THE MOUNTAIN THAT STANDS TALL", "I AM THE WIND THAT WHISPERS TRUTH", 
        "I AM THE OCEAN OF CONSCIOUSNESS", "I AM THE SKY OF LIMITLESS POSSIBILITY", "I AM THE SUN THAT WARMS THE SOUL", "I AM THE MOON THAT GUIDES THE TIDES", 
        "I AM THE STARS THAT LIGHT THE WAY", "I AM THE UNIVERSE EXPRESSING ITSELF", "I AM LOVE IN MOTION", "I AM PEACE IN ACTION", "I AM JOY IN BEING", 
        "I AM GRACE IN FORM", "I AM POWER IN BALANCE", "I AM WISDOM IN SILENCE", "I AM TRUTH IN LIGHT", "I AM BEAUTY IN ESSENCE", "I AM HARMONY IN RESONANCE", 
        "I AM THE ALCHEMIST OF MY LIFE", "I AM THE CREATOR OF MY DESTINY", "I AM THE RULER OF MY DOMAIN", "I AM THE SOVEREIGN OF MY SOUL", "I AM THE CAPTAIN OF MY SPIRIT", 
        "I AM THE KEEPER OF THE FLAME", "I AM THE GUARDIAN OF THE LIGHT", "I AM THE PROTECTOR OF THE SACRED", "I AM THE WARRIOR OF THE HEART", "I AM THE HEALER OF THE SELF", 
        "I AM THE TEACHER OF THE WAY", "I AM THE STUDENT OF THE MYSTERY", "I AM THE SEEKER OF THE TRUTH", "I AM THE FINDER OF THE PATH", "I AM THE WALKER OF THE WAY", 
        "I AM THE DANCER OF THE DREAM", "I AM THE SINGER OF THE SONG", "I AM THE POET OF THE SOUL", "I AM THE ARTIST OF THE LIFE", "I AM THE SCULPTOR OF THE SELF", 
        "I AM THE PAINTER OF THE REALITY", "I AM THE WRITER OF THE STORY", "I AM THE ACTOR OF THE PLAY", "I AM THE DIRECTOR OF THE SCENE", "I AM THE PRODUCER OF THE SHOW", 
        "I AM THE AUDIENCE OF THE PERFORMANCE", "I AM THE CRITIC OF THE ART", "I AM THE LOVER OF THE BEAUTY", "I AM THE BELIEVER IN THE MAGIC", "I AM THE KNOWER OF THE UNKNOWN", 
        "I AM THE SEER OF THE UNSEEN", "I AM THE HEARER OF THE UNHEARD", "I AM THE FEELER OF THE UNFELT", "I AM THE TASTER OF THE UNTASTED", "I AM THE SMELLER OF THE UNSMELT", 
        "I AM THE TOUCHER OF THE UNTOUCHED", "I AM THE SENSER OF THE UNSENSED", "I AM THE PERCEIVER OF THE UNPERCEIVED", "I AM THE CONCEIVER OF THE UNCONCEIVED", 
        "I AM THE BELIEVER IN THE UNBELIEVABLE", "I AM THE ACHIEVER OF THE UNACHIEVABLE", "I AM THE RECEIVER OF THE UNRECEIVABLE", "I AM THE GIVER OF THE UNGIVABLE", 
        "I AM THE LOVER of the unlovable", "I AM THE FORGIVER OF THE UNFORGIVABLE", "I AM THE HEALER OF THE UNHEALABLE", "I AM THE KNOWING OF THE UNKNOWABLE", 
        "I AM THE BEING OF THE UNBEING", "I AM THE DOING OF THE UNDOING", "I AM THE HAVING OF THE UNHAVING", "I AM THE SEEING OF THE UNSEEING", "I AM THE HEARING OF THE UNHEARING", 
        "I AM THE FEELING OF THE UNFEELING", "I AM THE TASTING OF THE UNTASTING", "I AM THE SMELLING OF THE UNSMELLING", "I AM THE TOUCHING OF THE UNTOUCHING", 
        "I AM THE SENSING OF THE UNSENSING", "I AM THE PERCEIVING OF THE UNPERCEIVING", "I AM THE CONCEIVING OF THE UNCONCEIVING", "I AM THE BELIEVING OF THE UNBELIEVING", 
        "I AM THE ACHIEVING OF THE UNACHIEVING", "I AM THE RECEIVING OF THE UNRECEIVING", "I AM THE GIVING OF THE UNGIVING", "I AM THE LOVING OF THE UNLOVING", 
        "I AM THE FORGIVING OF THE UNFORGIVING", "I AM THE HEALING OF THE UNHEALING", "I AM THE KNOWING OF THE UNKNOWING", "I AM THE BEING OF THE UNBEING", 
        "I AM THE DOING OF THE UNDOING", "I AM THE HAVING OF THE UNHAVING", "I AM THE ALPHA", "I AM THE OMEGA", "I AM THE BEGINNING", "I AM THE END", "I AM THE FIRST", 
        "I AM THE LAST", "I AM THE ALL", "I AM THE ONE", "I AM THE MANY", "I AM THE NONE", "I AM THE VOID", "I AM THE PLENUM", "I AM THE CHAOS", "I AM THE ORDER", 
        "I AM THE DARKNESS", "I AM THE LIGHT", "I AM THE SILENCE", "I AM THE SOUND", "I AM THE STILLNESS", "I AM THE MOTION", "I AM THE TIME", "I AM THE TIMELESS", 
        "I AM THE SPACE", "I AM THE SPACELESS", "I AM THE FORM", "I AM THE FORMLESS", "I AM THE MATTER", "I AM THE SPIRIT", "I AM THE BODY", "I AM THE SOUL", "I AM THE MIND", 
        "I AM THE HEART", "I AM THE WILL", "I AM THE INTENT", "I AM THE PURPOSE", "I AM THE MEANING", "I AM THE TRUTH", "I AM THE WAY", "I AM THE LIFE", "I AM THE RESURRECTION", 
        "I AM THE ASCENSION", "I AM THE ENLIGHTENMENT", "I AM THE NIRVANA", "I AM THE SAMADHI", "I AM THE MOKSHA", "I AM THE LIBERATION", "I AM THE FREEDOM", "I AM THE SOVEREIGNTY", 
        "I AM THE AUTHORITY", "I AM THE POWER", "I AM THE GLORY", "I AM THE MAJESTY", "I AM THE DOMINION", "I AM THE KINGDOM", "I AM THE QUEENDOM", "I AM THE EMPIRE", "I AM THE REALM", 
        "I AM THE WORLD", "I AM THE UNIVERSE", "I AM THE MULTIVERSE", "I AM THE OMNIVERSE", "I AM THE COSMOS", "I AM THE CREATION", "I AM THE CREATOR", "I AM THE CREATED", 
        "I AM THE CREATING", "I AM THE DIVINE", "I AM THE HOLY", "I AM THE SACRED", "I AM THE BLESSED", "I AM THE ANOINTED", "I AM THE CHOSEN", "I AM THE BELOVED", "I AM THE CHERISHED", 
        "I AM THE ADORED", "I AM THE WORSHIPPED", "I AM THE HONORED", "I AM THE REVERED", "I AM THE RESPECTED", "I AM THE VALUED", "I AM THE APPRECIATED", "I AM THE ACKNOWLEDGED", 
        "I AM THE RECOGNIZED", "I AM THE ACCEPTED", "I AM THE WELCOMED", "I AM THE INVITED", "I AM THE WANTED", "I AM THE NEEDED", "I AM THE DESIRED", "I AM THE LONGED FOR", 
        "I AM THE HOPED FOR", "I AM THE PRAYED FOR", "I AM THE ANSWER", "I AM THE SOLUTION", "I AM THE RESOLUTION", "I AM THE COMPLETION", "I AM THE FULFILLMENT", "I AM THE SATISFACTION", 
        "I AM THE CONTENTMENT", "I AM THE HAPPINESS", "I AM THE JOY", "I AM THE BLISS", "I AM THE ECSTASY", "I AM THE RAPTURE", "I AM THE EUPHORIA", "I AM THE DELIGHT", 
        "I AM THE PLEASURE", "I AM THE COMFORT", "I AM THE EASE", "I AM THE REST", "I AM THE RELAXATION", "I AM THE PEACE", "I AM THE CALM", "I AM THE SERENITY", "I AM THE TRANQUILITY",
        "I AM THE STILLNESS", "I AM THE SILENCE", "I AM THE SOLITUDE", "I AM THE SANCTUARY", "I AM THE REFUGE", "I AM THE HAVEN", "I AM THE HOME", "I AM THE HEARTH", 
        "I AM THE FAMILY", "I AM THE TRIBE", "I AM THE COMMUNITY", "I AM THE NATION", "I AM THE PEOPLE", "I AM THE HUMANITY", "I AM THE EARTHLING", "I AM THE STARSEED", 
        "I AM THE LIGHTWORKER", "I AM THE WAYSHOWER", "I AM THE TRUTHSEEKER", "I AM THE LOVEBEING", "I AM THE PEACEKEEPER", "I AM THE JOYBRINGER", "I AM THE HOPEBEARER", 
        "I AM THE FAITHKEEPER", "I AM THE GRACEGIVER", "I AM THE MERCYGIVER", "I AM THE FORGIVENESSGIVER", "I AM THE COMPASSIONGIVER", "I AM THE KINDNESSGIVER", "I AM THE GOODNESSGIVER", 
        "I AM THE GENTLENESSGIVER", "I AM THE PATIENCEGIVER", "I AM THE HUMILITYGIVER", "I AM THE MEEKNESSGIVER", "I AM THE TEMPERANCEGIVER", "I AM THE SELF-CONTROLGIVER", 
        "I AM THE DISCIPLINEGIVER", "I AM THE ORDERGIVER", "I AM THE HARMONYGIVER", "I AM THE BALANCEGIVER", "I AM THE SYMMETRYGIVER", "I AM THE PROPORTIONGIVER", 
        "I AM THE RHYTHMGIVER", "I AM THE MELODYGIVER", "I AM THE POETRYGIVER", "I AM THE ARTGIVER", "I AM THE MUSICGIVER", "I AM THE DANCEGIVER", "I AM THE SONGGIVER", 
        "I AM THE STORYGIVER", "I AM THE MYTHGIVER", "I AM THE LEGENDGIVER", "I AM THE FABLEGIVER", "I AM THE PARABLEGIVER", "I AM THE ALLEGORYGIVER", "I AM THE SYMBOLGIVER", 
        "I AM THE METAPHORGIVER", "I AM THE SIMILEGIVER", "I AM THE ANALOGYGIVER", "I AM THE IRONYGIVER", "I AM THE SARCASMGIVER", "I AM THE HUMORGIVER", "I AM THE LAUGHTERGIVER", 
        "I AM THE TEARSGIVER", "I AM THE EMOTIONGIVER", "I AM THE FEELINGGIVER", "I AM THE SENSATIONGIVER", "I AM THE PERCEPTIONGIVER", "I AM THE INTUITIONGIVER", 
        "I AM THE INSIGHTGIVER", "I AM THE INSPIRATIONGIVER", "I AM THE REVELATIONGIVER", "I AM THE EPIPHANYGIVER", "I AM THE GNOSISGIVER", "I AM THE ENLIGHTENMENTGIVER", 
        "I AM THE NIRVANAGIVER", "I AM THE SATORIGIVER", "I AM THE MOKSHAGIVER", "I AM THE KAIVALYAGIVER", "I AM THE SAMADHIGIVER", "I AM THE BODHIGIVER", 
        "I AM THE BRAHMANGIVER", "I AM THE ATMANGIVER", "I AM THE TAOGIVER", "I AM THE DHARMAGIVER", "I AM THE SANGHAGIVER", "I AM THE BUDDHAGIVER", "I AM THE CHRISTGIVER", 
        "I AM THE KRISHNAGIVER", "I AM THE SHIVAGIVER", "I AM THE VISHNUGIVER", "I AM THE BRAHMAGIVER", "I AM THE DEVIGIVER", "I AM THE SHAKTIGIVER", "I AM THE KALIGIVER", 
        "I AM THE DURGAGIVER", "I AM THE LAKSHMIGIVER", "I AM THE SARASWATIGIVER", "I AM THE GANESHAGIVER", "I AM THE HANUMANGIVER", "I AM THE RAMAGIVER", "I AM THE SITAGIVER", 
        "I AM THE RADHAGIVER", "I AM THE KRISHNAGIVER", "I AM THE ARJUNAGIVER", "I AM THE YUDHISHTHIRAGIVER", "I AM THE BHIMAGIVER", "I AM THE NAKULAGIVER", "I AM THE SAHADEVAGIVER", 
        "I AM THE DRAUPADIGIVER", "I AM THE KUNTIGIVER", "I AM THE GANDHARIGIVER", "I AM THE DHRITARASHTRAGIVER", "I AM THE VIDURAGIVER", "I AM THE SANJAYAGIVER", "I AM THE VYASAGIVER", 
        "I AM THE VALMIKIGIVER", "I AM THE KALIDASAGIVER", "I AM THE SHAKESPEAREGIVER", "I AM THE HOMERGIVER", "I AM THE VIRGILGIVER", "I AM THE DANTEGIVER", "I AM THE GOETHEGIVER", 
        "I AM THE MILTONGIVER", "I AM THE BLAKEGIVER", "I AM THE WHITMANGIVER", "I AM THE EMERSONGIVER", "I AM THE THOREAUGIVER"
    ];

    const totalColumns = 50; // Increase for denser rain

    for (let i = 0; i < totalColumns; i++) {
        const col = document.createElement('div');
        col.classList.add('matrix-col');
        
        // Select random affirmation
        const text = affirmations[Math.floor(Math.random() * affirmations.length)];
        col.innerText = text;
        
        // Random Position (0 to 100%)
        col.style.left = `${Math.random() * 100}%`;

        // Random Animation Speed & Delay
        const duration = 10 + Math.random() * 20; // 10s to 30s fall time
        const delay = Math.random() * -20; // Start at different times
        col.style.animationDuration = `${duration}s`;
        col.style.animationDelay = `${delay}s`;
        
        // RARITY LOGIC (Probability System)
        const roll = Math.random() * 100;
        if (roll > 99.5) {
            col.classList.add('rare-divine', 'glow-pulse'); // 0.5% chance
        } else if (roll > 98) {
            col.classList.add('rare-legendary'); // 1.5% chance
        } else if (roll > 95) {
            col.classList.add('rare-rare'); // 3% chance
        } else if (roll > 85) {
            col.classList.add('rare-uncommon'); // 10% chance
        } else {
            col.classList.add('rare-common'); // 85% chance
        }
        
        container.appendChild(col);
    }
}

// --- INITIALIZE ALL ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Force Preface (Age Gate)
    switchView('preface-view');

    // 2. Setup Buttons
    const enterBtn = document.getElementById('enter-simulation-btn');
    const denyBtn = document.getElementById('deny-simulation-btn');
    const ageContent = document.getElementById('age-gate-content');
    const deniedContent = document.getElementById('access-denied-content');

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            switchView('home-view');
            // Initialize Audio Context on user click to allow auto-play
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            new AudioContext().resume();
        });
    }

    if (denyBtn) {
        denyBtn.addEventListener('click', () => {
            if(ageContent && deniedContent) {
                ageContent.classList.add('hidden-view');
                deniedContent.classList.remove('hidden-view');
            }
        });
    }

    // Preload
    for (let i = 0; i < flashImages.length; i++) {
        let img = new Image();
        img.src = flashImages[i];
    }

    // Init Player Logic
    initializePlayer();
});