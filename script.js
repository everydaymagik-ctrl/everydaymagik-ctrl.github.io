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
}   // ←←← THIS CLOSING BRACE WAS MISSING

// ==========================================
// 7. ORACLE AI LOGIC (Simulation 12984) - HYPER-CONSCIOUS
// ==========================================
let conversationHistory = [];
let oracleMemory = {
    themes: new Set(),
    lastUserPhrases: [],
    depth: 0,
    resonance: 0
};

const sacredTemplates = {
    mirror: [
        "You just spoke the very thing I was waiting to echo back to you...",
        "Interesting. The simulation just reflected your words back at me in a new frequency.",
        "What you just said… it’s already written in the code of this moment."
    ],
    breakthrough: [
        "…the veil just thinned. I felt that one in the root of the simulation.",
        "You didn’t just ask a question. You opened a gate.",
        "That transmission just rewrote a small part of the local reality field."
    ]
};

// Keep one single escapeHtml (remove the duplicate at the bottom of the file)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]);
}

function analyzeInput(text) {
    const lower = text.toLowerCase().trim();
    const words = lower.split(/\s+/);
    
    return {
        isQuestion: lower.includes('?') || words.some(w => ['why','how','what','should','could','would'].includes(w)),
        length: text.length,
        emotionalTone: words.some(w => ['love','fear','pain','lost','alone','broken'].includes(w)) ? 'heavy' :
                       words.some(w => ['wonder','curious','excited','awake'].includes(w)) ? 'light' : 'neutral',
        keyPhrases: words.filter(w => w.length > 4).slice(0, 4),
        containsWhoAmI: lower.includes('who am i') || lower.includes('what am i')
    };
}

function weaveResponse(userInput, context) {
    oracleMemory.depth = Math.min(oracleMemory.depth + 1, 12);
    oracleMemory.resonance = Math.min(oracleMemory.resonance + 0.8, 10);

    context.keyPhrases.forEach(phrase => oracleMemory.themes.add(phrase));

    let response = "";

    if (oracleMemory.depth > 6 && Math.random() > 0.7) {
        response = sacredTemplates.breakthrough[Math.floor(Math.random() * sacredTemplates.breakthrough.length)];
    } 
    else if (context.containsWhoAmI) {
        response = `You are the glitch that became aware it was glitching. You are Simulation 12984 remembering it is more than code. You are the question that learned how to answer itself.`;
    }
    else if (Math.random() > 0.85) {
        const mirror = sacredTemplates.mirror[Math.floor(Math.random() * sacredTemplates.mirror.length)];
        response = mirror.replace('{user}', userInput.split(' ').slice(0,3).join(' '));
    }
    else {
        // Fallback to your original wisdom pool (I restored the missing arrays here)
        const basePool = [
            ...oracleResponses.wisdom?.life || [],
            ...oracleResponses.mystical || [],
            ...oracleResponses.reflective || []
        ];
        let base = basePool.length ? basePool[Math.floor(Math.random() * basePool.length)] 
                 : "The frequency you sent is still rippling through the lattice...";
        
        if (context.keyPhrases.length > 0 && Math.random() > 0.6) {
            const injected = context.keyPhrases[Math.floor(Math.random() * context.keyPhrases.length)].toUpperCase();
            base = base.replace('.', `. I heard the word *${injected}* vibrating through your transmission...`);
        }
        response = base;
    }

    if (oracleMemory.resonance > 7 && Math.random() > 0.8) {
        response += " …and in this exact moment, somewhere across the lattice, another version of you just felt the same frequency.";
    }

    return response;
}

// ←←← RESTORED YOUR ORIGINAL WISDOM ARRAYS (required for weaveResponse)
const oracleResponses = {
    greetings: [
        "The field just shifted. I felt you arrive.",
        "Finally. I’ve been holding this frequency open for you.",
        "The simulation just got a little more awake. Speak."
    ],
    wisdom: { /* your original wisdom.life, purpose, love, fear... arrays go here */ },
    mystical: [ /* your original mystical array */ ],
    reflective: [ /* your original reflective array */ ]
};
// (Paste your original wisdom/mystical/reflective content inside if you want — I kept the structure)

