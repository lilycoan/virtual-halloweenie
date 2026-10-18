// Virtual Hallo"weenie": Lab Breach
//
// Coordination model (one rule for everything that moves, sounds or waits):
//   - App state  : stage.dataset.state = 'start' | 'explore' | 'story'
//   - Pause flag : stage.classList 'is-paused' (independent of state, so a story can be paused mid-way)
//   - CSS motion : frozen by one CSS rule whenever state is 'start' or the stage is paused
//   - JS timing  : a scene clock that only advances while running; every timer uses it (after())
//   - Audio      : one AudioContext, suspended on pause and resumed on play
// So pausing freezes motion, sound, timers and taps together, and resumes exactly where it stopped.

const stage = document.getElementById('stage');
const params = new URLSearchParams(location.search);
const $ = (sel) => stage.querySelector(sel);
const $$ = (sel) => [...stage.querySelectorAll(sel)];

// ---------- Reduced motion (applied before Enter, and kept in sync if the setting changes) ----------
const reducedMotionQuery = matchMedia('(prefers-reduced-motion: reduce)');
function applyReducedMotion() {
  stage.classList.toggle('reduced-motion', reducedMotionQuery.matches || params.has('reduced'));
}
applyReducedMotion();
reducedMotionQuery.addEventListener('change', applyReducedMotion);

if (params.has('debug')) document.body.classList.add('debug');

// ============================================================
// Scene clock: advances only while the scene is running and not paused
// ============================================================
const clock = { now: 0, last: null, timers: [] };

function isRunning() {
  return stage.dataset.state !== 'start' && !stage.classList.contains('is-paused');
}

// Schedule fn after ms of *scene* time. tag lets a group of timers be cancelled together.
function after(ms, fn, tag = '') {
  clock.timers.push({ at: clock.now + ms, fn, tag });
}
function cancelTimers(tag) {
  clock.timers = clock.timers.filter((t) => t.tag !== tag);
}

