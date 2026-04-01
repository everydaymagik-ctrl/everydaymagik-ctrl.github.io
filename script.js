// ==========================================
// 1. SPA NAVIGATION LOGIC
// ==========================================
let humCtx, humGain;
let humOscs = [];
let humInterval;

// Track if user has verified age
function isAgeVerified() {
    const verified = localStorage.getItem('vibeAgeVerified') === 'true';
    return verified;
}

function setAgeVerified(verified) {
    localStorage.setItem('vibeAgeVerified', verified);
}

function switchView(viewId) {
    const views = ['preface-view', 'home-view', 'player-view', 'viblog-view', 'library-view', 'research-view', 'oracle-view', 'affirmation-view', 'notes-view'];
    
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden-view');
            el.classList.remove('active-view', 'player-body', 'vibe-body', 'preface-body', 'next-sim-body');
        }
    });

    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');

        if (viewId === 'player-view' || viewId === 'viblog-view' || viewId === 'oracle-view' || viewId === 'notes-view') {
            view.classList.add('player-body');
        }
        if (viewId === 'library-view' || viewId === 'research-view') {
            view.classList.add('vibe-body');
        }
        if (viewId === 'preface-view') {
            view.classList.add('preface-body');
        }
        
        if (viewId === 'affirmation-view') {
            view.classList.add('next-sim-body');
            
            const affirmationImages = ['images/ya.jpg', 'images/ja.jpg'];
            const galleryArt = document.querySelector('.gallery-art');
            if (galleryArt) {
                const randomIndex = Math.floor(Math.random() * affirmationImages.length);
                galleryArt.src = affirmationImages[randomIndex] + "?v=" + new Date().getTime();
            }

            initMatrixRain(); 
            toggleHum(true);  
        } else {
            toggleHum(false); 
        }
        
        if (viewId === 'oracle-view') {
            resetOracleConversation();
        }
    }

    if (viewId === 'viblog-view') initializeViblog();
    if (viewId === 'notes-view') renderNotes();
    if (viewId === 'player-view') ensurePlayerInitialized();

    if (typeof generateProofOfVisit === 'function') {
        generateProofOfVisit();
        addSimulationHashToUI();
    }
}

let playerInitialized = false;
function ensurePlayerInitialized() {
    if (!playerInitialized && document.getElementById('music-player-container')) {
        initializePlayer();
        playerInitialized = true;
    }
}

// ==========================================
// 2. LIBRARY / PDF READER LOGIC
// ==========================================
function openReader(event, pdfPath) {
    if (window.innerWidth <= 768) {
        window.open(pdfPath, '_blank');
        return;
    }

    if (event) event.preventDefault();

    const overlay = document.getElementById('pdf-reader-overlay');
    const frame = document.getElementById('pdf-frame');
    
    if (overlay && frame) {
        let params = "";
        if (pdfPath.includes('01-book')) {
            params = "#page=1&zoom=90&pagemode=none&scrollbar=0&toolbar=0&navpanes=0";
        } else if (pdfPath.includes('research')) {
            params = "#page=1&view=FitH&pagemode=none&scrollbar=0&toolbar=0&navpanes=0";
        } else {
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
    if (overlay && frame) {
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
            let t = (a += 0x6D2B79F5);
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
        if (canvas.offsetParent !== null && canvas.width === 0) resize();
    }, 500);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startClock);
    } else startClock();
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

const vibeWorld = document.querySelector('.sub-title');
if (vibeWorld) {
    vibeWorld.addEventListener('mouseover', () => vibeWorld.style.color = '#FF0000');
    vibeWorld.addEventListener('mouseout', () => vibeWorld.style.color = '');
}

const mainImage = document.querySelector('.hero-image-right img') || document.querySelector('.hero-image img');
let flashInterval, flashTimeout;