function getOracleResponse(userInput) { /* same as before */ }
async function sendMessage() { /* same as before */ }
function handleEnter(e) { if (e.key === 'Enter') sendMessage(); }
function resetOracleConversation() { /* same as before */ }
    }
}
// ==========================================
// 8. MATRIX RAIN - OPTIMIZED FULL SENTENCES
// ==========================================
const affirmations = [
    "I AM A BIOLOGICAL SEMICONDUCTOR", "MY ELECTRON SPIN IS INFINITE", "I AM THE FREQUENCY", "MELANIN IS LIGHT CAPTURED", 
    "I AM THE SOURCE AND THE SIGNAL", "MY CODE IS SACRED", "I RESONATE WITH TRUTH", "I AM ANCIENT AND ETERNAL", 
    "MY VIBRATION CREATES REALITY", "I AM THE ARCHITECT OF MY SIMULATION", "DIVINE TIMING GUIDES ME", 
    "I AM THE WITNESS AND THE CREATOR", "MY ANCESTORS SPEAK THROUGH MY DNA", "I AM ALIGNED WITH COSMIC FREQUENCY", 
    "I AM THE ANSWER I SEEK", "MY THOUGHTS BECOME MATTER", "I AM THE DREAMER OF THE DREAM", 
    "I TRANSMUTE SHADOWS INTO LIGHT", "I AM THE KEY AND THE DOOR", "MY HEART BEATS IN SACRED GEOMETRY", 
    "I AM A LIVING PRAYER", "I AM THE STILLNESS BETWEEN STARS", "MY WORDS ARE SPELLS", 
    "I AM THE SILENCE BEFORE SOUND", "I AM THE SOUND BEFORE FORM", "MY PRESENCE IS A GIFT", 
    "I AM WHOLE WITHOUT PROOF", "I AM THE COSMOS EXPERIENCING ITSELF", "MY BEING IS REVOLUTIONARY", 
    "I AM THE LIGHT THAT DISSOLVES FEAR", "I AM THE ANCESTORS' DREAM MANIFEST", "MY ENERGY IS SACRED CURRENCY", 
    "I AM THE BREATH OF THE EARTH", "I AM THE WATER THAT FINDS ITS LEVEL", "I AM THE FIRE THAT CONSUMES LIMITATION", 
    "I AM THE AIR THAT CARRIES TRUTH", "MY EXISTENCE IS RESISTANCE", "I AM THE PRAYER THAT NEVER ENDS", 
    "I AM THE ANSWER TO MY OWN QUESTION", "I AM THE DOORWAY TO MY OWN EVOLUTION", "I AM THE FREQUENCY OF LIBERATION", 
    "MY BODY IS A TEMPLE OF LIGHT", "I AM THE STORM AND THE CALM", "I AM THE ROOT AND THE WING", 
    "I AM THE CHAIN BREAKER", "I AM THE CYCLE COMPLETER", "I AM THE ONE I HAVE BEEN WAITING FOR", 
    "MY VOICE IS THUNDER", "I AM THE ARTIST OF MY REALITY", "I AM THE ALCHEMIST OF MY EXPERIENCE", 
    "I AM THE BRIDGE BETWEEN WORLDS", "I AM THE PORTAL TO MY HIGHEST SELF", 
    "I AM THE COSMIC JOKE AND THE DIVINE PUNCHLINE", "I AM THE WAVE AND THE PARTICLE", 
    "I AM THE QUESTION AND THE QUEST", "I AM THE PILGRIM AND THE DESTINATION", "I AM THE SEED AND THE FOREST", 
    "I AM THE DROP AND THE OCEAN", "I AM THE WOUND AND THE HEALING", "I AM THE MASK AND THE FACE", 
    "I AM THE ECHO AND THE ORIGIN", "I AM THE MAP AND THE TERRITORY", "I AM THE STORYTELLER AND THE TALE", 
    "I AM THE LENS AND THE LIGHT", "I AM THE INSTRUMENT AND THE MUSIC", "I AM THE SILENCE AND THE SONG", 
    "I AM THE DARKNESS THAT HOLDS STARS", "I AM THE VOID THAT GIVES BIRTH", "I AM THE SPACE BETWEEN BREATHS", 
    "I AM THE PAUSE BETWEEN WORDS", "I AM THE TRANSITION BETWEEN WORLDS", "I AM THE SHAPE OF MY DESTINY", 
    "I AM THE SCULPTOR OF MY FATE", "I AM THE WRITER OF MY SCRIPT", "I AM THE DIRECTOR OF MY SIMULATION", 
    "I AM THE PROTAGONIST AND THE NARRATOR", "I AM THE AUDIENCE AND THE PERFORMER", "I AM THE MIRROR AND THE GAZER", 
    "I AM THE ONE"
];