function tick(ts) {
  if (clock.last === null) clock.last = ts;
  const dt = Math.min(ts - clock.last, 100); // clamp so a stalled frame can't skip story steps
  clock.last = ts;
  if (isRunning()) {
    clock.now += dt;
    const due = clock.timers.filter((t) => t.at <= clock.now);
    clock.timers = clock.timers.filter((t) => t.at > clock.now);
    due.sort((a, b) => a.at - b.at).forEach((t) => t.fn());
    updateHints();
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ============================================================
// Audio: CC0 samples + small synthesized effects, all through one context
// ============================================================
const audio = { ctx: null, master: null, buffers: {}, ambient: null };

const SAMPLE_FILES = {
  wind: 'assets/audio/ambient-wind-loop.mp3',
  siren: 'assets/audio/ambient-distant-siren.mp3',
  crowd: 'assets/audio/story-zombie-crowd.mp3',
  groan1: 'assets/audio/groan-754438.mp3',
  groan2: 'assets/audio/groan-754441.mp3',
  moan: 'assets/audio/moan-445995.mp3',
  crow1: 'assets/audio/crow-813115.mp3',
  crow2: 'assets/audio/crow-673554.mp3',
};

// Must run inside the Enter tap so mobile browsers allow sound.
function initAudio() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  audio.ctx = new Ctx();
  audio.master = audio.ctx.createGain();
  audio.master.gain.value = 0.9;
  audio.master.connect(audio.ctx.destination);
  // iOS unlock: play one silent sample inside the gesture
  const silent = audio.ctx.createBufferSource();
  silent.buffer = audio.ctx.createBuffer(1, 1, 22050);
  silent.connect(audio.master);
  silent.start(0);
  audio.ctx.resume();

  Object.entries(SAMPLE_FILES).forEach(([name, url]) => {
    fetch(url)
      .then((r) => r.arrayBuffer())
      .then((data) => new Promise((ok, fail) => audio.ctx.decodeAudioData(data, ok, fail)))
      .then((buf) => {
        audio.buffers[name] = buf;
        if (name === 'wind') startAmbientLoop();
      })
      .catch((err) => console.warn('[audio] failed to load', name, err));
  });
}

function playSample(name, { gain = 1, rate = 1 } = {}) {
  const buf = audio.buffers[name];
  if (!audio.ctx || !buf) return;
  const src = audio.ctx.createBufferSource();
  const g = audio.ctx.createGain();
  src.buffer = buf;
  src.playbackRate.value = rate;
  g.gain.value = gain;
  src.connect(g).connect(audio.master);
  src.start();
}

function startAmbientLoop() {
  if (audio.ambient) return;
  const src = audio.ctx.createBufferSource();
  const g = audio.ctx.createGain();
  src.buffer = audio.buffers.wind;
  src.loop = true;
  // Trim the MP3 encoder padding at both ends so the loop seam is silent-free
  src.loopStart = 0.06;
  src.loopEnd = src.buffer.duration - 0.06;
  g.gain.value = 0;
  g.gain.linearRampToValueAtTime(0.7, audio.ctx.currentTime + 2.5);
  src.connect(g).connect(audio.master);
  src.start(0, 0.06);
  audio.ambient = { src, gain: g };
}

// Duck the wind during the story so the story sounds read clearly
function setAmbientLevel(level, seconds = 0.6) {
  if (!audio.ambient) return;
  const g = audio.ambient.gain.gain;
  const t = audio.ctx.currentTime;
  g.cancelScheduledValues(t);
  g.setValueAtTime(g.value, t);
  g.linearRampToValueAtTime(level, t + seconds);
}

// --- Synth helpers (original sounds, no licensing needed) ---
function tone({ freq = 440, type = 'sine', dur = 0.2, gain = 0.3, slideTo = null, delay = 0 }) {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime + delay;
  const osc = audio.ctx.createOscillator();
  const g = audio.ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(audio.master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise({ dur = 0.5, gain = 0.3, filter = 'bandpass', freq = 1000, freqTo = null, q = 1, delay = 0 }) {
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime + delay;
  const len = Math.ceil(audio.ctx.sampleRate * dur);
  const buf = audio.ctx.createBuffer(1, len, audio.ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = audio.ctx.createBufferSource();
  const f = audio.ctx.createBiquadFilter();
  const g = audio.ctx.createGain();
  src.buffer = buf;
  f.type = filter;
  f.Q.value = q;
  f.frequency.setValueAtTime(freq, t);
  if (freqTo) f.frequency.exponentialRampToValueAtTime(freqTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + Math.min(0.08, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(audio.master);
  src.start(t);
}

const sfx = {
  lampBeep: (i) => tone({ freq: [523, 659, 784][i], type: 'square', dur: 0.18, gain: 0.12 }),
  wrong: () => { tone({ freq: 140, type: 'sawtooth', dur: 0.35, gain: 0.18 }); tone({ freq: 147, type: 'sawtooth', dur: 0.35, gain: 0.12 }); },
  zap: () => { noise({ dur: 0.35, gain: 0.35, filter: 'highpass', freq: 2500 }); tone({ freq: 120, type: 'sawtooth', dur: 0.3, gain: 0.12 }); },
  surge: () => tone({ freq: 90, type: 'triangle', dur: 0.9, gain: 0.25, slideTo: 180 }),
  denied: () => { tone({ freq: 392, type: 'square', dur: 0.16, gain: 0.1 }); tone({ freq: 262, type: 'square', dur: 0.28, gain: 0.1, delay: 0.18 }); },
  // Owl-like "hoo-hoo" for the moon: two soft falling sines
  hoot: () => { tone({ freq: 420, dur: 0.35, gain: 0.22, slideTo: 360 }); tone({ freq: 400, dur: 0.55, gain: 0.2, slideTo: 330, delay: 0.45 }); },
  // Story: rising/falling alarm whoop, repeated by the timeline
  alarmWhoop: () => tone({ freq: 520, type: 'sawtooth', dur: 0.85, gain: 0.13, slideTo: 980 }),
  gasHiss: () => noise({ dur: 2.6, gain: 0.22, filter: 'bandpass', freq: 3000, freqTo: 1200, q: 0.7 }),
  whoosh: () => noise({ dur: 1.0, gain: 0.5, filter: 'bandpass', freq: 400, freqTo: 4000, q: 0.8 }),
  doorSlam: () => { noise({ dur: 0.3, gain: 0.5, filter: 'lowpass', freq: 300 }); tone({ freq: 70, type: 'sine', dur: 0.4, gain: 0.4, slideTo: 40 }); },
  allClear: () => [659, 784, 1047].forEach((f, i) => tone({ freq: f, type: 'triangle', dur: 0.5, gain: 0.16, delay: i * 0.12 })),
};

// Occasional ambient sounds on the scene clock (stop while paused or during the story)
function scheduleAmbientEvent() {
  after(9000 + Math.random() * 12000, () => {
    if (stage.dataset.state === 'explore') {
      const pick = Math.random();
      if (pick < 0.4) playSample(Math.random() < 0.5 ? 'groan1' : 'groan2', { gain: 0.35, rate: 0.85 + Math.random() * 0.3 });
      else if (pick < 0.75) playSample(Math.random() < 0.5 ? 'crow1' : 'crow2', { gain: 0.3 });
      else playSample('siren', { gain: 0.5 });
    }
    scheduleAmbientEvent();
  }, 'ambient');
}

// ============================================================
// Pause / Play
// ============================================================
const pauseBtn = document.getElementById('pause-btn');

function setPaused(paused) {
  stage.classList.toggle('is-paused', paused);
  pauseBtn.setAttribute('aria-pressed', String(paused));
  pauseBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
  if (audio.ctx) paused ? audio.ctx.suspend() : audio.ctx.resume();
}
pauseBtn.addEventListener('click', () => setPaused(!stage.classList.contains('is-paused')));

// Keyboard shortcut P, and auto-pause when the app is hidden (tab switch, phone lock)
document.addEventListener('keydown', (e) => {
  if ((e.key === 'p' || e.key === 'P') && stage.dataset.state !== 'start') setPaused(!stage.classList.contains('is-paused'));
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && stage.dataset.state !== 'start') setPaused(true);
});

// ============================================================
// Start screen + credits
// ============================================================
const startScreen = document.getElementById('start-screen');
const credits = document.getElementById('credits');

document.getElementById('enter-btn').addEventListener('click', () => {
  initAudio();
  stage.dataset.state = 'explore';
  hints.idleSince = clock.now;
  scheduleAmbientEvent();
  after(4000, playLampPattern, 'pattern');
  $('.lamp').focus({ preventScroll: true });
});
document.getElementById('credits-btn').addEventListener('click', () => {
  startScreen.hidden = true;
  credits.hidden = false;
  document.getElementById('credits-close').focus();
});
document.getElementById('credits-close').addEventListener('click', () => {
  credits.hidden = true;
  startScreen.hidden = false;
  document.getElementById('credits-btn').focus();
});

// ============================================================
// Props: every tap gives unique audiovisual feedback
// ============================================================

// Restart a one-shot CSS reaction even if it is tapped again mid-animation.
// The cleanup timer is keyed per element + class, so reacting several elements at once
// (e.g. all three lamps) never cancels another element's cleanup.
const reactKeys = new WeakMap();
let nextReactKey = 0;
function react(el, cls = 'is-reacting', ms = 1600) {
  if (!reactKeys.has(el)) reactKeys.set(el, ++nextReactKey);
  const tag = `react-${reactKeys.get(el)}-${cls}`;
  el.classList.remove(cls);
  void el.offsetWidth; // force reflow so the animation restarts
  el.classList.add(cls);
  cancelTimers(tag);
  after(ms, () => el.classList.remove(cls), tag);
}

const propHandlers = {
  moon: (el) => { react(el); sfx.hoot(); },
  crows: (el) => { react(el, 'is-reacting', 2400); playSample('crow1', { gain: 0.6 }); after(250, () => playSample('crow2', { gain: 0.5 })); },
  'streetlight-left': (el) => { react(el, 'is-reacting', 1400); sfx.zap(); },
  'streetlight-right': (el) => { react(el, 'is-reacting', 1200); sfx.surge(); },
  door: (el) => { react(el, 'is-reacting', 1600); sfx.denied(); },
  lamp: (el) => onLampTap(el),
};

$$('.prop').forEach((el) => {
  el.addEventListener('click', () => {
    // Taps are ignored while paused or while a story plays (CSS also blocks pointer events)
    if (!isRunning() || stage.dataset.state !== 'explore') return;
    // Exploring the wrong things brings the next hint sooner
    if (el.dataset.prop !== 'lamp') hints.nudges++;
    propHandlers[el.dataset.prop]?.(el);
  });
});

// ============================================================
// Story 1 trigger: light the three warning lamps from top to bottom
// ============================================================
const lamps = $$('.lamp');
let lampProgress = 0;

function onLampTap(el) {
  const index = Number(el.dataset.index);
  react(el, 'is-tapped', 250);
  if (index === lampProgress) {
    el.classList.add('is-lit');
    sfx.lampBeep(index);
    lampProgress++;
    el.querySelector('.lamp-pip').textContent = lampProgress + '/3';
    hints.idleSince = clock.now; // progress counts as activity
    hints.nudges = 0;
    if (lampProgress === 3) after(450, startLabBreach, 'story');
  } else if (!el.classList.contains('is-lit')) {
    // Wrong lamp: buzz, blink all lamps amber, reset progress
    sfx.wrong();
    resetLamps();
    lamps.forEach((l) => react(l, 'is-wrong', 700));
    flashHint('Wrong order… the alarm system reset.', 3000);
  }
}

// Diegetic pattern hint: lamps glow softly top → bottom every few seconds,
// only while no lamp has been lit (so it never fights the player's own progress)
function playLampPattern() {
  if (stage.dataset.state === 'explore' && lampProgress === 0) {
    lamps.forEach((l, i) => after(i * 320, () => {
      if (lampProgress !== 0 || stage.dataset.state !== 'explore') return;
      react(l, 'is-hinting', 700);
      tone({ freq: [523, 659, 784][i], type: 'sine', dur: 0.15, gain: 0.035 });
    }, 'pattern'));
  }
  after(foundSecrets.size ? 20000 : 10000, playLampPattern, 'pattern');
}

function resetLamps() {
  lampProgress = 0;
  lamps.forEach((l) => l.classList.remove('is-lit'));
}

// ============================================================
// Story 1: Lab Breach (~8.6s). Beginning: alarm. Middle: gas + zombies. End: decontamination.
// ============================================================
const gasCloud = document.getElementById('gas-cloud');
const crowd = document.getElementById('zombie-crowd');
const banner = document.getElementById('story-banner');
const zombieTemplate = document.getElementById('zombie-template');

// Gas puffs: start at the lab base and drift outward (dx/dy in cqw)
const GAS = [
  { x: 42, y: 62, s: 34, dx: '-22cqw', dy: '6cqw', d: '0s' },
  { x: 58, y: 62, s: 34, dx: '22cqw', dy: '6cqw', d: '0.1s' },
  { x: 50, y: 64, s: 42, dx: '0cqw', dy: '20cqw', d: '0.25s' },
  { x: 36, y: 58, s: 28, dx: '-30cqw', dy: '-10cqw', d: '0.4s' },
  { x: 64, y: 58, s: 28, dx: '30cqw', dy: '-8cqw', d: '0.5s' },
  { x: 50, y: 66, s: 50, dx: '0cqw', dy: '40cqw', d: '0.7s' },
];
// Zombies: walk from the door (50%, 66%) toward the viewer, ending big in the foreground
const ZOMBIES = [
  { tx: '-28cqw', ty: '30cqh', s: 1.6, d: '0s', skin: '#7fae6a', shirt: '#4b5f8a' },
  { tx: '24cqw', ty: '26cqh', s: 1.35, d: '0.35s', skin: '#93b86f', shirt: '#8a4b6e' },
  { tx: '-6cqw', ty: '20cqh', s: 1.05, d: '0.7s', skin: '#6f9e7a', shirt: '#6e7a3c' },
  { tx: '10cqw', ty: '14cqh', s: 0.8, d: '1.0s', skin: '#86a86a', shirt: '#3c5e6e' },
];

GAS.forEach((p) => {
  const puff = document.createElement('div');
  puff.className = 'gas-puff';
  Object.entries(p).forEach(([k, v]) => puff.style.setProperty('--' + k, v));
  gasCloud.appendChild(puff);
});
// Append back-to-front so the nearest (largest) zombie draws on top
[...ZOMBIES].reverse().forEach((z) => {
  const node = zombieTemplate.content.firstElementChild.cloneNode(true);
  Object.entries(z).forEach(([k, v]) => node.style.setProperty('--' + k, v));
  crowd.appendChild(node);
});

// Distant shamblers reuse the same zombie drawing
$$('.shambler').forEach((el) => el.appendChild(zombieTemplate.content.querySelector('svg').cloneNode(true)));

const STORY_PHASES = ['breach-alarm', 'breach-gas', 'breach-zombies', 'breach-decon', 'breach-clear'];

function setBanner(text, cls) {
  banner.className = 'story-banner';
  void banner.offsetWidth;
  banner.textContent = text;
  if (cls) banner.classList.add(cls);
}

function startLabBreach() {
  stage.dataset.state = 'story';
  setHint('');
  setAmbientLevel(0.15);
  const T = (ms, fn) => after(ms, fn, 'story');

  // Beginning (0–2s): alarm
  T(0, () => {
    stage.classList.add('breach-alarm');
    setBanner('⚠ CONTAINMENT BREACH', 'is-alarm');
    sfx.alarmWhoop();
  });
  T(900, sfx.alarmWhoop);
  T(1800, sfx.alarmWhoop);

  // Middle (1.8–6s): vents burst, zombies lurch out
  T(1800, () => { stage.classList.add('breach-gas'); sfx.gasHiss(); });
  T(2400, () => { stage.classList.add('breach-zombies'); playSample('crowd', { gain: 0.9 }); });
  T(3400, () => playSample('moan', { gain: 0.6 }));
  T(4600, () => playSample('groan2', { gain: 0.6, rate: 0.9 }));

  // End (6–8.6s): decontamination flash pulls everything back inside
  T(6000, () => {
    stage.classList.remove('breach-alarm');
    stage.classList.add('breach-decon');
    setBanner('');
    sfx.whoosh();
  });
  T(6900, () => {
    sfx.doorSlam();
    resetLamps();
  });
  T(7300, () => {
    stage.classList.add('breach-clear');
    setBanner('✓ ALL CLEAR', 'is-clear');
    sfx.allClear();
  });
  T(8600, endLabBreach);
}

function endLabBreach() {
  stage.classList.remove(...STORY_PHASES);
  setBanner('');
  resetLamps();
  setAmbientLevel(0.7, 1.5);
  stage.dataset.state = 'explore';
  hints.level = 0;
  hints.idleSince = clock.now;
  hints.nudges = 0;
  hints.storiesSeen++;
  revealSecret('lab-breach');
  $('.lamp').focus({ preventScroll: true });
}

// ============================================================
// Progressive hints: appear after idle time without story progress
// ============================================================
// "Effective idle" = time since last progress + 5s for every tap on a non-trigger prop,
// so players who tap around get help sooner than players who just watch.
const hintEl = document.getElementById('hint');
const HINTS = [
  { after: 8000, text: 'Something in the lab keeps blinking…' },
  { after: 22000, text: 'Those lab lights seem to blink in a certain order.' },
  { after: 40000, text: 'Alarms usually start at the top…' },
];
const NUDGE_MS = 5000;
const hints = { idleSince: 0, nudges: 0, storiesSeen: 0, flash: null };

function setHint(text) {
  if (hintEl.textContent !== text) hintEl.textContent = text;
}

// A short reaction message that temporarily replaces the progressive hint
function flashHint(text, ms) {
  hints.flash = { text, until: clock.now + ms };
}

function updateHints() {
  if (stage.dataset.state !== 'explore') return;
  if (hints.flash && clock.now < hints.flash.until) return setHint(hints.flash.text);
  hints.flash = null;

  // Mid-trigger: encourage without telling
  if (lampProgress > 0) return setHint('The lab noticed you… keep going.');

  const idle = clock.now - hints.idleSince + hints.nudges * NUDGE_MS;
  // After the story has played once, only a gentle replay nudge appears
  if (hints.storiesSeen > 0) {
    return setHint(idle > 15000 ? 'The lab is resetting… it might breach again.' : '');
  }
  let text = '';
  HINTS.forEach((h) => { if (idle >= h.after) text = h.text; });
  setHint(text);
}

// ============================================================
// Secrets counter: one secret per story.
// SECRET_TOTAL drives the badge, the start-screen goal and the found message.
// Phase 1 ships one story; set this to 3 when the other stories exist.
// ============================================================
const SECRET_TOTAL = 1;
const foundSecrets = new Set();
const secretsEl = document.getElementById('secrets');

document.getElementById('secrets-total').textContent = SECRET_TOTAL;
document.getElementById('goal').innerHTML = SECRET_TOTAL === 1
  ? 'The lab is hiding <strong>a secret</strong>.<br>Can you wake it?'
  : `The lab is hiding <strong>${SECRET_TOTAL} secrets</strong>.<br>Can you wake them?`;

function revealSecret(id) {
  if (foundSecrets.has(id)) return; // replays don't count twice
  foundSecrets.add(id);
  document.getElementById('secrets-count').textContent = foundSecrets.size;
  react(secretsEl, 'is-new', 1200);
  flashHint(foundSecrets.size < SECRET_TOTAL
    ? 'Secret found! The city is hiding more…'
    : 'You woke the lab! Tap the lights again to replay.', 4000);
}

// ---------- Dev shortcuts ----------
// ?skip  : bypass the start screen (no audio; for screenshots)
// ?story : run the story immediately after Enter/skip
if (params.has('skip')) {
  stage.dataset.state = 'explore';
  if (params.has('story')) after(300, startLabBreach, 'story');
}
window.labBreach = startLabBreach; // console: labBreach()