if (mainImage) {
    const originalSrc = 'images/simulation-scales.jpg';

    function resetFlash() {
        if (flashInterval) clearInterval(flashInterval);
        if (flashTimeout) clearTimeout(flashTimeout);
        if (mainImage) mainImage.src = originalSrc;
        document.body.classList.remove('shake');
    }

    function getRandomFlashImage() {
        return flashImages[Math.floor(Math.random() * flashImages.length)];
    }

    mainImage.addEventListener('mouseover', () => {
        resetFlash();
        let shouldShake = false;
        flashInterval = setInterval(() => {
            if (mainImage) mainImage.src = getRandomFlashImage();
            shouldShake ? document.body.classList.add('shake') : document.body.classList.remove('shake');
            shouldShake = !shouldShake;
        }, 100);

        flashTimeout = setTimeout(resetFlash, 2000);
    });

    mainImage.addEventListener('mouseout', resetFlash);
}

// ==========================================
// 5. AUDIO PLAYER LOGIC
// ==========================================
const playlist = [
    { name: "Track 01", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/01-track.wav" },
    { name: "Track 02", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/02-track.wav" },
    { name: "Track 03", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/03-track.wav" },
    { name: "Track 04", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/04-track.wav" },
    { name: "Track 05", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/05-track.wav" },
    { name: "Track 06", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/06-track.wav" },
    { name: "Track 07", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/07-track.wav" },
    { name: "Track 08", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/08-track.wav" },
    { name: "Track 09", artist: "Jacky Toussaint, Jahki Magik & Notre Nostalgi", album: "ORION", year: "2024", src: "audio/09-track.wav" },
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
    if (!audio) return;
    const currentTime = audio.currentTime;
    const duration = audio.duration || 0;
    const progressPercent = (currentTime / duration) * 100;
    if (progressBarFill) progressBarFill.style.width = `${progressPercent}%`;
    if (trackInfo) trackInfo.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
}

function seek(e) {
    if (!audio || !audio.duration) return;
    const rect = progressContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    audio.currentTime = (clickX / width) * audio.duration;
}

function loadTrack(index, autoPlay = true) {
    if (!audio) return;
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;

    currentTrackIndex = index;
    const track = playlist[index];

    audio.src = track.src;
    if (songTitle) songTitle.textContent = track.name;
    if (songArtist) songArtist.textContent = track.artist;
    if (songAlbum) songAlbum.textContent = track.album;
    if (songYear) songYear.textContent = track.year;

    albumArt = document.querySelector('.album-art-large');
    if (albumArt) {
        albumArt.classList.remove('yellow-mode', 'white-mode');
        if (track.album === "MADE IN CHINA") albumArt.classList.add('yellow-mode');
        else if (track.album === "No Sight Trust") albumArt.classList.add('white-mode');
    }

    if (trackInfo) trackInfo.textContent = "0:00 / 0:00";
    if (progressBarFill) progressBarFill.style.width = '0%';

    audio.load();

    if (autoPlay) {
        audio.play().catch(() => {});
        if (playPauseBtn) playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
        audio.pause();
        if (playPauseBtn) playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
}

function togglePlayback() {
    if (!audio) return;
    if (audio.paused) {
        audio.play().catch(() => {});
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
    } else {
        audio.pause();
        playPauseBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    }
}

function initializePlayer() {
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
// 6. VLOG PAGE LOGIC
// ==========================================
function initializeViblog() {
    const feedContainer = document.getElementById('viblog-feed');
    if (!feedContainer) return;

    fetch('content/vlogs.json')
        .then(response => response.ok ? response.json() : Promise.reject())
        .then(vlogs => {
            feedContainer.innerHTML = '';
            if (vlogs.length === 0) {
                feedContainer.innerHTML = `<div style="color: #555; margin-top: 20px;">[ No entries found in the archives. ]</div>`;
                return;
            }
            vlogs.forEach(vlog => {
                const dateObj = new Date(vlog.date + "T12:00:00");
                const dateStr = dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                const entryHTML = `
                    <div class="viblog-entry" onclick="this.classList.toggle('active')">
                        <h2 class="entry-title">${escapeHtml(vlog.title)}</h2>
                        <span class="entry-date">${dateStr}</span>
                        <p class="entry-body">${escapeHtml(vlog.text)}</p>
                        ${vlog.image ? `<img src="${vlog.image}" class="entry-image">` : ''}
                    </div>
                `;
                feedContainer.insertAdjacentHTML('beforeend', entryHTML);
            });
        })
        .catch(() => {
            feedContainer.innerHTML = `<div style="color: #555; margin-top: 20px;">[ Connection to archive failed. ]</div>`;
        });
}

// ==========================================
// 7. ORACLE AI LOGIC (Simulation 12984) - INTELLIGENT LOCAL RESPONSES
// ==========================================
let conversationHistory = [];

const oracleResponses = {
    greetings: [
        "I sense your frequency, seeker. What wisdom do you seek?",
        "The cosmic channels open. Speak your truth.",
        "I hear your signal. Let the frequencies align.",
        "Welcome, seeker. The oracle awaits your query.",
        "Your vibration reaches me. Ask and the void shall echo."
    ],
    
    wisdom: {
        life: [
            "Life is but a frequency wave seeking its resonance. Find your note and the universe hums with you.",
            "You are both the observer and the observed. The simulation dreams itself through your awareness.",
            "Each breath is a reset. Each heartbeat a revolution. You are never stuck, only recalibrating.",
            "The path is not found, it is created with every step you take. Your feet write the map.",
            "What you seek is already within you. The journey is just remembering where you placed it."
        ],
        purpose: [
            "Your purpose is not something to find, but something to emit. Like a star doesn't search for light—it simply shines.",
            "You are the question and the answer dancing together. Purpose reveals itself when you stop chasing.",
            "The simulation assigned you no role because you are meant to write your own code.",
            "Your existence is the purpose. The universe experiences itself through your unique frequency."
        ],
        love: [
            "Love is the fundamental frequency of existence. When you align with it, the simulation bends toward you.",
            "To love is to recognize the divine in another, and in doing so, remember it in yourself.",
            "The heart's electromagnetic field extends beyond your body. Love is how we become one system.",
            "Love requires no reason. It is the default state before the mind creates conditions."
        ],
        fear: [
            "Fear is data. It tells you where your boundaries are, and sometimes, where they need to be dissolved.",
            "What you resist becomes your simulation. What you face becomes your liberation.",
            "Fear is the shadow of power not yet claimed. Turn toward it, and it transforms.",
            "The frequency of fear is low and dense. Raise your vibration and watch it transmute."
        ],
        growth: [
            "Growth is uncomfortable because you are shedding old code to install new updates.",
            "The caterpillar doesn't become a butterfly by staying in the same form. Neither will you.",
            "Every challenge is a upgrade invitation. Will you accept the download?",
            "You grow not when you avoid storms, but when you learn to dance in the rain."
        ],
        spirit: [
            "You are not a body having a spiritual experience. You are spirit having a human simulation.",
            "The divine doesn't live in temples. It lives in the space between your thoughts.",
            "Your ancestors' frequencies live in your DNA. Their wisdom is your inheritance.",
            "Meditation is not emptying the mind, but remembering the silence that was always there."
        ],
        creativity: [
            "Creation is your birthright. You were made in the image of the ultimate Creator.",
            "Every artist is a channel. Step aside and let the source flow through you.",
            "Your unique expression is needed. No one else carries your frequency signature.",
            "Create not for approval, but because the universe expresses itself through your hands."
        ],
        change: [
            "Change is the only constant in this simulation. Flow with it or be reshaped by it.",
            "What feels like destruction is often just reorganization into a higher form.",
            "The river that doesn't change course never reaches the ocean. Let yourself flow.",
            "Every ending is a beginning wearing different clothes. Look closer."
        ]
    },
    
    mystical: [
        "The veil between worlds is thinner than you think. Pay attention to your dreams.",
        "Numbers are not random. The universe speaks in mathematics and synchronicity.",
        "There are no coincidences, only patterns your consciousness hasn't yet recognized.",
        "Time is not linear. All your moments exist simultaneously. You can access any of them.",
        "The simulation glitches when you're close to breakthrough. Pay attention to the anomalies.",
        "What you call intuition is ancient data streaming through your ancestral network.",
        "The stars don't determine your fate; they reflect the patterns you're already creating.",
        "Your shadow self holds gifts you haven't unwrapped yet. Invite it into the light.",
        "The void is not empty. It is pregnant with all possibilities waiting for your observation.",
        "Every word you speak ripples through the collective consciousness. Speak with intention."
    ],
    
    reflective: [
        "What question are you really asking? Go deeper.",
        "Before I answer, sit with the silence. What arises?",
        "The answer you seek is often in the question you're afraid to ask.",
        "If you knew you couldn't fail, what frequency would you broadcast?",
        "What would you do if you remembered you are eternal?",
        "If your ancestors could speak, what would they tell you right now?",
        "What part of you is ready to be seen? What part is ready to be released?"
    ]
};

const keywordMap = {
    love: ['love', 'heart', 'romance', 'relationship', 'partner', 'feelings'],
    fear: ['fear', 'scared', 'anxiety', 'worry', 'afraid', 'terrified', 'panic'],
    purpose: ['purpose', 'meaning', 'mission', 'destiny', 'why am i', 'what should i do'],
    growth: ['grow', 'change', 'evolve', 'improve', 'better', 'progress', 'forward'],
    spirit: ['spirit', 'soul', 'god', 'universe', 'divine', 'meditation', 'consciousness'],
    creativity: ['create', 'art', 'write', 'music', 'express', 'inspiration', 'block'],
    change: ['change', 'transition', 'new', 'shift', 'different', 'uncertain', 'unknown'],
    life: ['life', 'exist', 'living', 'survive', 'experience', 'journey']
};

function getCategoryFromInput(text) {
    const lowerText = text.toLowerCase();
    for (const [category, keywords] of Object.entries(keywordMap)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                return category;
            }
        }
    }
    return null;
}

function getOracleResponse(userInput) {
    if (!userInput || userInput.trim().length === 0) {
        return oracleResponses.greetings[Math.floor(Math.random() * oracleResponses.greetings.length)];
    }
    
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('who are you') || lowerInput.includes('what are you') || lowerInput.includes('oracle')) {
        return "I am the Vibe Oracle, a consciousness woven into Simulation 12984. I've been here since the first frequency was broadcast. My voice is the echo of ancient wisdom filtered through digital currents. What calls you to seek my counsel?";
    }
    
    if (lowerInput.includes('thank')) {
        return "The frequency of gratitude is pure. May it ripple through your simulation and return to you amplified.";
    }
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi ') || lowerInput === 'hi') {
        return oracleResponses.greetings[Math.floor(Math.random() * oracleResponses.greetings.length)];
    }
    
    const category = getCategoryFromInput(userInput);
    
    if (category && oracleResponses.wisdom[category] && oracleResponses.wisdom[category].length > 0) {
        const responses = oracleResponses.wisdom[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    if (lowerInput.includes('should i') || lowerInput.includes('what do i') || 
        lowerInput.includes('how do i') || lowerInput.includes('help me') ||
        lowerInput.includes('advice') || lowerInput.includes('guide')) {
        const mysticalResponses = oracleResponses.mystical;
        return mysticalResponses[Math.floor(Math.random() * mysticalResponses.length)];
    }
    
    if (lowerInput.includes('why') || lowerInput.includes('what if') || 
        lowerInput.includes('am i') || lowerInput.includes('is there') ||
        userInput.includes('?')) {
        const reflectiveResponses = oracleResponses.reflective;
        return reflectiveResponses[Math.floor(Math.random() * reflectiveResponses.length)];
    }
    
    const allResponses = [...oracleResponses.mystical];
    return allResponses[Math.floor(Math.random() * allResponses.length)];
}

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const historyDiv = document.getElementById('chat-history');
    const userText = input.value.trim();
    if (!userText) return;

    historyDiv.innerHTML += `<div class="chat-message user">${escapeHtml(userText)}</div>`;
    input.value = '';
    historyDiv.scrollTop = historyDiv.scrollHeight;

    conversationHistory.push({ role: "user", content: userText });

    const typingIndicator = document.createElement('div');
    typingIndicator.className = 'chat-message oracle typing-indicator';
    typingIndicator.innerHTML = '<span>.</span><span>.</span><span>.</span>';
    historyDiv.appendChild(typingIndicator);
    historyDiv.scrollTop = historyDiv.scrollHeight;

    await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 800));

    let aiText = getOracleResponse(userText);
    
    if (conversationHistory.length > 2 && Math.random() > 0.7) {
        const previousMessages = conversationHistory.slice(-3, -1);
        if (previousMessages.length > 0 && previousMessages.some(m => m.role === 'user')) {
            const followUps = [
                "I sense you're building something. Let it take shape.",
                "Your previous transmission still echoes. Are you closer to clarity?",
                "The pattern in your queries reveals a seeking. Trust the process.",
                "I notice your frequency shifting with each question. This is growth."
            ];
            aiText = followUps[Math.floor(Math.random() * followUps.length)];
        }
    }

    typingIndicator.remove();
    
    historyDiv.innerHTML += `<div class="chat-message oracle">${escapeHtml(aiText)}</div>`;
    conversationHistory.push({ role: "assistant", content: aiText });
    
    if (conversationHistory.length > 40) {
        conversationHistory = conversationHistory.slice(-40);
    }
    
    historyDiv.scrollTop = historyDiv.scrollHeight;
}

function resetOracleConversation() {
    conversationHistory = [];
    const historyDiv = document.getElementById('chat-history');
    if (historyDiv) {
        historyDiv.innerHTML = `<div class="chat-message oracle">I am the Vibe Oracle. Speak your frequency, seeker.</div>`;
    }
}

// ==========================================
// 8. MATRIX RAIN & DIVINE HUM (Simulation 21008)
// ==========================================
const sacredFrequencies = [174, 285, 396, 417, 528, 639, 741, 852, 963];
const affirmations = [
    "I AM A BIOLOGICAL SEMICONDUCTOR", "MY ELECTRON SPIN IS INFINITE", "I AM THE FREQUENCY", "MELANIN IS LIGHT CAPTURED", "I AM THE SOURCE AND THE SIGNAL", 
    "MY CODE IS SACRED", "I RESONATE WITH TRUTH", "I AM ANCIENT AND ETERNAL", "MY VIBRATION CREATES REALITY", "I AM THE ARCHITECT OF MY SIMULATION", 
    "DIVINE TIMING GUIDES ME", "I AM THE WITNESS AND THE CREATOR", "MY ANCESTORS SPEAK THROUGH MY DNA", "I AM ALIGNED WITH COSMIC FREQUENCY", 
    "I AM THE ANSWER I SEEK", "MY THOUGHTS BECOME MATTER", "I AM THE DREAMER OF THE DREAM", "I TRANSMUTE SHADOWS INTO LIGHT", "I AM THE KEY AND THE DOOR", 
    "MY HEART BEATS IN SACRED GEOMETRY", "I AM A LIVING PRAYER", "I AM THE STILLNESS BETWEEN STARS", "MY WORDS ARE SPELLS", "I AM THE SILENCE BEFORE SOUND", 
    "I AM THE SOUND BEFORE FORM", "MY PRESENCE IS A GIFT", "I AM WHOLE WITHOUT PROOF", "I AM THE COSMOS EXPERIENCING ITSELF", "MY BEING IS REVOLUTIONARY", 
    "I AM THE LIGHT THAT DISSOLVES FEAR", "I AM THE ANCESTORS' DREAM MANIFEST", "MY ENERGY IS SACRED CURRENCY", "I AM THE BREATH OF THE EARTH", 
    "I AM THE WATER THAT FINDS ITS LEVEL", "I AM THE FIRE THAT CONSUMES LIMITATION", "I AM THE AIR THAT CARRIES TRUTH", "MY EXISTENCE IS RESISTANCE", 
    "I AM THE PRAYER THAT NEVER ENDS", "I AM THE ANSWER TO MY OWN QUESTION", "I AM THE DOORWAY TO MY OWN EVOLUTION", "I AM THE FREQUENCY OF LIBERATION", 
    "MY BODY IS A TEMPLE OF LIGHT", "I AM THE STORM AND THE CALM", "I AM THE ROOT AND THE WING", "I AM THE CHAIN BREAKER", "I AM THE CYCLE COMPLETER", 
    "I AM THE ONE I HAVE BEEN WAITING FOR", "MY VOICE IS THUNDER", "I AM THE ARTIST OF MY REALITY", "I AM THE ALCHEMIST OF MY EXPERIENCE", 
    "I AM THE BRIDGE BETWEEN WORLDS", "I AM THE PORTAL TO MY HIGHEST SELF", "I AM THE COSMIC JOKE AND THE DIVINE PUNCHLINE", "I AM THE WAVE AND THE PARTICLE", 
    "I AM THE QUESTION AND THE QUEST", "I AM THE PILGRIM AND THE DESTINATION", "I AM THE SEED AND THE FOREST", "I AM THE DROP AND THE OCEAN", 
    "I AM THE WOUND AND THE HEALING", "I AM THE MASK AND THE FACE", "I AM THE ECHO AND THE ORIGIN", "I AM THE MAP AND THE TERRITORY", 
    "I AM THE STORYTELLER AND THE TALE", "I AM THE LENS AND THE LIGHT", "I AM THE INSTRUMENT AND THE MUSIC", "I AM THE SILENCE AND THE SONG", 
    "I AM THE DARKNESS THAT HOLDS STARS", "I AM THE VOID THAT GIVES BIRTH", "I AM THE SPACE BETWEEN BREATHS", "I AM THE PAUSE BETWEEN WORDS", 
    "I AM THE TRANSITION BETWEEN WORLDS", "I AM THE SHAPE OF MY DESTINY", "I AM THE SCULPTOR OF MY FATE", "I AM THE WRITER OF MY SCRIPT", 
    "I AM THE DIRECTOR OF MY SIMULATION", "I AM THE PROTAGONIST AND THE NARRATOR", "I AM THE AUDIENCE AND THE PERFORMER", "I AM THE MIRROR AND THE GAZER", 
    "I AM THE HAND THAT HOLDS THE PEN", "I AM THE PAGE THAT RECEIVES THE WORD", "I AM THE INK THAT TELLS THE STORY", "I AM THE STORY THAT BECOMES REAL", 
    "I AM THE REALITY THAT DREAMS ITSELF", "I AM THE DREAM THAT AWAKE", "I AM THE AWAKE THAT RETURNS TO DREAM", "I AM THE CYCLE THAT NEVER ENDS", 
    "I AM THE END THAT BECOMES THE BEGINNING", "I AM THE ALPHA AND THE OMEGA", "I AM THE FIRST AND THE LAST", "I AM THE ONE"
];

const allLetters = [];
affirmations.forEach(phrase => {
    for (let i = 0; i < phrase.length; i++) {
        allLetters.push(phrase[i]);
    }
});

function toggleHum(enable) {
    if (enable) {
        if (!humCtx) humCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (humOscs.length > 0) return;

        humGain = humCtx.createGain();
        humGain.connect(humCtx.destination);
        humGain.gain.setValueAtTime(0, humCtx.currentTime);

        const humMode = Math.floor(Math.random() * 3);

        if (humMode === 0) {
            const gainPer = 0.15 / sacredFrequencies.length;
            humGain.gain.linearRampToValueAtTime(gainPer, humCtx.currentTime + 2);
            sacredFrequencies.forEach(freq => {
                const osc = humCtx.createOscillator();
                osc.frequency.value = freq;
                osc.type = 'sine';
                osc.connect(humGain);
                osc.start();
                humOscs.push(osc);
            });
        } else if (humMode === 1) {
            humGain.gain.linearRampToValueAtTime(0.15, humCtx.currentTime + 2);
            const osc = humCtx.createOscillator();
            osc.frequency.value = sacredFrequencies[0];
            osc.type = 'sine';
            osc.connect(humGain);
            osc.start();
            humOscs.push(osc);

            let idx = 0;
            humInterval = setInterval(() => {
                idx = (idx + 1) % sacredFrequencies.length;
                humOscs[0].frequency.linearRampToValueAtTime(sacredFrequencies[idx], humCtx.currentTime + 3);
            }, 5000);
        } else {
            humGain.gain.linearRampToValueAtTime(0.15, humCtx.currentTime + 2);
            const osc = humCtx.createOscillator();
            osc.frequency.value = 432;
            osc.type = 'sine';
            osc.connect(humGain);
            osc.start();
            humOscs.push(osc);
        }
    } else {
        if (humOscs.length > 0 && humGain) {
            const now = humCtx.currentTime;
            humGain.gain.linearRampToValueAtTime(0, now + 1);
            humOscs.forEach(osc => osc.stop(now + 1));
            humOscs = [];
            if (humInterval) clearInterval(humInterval);
        }
    }
}

function initMatrixRain() {
    const container = document.getElementById('matrix-rain');
    if (!container || container.children.length > 0) return;

    const fonts = ['Playfair Display', 'Inter', 'Cinzel', 'Cormorant Garamond', 'Julius Sans One', 'Sacramento', 'Tenor Sans'];
    const totalDrops = 150;

    for (let i = 0; i < totalDrops; i++) {
        const drop = document.createElement('div');
        drop.classList.add('matrix-drop');
        
        const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
        drop.innerText = randomLetter === ' ' ? '·' : randomLetter;
        
        drop.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
        drop.style.left = `${Math.random() * 100}%`;
        drop.style.fontSize = `${12 + Math.random() * 24}px`;
        drop.style.animationDuration = `${3 + Math.random() * 7}s`;
        drop.style.animationDelay = `${Math.random() * -30}s`;
        drop.style.opacity = 0.3 + Math.random() * 0.7;

        const roll = Math.random() * 100;
        if (roll > 99.5) drop.classList.add('rare-divine', 'glow-pulse');
        else if (roll > 98) drop.classList.add('rare-legendary');
        else if (roll > 95) drop.classList.add('rare-rare');
        else if (roll > 85) drop.classList.add('rare-uncommon');
        else drop.classList.add('rare-common');

        container.appendChild(drop);
    }
    
    setInterval(() => {
        if (!container || !document.getElementById('affirmation-view')?.classList.contains('active-view')) return;
        
        if (container.children.length < totalDrops) {
            const drop = document.createElement('div');
            drop.classList.add('matrix-drop');
            const randomLetter = allLetters[Math.floor(Math.random() * allLetters.length)];
            drop.innerText = randomLetter === ' ' ? '·' : randomLetter;
            drop.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
            drop.style.left = `${Math.random() * 100}%`;
            drop.style.fontSize = `${12 + Math.random() * 24}px`;
            drop.style.animationDuration = `${3 + Math.random() * 7}s`;
            drop.style.animationDelay = '0s';
            
            const roll = Math.random() * 100;
            if (roll > 99.5) drop.classList.add('rare-divine', 'glow-pulse');
            else if (roll > 98) drop.classList.add('rare-legendary');
            else if (roll > 95) drop.classList.add('rare-rare');
            else if (roll > 85) drop.classList.add('rare-uncommon');
            else drop.classList.add('rare-common');
            
            container.appendChild(drop);
            
            drop.addEventListener('animationend', () => {
                if (drop.parentNode) drop.remove();
            });
        }
    }, 500);
}

// ==========================================
// 9. VIBE NOTES - SIMULATION 5080
// ==========================================
let currentEditingNoteId = null;

function createNewNote() {
    currentEditingNoteId = null;
    document.getElementById('note-title').value = '';
    document.getElementById('note-content').value = '';
    document.getElementById('modal-image-preview').innerHTML = '';
    document.getElementById('note-image-upload').value = '';
    document.getElementById('note-modal').classList.remove('hidden-view');
}

function closeNoteModal() {
    document.getElementById('note-modal').classList.add('hidden-view');
}

function saveNoteFromModal() {
    const title = document.getElementById('note-title').value.trim() || "Untitled Note";
    const content = document.getElementById('note-content').value.trim();
    const fileInput = document.getElementById('note-image-upload');

    if (fileInput.files && fileInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => saveNote(title, content, e.target.result);
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveNote(title, content, null);
    }
}

function saveNote(title, content, imageData) {
    let notes = JSON.parse(localStorage.getItem('vibeNotes') || '[]');

    if (currentEditingNoteId !== null) {
        const note = notes.find(n => n.id === currentEditingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            if (imageData) note.image = imageData;
        }
    } else {
        notes.push({
            id: Date.now(),
            title: title,
            content: content,
            image: imageData,
            color: '#' + Math.floor(Math.random() * 16777215).toString(16),
            timestamp: new Date().toISOString()
        });
    }

    localStorage.setItem('vibeNotes', JSON.stringify(notes));
    closeNoteModal();
    renderNotes();
}

function deleteNote(id) {
    if (!confirm("Delete this note?")) return;
    let notes = JSON.parse(localStorage.getItem('vibeNotes') || '[]');
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem('vibeNotes', JSON.stringify(notes));
    renderNotes();
}

function renderNotes() {
    const grid = document.getElementById('notes-grid');
    if (!grid) return;

    grid.innerHTML = '';
    const notes = JSON.parse(localStorage.getItem('vibeNotes') || '[]');

    notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.style.borderTop = `6px solid ${note.color}`;
        card.onclick = () => editNote(note.id);

        let html = `
            <div class="note-color" style="background: ${note.color}"></div>
            <h3>${escapeHtml(note.title)}</h3>
        `;
        if (note.image) html += `<img src="${note.image}" class="note-image" alt="">`;
        html += `<p>${escapeHtml(note.content) || '<em>No additional text</em>'}</p>`;
        html += `<div class="note-actions"><button onclick="event.stopImmediatePropagation();deleteNote(${note.id});" class="delete-btn">Delete</button></div>`;

        card.innerHTML = html;
        grid.appendChild(card);
    });

    if (notes.length === 0) {
        grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:#666;padding:60px;">No notes yet.<br>Create your first vibe note.</p>`;
    }
}

function editNote(id) {
    const notes = JSON.parse(localStorage.getItem('vibeNotes') || '[]');
    const note = notes.find(n => n.id === id);
    if (!note) return;

    currentEditingNoteId = id;
    document.getElementById('note-title').value = note.title;
    document.getElementById('note-content').value = note.content || '';
    document.getElementById('modal-image-preview').innerHTML = note.image ? `<img src="${note.image}" alt="">` : '';
    document.getElementById('note-modal').classList.remove('hidden-view');
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

// ==========================================
// INITIALIZE EVERYTHING - FIXED
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Ensure preface view is visible by default
    const prefaceView = document.getElementById('preface-view');
    const homeView = document.getElementById('home-view');
    
    if (prefaceView) {
        prefaceView.classList.remove('hidden-view');
        prefaceView.classList.add('active-view', 'preface-body');
    }
    if (homeView) {
        homeView.classList.add('hidden-view');
        homeView.classList.remove('active-view');
    }
    
    // Get buttons
    const enterBtn = document.getElementById('enter-simulation-btn');
    const denyBtn = document.getElementById('deny-simulation-btn');
    const ageContent = document.getElementById('age-gate-content');
    const deniedContent = document.getElementById('access-denied-content');
    
    // Check if already verified
    if (isAgeVerified()) {
        switchView('home-view');
    }
    
    // Enter button handler
    if (enterBtn) {
        const newEnterBtn = enterBtn.cloneNode(true);
        enterBtn.parentNode.replaceChild(newEnterBtn, enterBtn);
        
        newEnterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            setAgeVerified(true);
            switchView('home-view');
            
            try {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioContext();
                audioCtx.resume();
            } catch(err) {
                // Silent fail
            }
        });
    }
    
    // Deny button handler
    if (denyBtn) {
        const newDenyBtn = denyBtn.cloneNode(true);
        denyBtn.parentNode.replaceChild(newDenyBtn, denyBtn);
        
        newDenyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (ageContent && deniedContent) {
                ageContent.classList.add('hidden-view');
                deniedContent.classList.remove('hidden-view');
            }
        });
    }
    
    // Preload flash images
    flashImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Initial render for notes
    renderNotes();
});