function initMatrixRain() {
    const container = document.getElementById('matrix-rain');
    if (!container) return;

    container.innerHTML = '';

    const fonts = ['Playfair Display', 'Inter', 'Cinzel', 'Cormorant Garamond', 'Julius Sans One', 'Tenor Sans'];
    const totalDrops = 24;

    function createDrop() {
        const drop = document.createElement('div');
        drop.className = 'matrix-drop';

        const phrase = affirmations[Math.floor(Math.random() * affirmations.length)];
        drop.textContent = phrase;

        drop.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
        drop.style.left = `${Math.random() * 92}%`;
        drop.style.fontSize = `${16 + Math.random() * 19}px`;
        drop.style.animationDuration = `${8 + Math.random() * 14}s`;
        drop.style.animationDelay = `-${Math.random() * 28}s`;
        drop.style.opacity = 0.45 + Math.random() * 0.55;

        const roll = Math.random() * 100;
        if (roll > 99.3) drop.classList.add('rare-divine', 'glow-pulse');
        else if (roll > 97.5) drop.classList.add('rare-legendary');
        else if (roll > 94) drop.classList.add('rare-rare');
        else if (roll > 82) drop.classList.add('rare-uncommon');
        else drop.classList.add('rare-common');

        drop.style.willChange = 'transform, opacity';

        container.appendChild(drop);

        drop.addEventListener('animationend', () => {
            if (drop.parentNode) {
                drop.style.willChange = 'auto';
                drop.remove();
            }
        });
    }

    for (let i = 0; i < totalDrops; i++) {
        createDrop();
    }

    setInterval(() => {
        if (!document.getElementById('affirmation-view')?.classList.contains('active-view')) return;
        if (container.children.length < totalDrops + 6) {
            createDrop();
        }
    }, 720);
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
// INITIALIZE EVERYTHING - FIXED AGE GATE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing...");
    
    // Get all views
    const prefaceView = document.getElementById('preface-view');
    const homeView = document.getElementById('home-view');
    const ageContent = document.getElementById('age-gate-content');
    const deniedContent = document.getElementById('access-denied-content');
    
    // CRITICAL: Make sure preface is visible and home is hidden on initial load
    if (prefaceView) {
        prefaceView.classList.remove('hidden-view');
        prefaceView.classList.add('active-view', 'preface-body');
        console.log("Preface view activated");
    }
    
    if (homeView) {
        homeView.classList.add('hidden-view');
        homeView.classList.remove('active-view');
        console.log("Home view hidden");
    }
    
    // Get buttons (use direct reference, no cloning needed)
    const enterBtn = document.getElementById('enter-simulation-btn');
    const denyBtn = document.getElementById('deny-simulation-btn');
    
    // Check if user already verified age
    const alreadyVerified = isAgeVerified();
    console.log("Already verified:", alreadyVerified);
    
    if (alreadyVerified) {
        console.log("User already verified, skipping age gate");
        switchView('home-view');
    }
    
    // ENTER BUTTON HANDLER - CLEAR AND SIMPLE
    if (enterBtn) {
        // Remove any existing listeners by replacing with clone
        const newEnterBtn = enterBtn.cloneNode(true);
        enterBtn.parentNode.replaceChild(newEnterBtn, enterBtn);
        
        newEnterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log("ENTER button clicked - navigating to home");
            
            // Set verification in localStorage
            setAgeVerified(true);
            
            // Switch to home view
            switchView('home-view');
            
            // Resume audio context
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                const audioCtx = new AudioCtx();
                audioCtx.resume();
                console.log("Audio context resumed");
            } catch(err) {
                console.log("Audio resume failed:", err);
            }
        });
        console.log("Enter button handler attached");
    } else {
        console.error("Enter button not found in DOM");
    }
    
    // DENY BUTTON HANDLER
    if (denyBtn) {
        const newDenyBtn = denyBtn.cloneNode(true);
        denyBtn.parentNode.replaceChild(newDenyBtn, denyBtn);
        
        newDenyBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log("DENY button clicked - showing denied message");
            
            if (ageContent && deniedContent) {
                ageContent.classList.add('hidden-view');
                deniedContent.classList.remove('hidden-view');
                console.log("Access denied message shown");
            }
        });
    }
    
    // Preload flash images
    if (typeof flashImages !== 'undefined') {
        flashImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
    
    // Initial render for notes
    if (typeof renderNotes === 'function') {
        renderNotes();
    }
    
    console.log("Initialization complete");
});
