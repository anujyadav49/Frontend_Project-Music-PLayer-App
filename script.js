// ====== Playlist ======
// Apne gaane yahan add karo. Local file ke liye src: "songs/mera-gaana.mp3"
const tracks = [
  { title: "Sunrise Drive",  artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", hue: 335 },
  { title: "Blue Hour",      artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", hue: 200 },
  { title: "Neon Streets",   artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", hue: 160 },
  { title: "Late Train",     artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", hue: 40 },
  { title: "Paper Lanterns", artist: "SoundHelix", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", hue: 270 },
];

// ====== Elements ======
const $ = (id) => document.getElementById(id);
const audio = $("audio");
const record = $("record");
const tonearm = $("tonearm");
const titleEl = $("title");
const artistEl = $("artist");
const seek = $("seek");
const volume = $("volume");
const currentEl = $("current");
const durationEl = $("duration");
const playBtn = $("play");
const iconPlay = $("icon-play");
const iconPause = $("icon-pause");
const shuffleBtn = $("shuffle");
const repeatBtn = $("repeat");
const playlistEl = $("playlist");

let index = 0;
let shuffle = false;
let repeat = false;

// ====== Helpers ======
const fmt = (s) => {
  if (!isFinite(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
};

const setFill = (input) => {
  const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
  input.style.setProperty("--p", pct + "%");
};

// ====== Playlist UI ======
function renderPlaylist() {
  playlistEl.innerHTML = "";
  tracks.forEach((t, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <button type="button">
        <span><span class="t-title">${t.title}</span><span class="t-artist">${t.artist}</span></span>
        <span class="bars" aria-hidden="true"><i></i><i></i><i></i></span>
      </button>`;
    li.querySelector("button").addEventListener("click", () => {
      if (i === index) togglePlay();
      else { loadTrack(i); play(); }
    });
    playlistEl.appendChild(li);
  });
}

function markActive() {
  [...playlistEl.children].forEach((li, i) => li.classList.toggle("active", i === index));
}

// ====== Core controls ======
function loadTrack(i) {
  index = i;
  const t = tracks[index];
  audio.src = t.src;
  titleEl.textContent = t.title;
  artistEl.textContent = t.artist;
  document.documentElement.style.setProperty("--accent", `hsl(${t.hue} 85% 62%)`);
  document.title = `${t.title} – Groove`;
  seek.value = 0;
  setFill(seek);
  currentEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  markActive();
}

function play() {
  audio.play().catch(() => {
    artistEl.textContent = "Ye gaana load nahi hua. Internet ya file path check karo.";
  });
}
function pause() { audio.pause(); }
function togglePlay() { audio.paused ? play() : pause(); }

function next() {
  if (shuffle && tracks.length > 1) {
    let r;
    do { r = Math.floor(Math.random() * tracks.length); } while (r === index);
    loadTrack(r);
  } else {
    loadTrack((index + 1) % tracks.length);
  }
  play();
}

function prev() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack((index - 1 + tracks.length) % tracks.length);
  play();
}

// ====== Events ======
playBtn.addEventListener("click", togglePlay);
$("next").addEventListener("click", next);
$("prev").addEventListener("click", prev);

shuffleBtn.addEventListener("click", () => {
  shuffle = !shuffle;
  shuffleBtn.setAttribute("aria-pressed", shuffle);
});
repeatBtn.addEventListener("click", () => {
  repeat = !repeat;
  repeatBtn.setAttribute("aria-pressed", repeat);
});

audio.addEventListener("play", () => syncPlayState(true));
audio.addEventListener("pause", () => syncPlayState(false));

function syncPlayState(isPlaying) {
  iconPlay.hidden = isPlaying;
  iconPause.hidden = !isPlaying;
  playBtn.setAttribute("aria-label", isPlaying ? "Pause" : "Play");
  record.classList.toggle("playing", isPlaying);
  tonearm.classList.toggle("playing", isPlaying);
  playlistEl.children[index]?.classList.toggle("is-playing", isPlaying);
  [...playlistEl.children].forEach((li, i) => { if (i !== index) li.classList.remove("is-playing"); });
}

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = fmt(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!audio.duration) return;
  seek.value = (audio.currentTime / audio.duration) * 1000;
  setFill(seek);
  currentEl.textContent = fmt(audio.currentTime);
});

audio.addEventListener("ended", () => {
  if (repeat) { audio.currentTime = 0; play(); }
  else next();
});

audio.addEventListener("error", () => {
  artistEl.textContent = "Ye gaana load nahi hua. Internet ya file path check karo.";
});

seek.addEventListener("input", () => {
  if (audio.duration) audio.currentTime = (seek.value / 1000) * audio.duration;
  setFill(seek);
});

volume.addEventListener("input", () => {
  audio.volume = volume.value;
  setFill(volume);
});

// Keyboard: Space = play/pause, ← → = 5 sec aage/peeche
document.addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || e.target.tagName === "BUTTON") return;
  if (e.code === "Space") { e.preventDefault(); togglePlay(); }
  if (e.code === "ArrowRight") audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5);
  if (e.code === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
});

// ====== Start ======
renderPlaylist();
loadTrack(0);
audio.volume = volume.value;
setFill(volume);
