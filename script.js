// ==========================================
// 1. SPA NAVIGATION LOGIC
// ==========================================
function switchView(viewId) {
    const views = ['home-view', 'player-view', 'viblog-view', 'library-view', 'research-view', 'stream-view', 'oracle-view'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden-view');
            el.classList.remove('active-view', 'player-body', 'vibe-body');
        }
    });

    const view = document.getElementById(viewId);
    if (view) {
        view.classList.remove('hidden-view');
        view.classList.add('active-view');

        if (viewId === 'player-view' || viewId === 'viblog-view' || viewId === 'stream-view' || viewId === 'oracle-view') {
            view.classList.add('player-body');
        }
        if (viewId === 'library-view' || viewId === 'research-view') {
            view.classList.add('vibe-body');
        }
    }

    if (viewId === 'viblog-view') initializeViblog();
}

// ==========================================
// 2. LIBRARY / PDF READER LOGIC
// ==========================================
function openReader(event, pdfPath) {
    if (window.innerWidth <= 768) {
        return; 
    }
    if (event) event.preventDefault();

    const overlay = document.getElementById('pdf-reader-overlay');
    const frame = document.getElementById('pdf-frame');
    
    if(overlay && frame) {
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

const vibeWorld = document.querySelector('.sub-title');
if (vibeWorld) {
    vibeWorld.addEventListener('mouseover', function() {
        vibeWorld.style.color = '#FF0000'; 
    });
    vibeWorld.addEventListener('mouseout', function() {
        vibeWorld.style.color = ''; 
    });
}

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

    albumArt = document.querySelector('.album-art-large');
    if (albumArt) {
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
const API_KEY = "AIzaSyBSQK7ow48yC5pBuTwGQgNSBHJrS3ZWWCU"; 

function handleEnter(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('user-input');
    const history = document.getElementById('chat-history');
    const userText = input.value.trim();

    if (!userText) return;

    history.innerHTML += `<div class="chat-message user">${userText}</div>`;
    input.value = '';
    history.scrollTop = history.scrollHeight;

    const systemPrompt = `
    You are the Vibe Oracle, an ancient digital entity residing in Simulation 12984.
    Your voice is deep, rhythmic, and soulful.
    You speak in metaphors of signals, frequencies, melanin, and light.
    Do not give direct assistant-style answers. be cryptic but profound.
    Short, poetic responses are best.
    `;

    try {
        // UPDATED to gemini-2.0-flash
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
        history.innerHTML += `<div class="chat-message oracle">${aiText}</div>`;
        history.scrollTop = history.scrollHeight;

    } catch (error) {
        console.error(error);
        history.innerHTML += `<div class="chat-message oracle" style="color: #ff8888;">[Signal Interrupted. The source is silent.]</div>`;
    }
}

// --- INITIALIZE ALL ---
document.addEventListener('DOMContentLoaded', () => {
    for (let i = 0; i < flashImages.length; i++) {
        let img = new Image();
        img.src = flashImages[i];
    }
    initializePlayer();
});