const clockEl = document.getElementById('clock');
const alarmInput = document.getElementById('alarm-time');
const toggleBtn = document.getElementById('toggle-btn');
const alarmStatus = document.getElementById('alarm-status');
const statusText = document.getElementById('status-text');
const ringingOverlay = document.getElementById('ringing-overlay');
const dismissBtn = document.getElementById('dismiss-btn');

let alarmActive = false;
let audioCtx = null;
let beepInterval = null;

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  checkAlarm(now);
}

function checkAlarm(now) {
  if (!alarmActive) return;

  const [h, m] = alarmInput.value.split(':').map(Number);
  if (now.getHours() === h && now.getMinutes() === m && now.getSeconds() === 0) {
    triggerAlarm();
  }
}

function beep() {
  if (!audioCtx) audioCtx = new AudioContext();

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.type = 'square';
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
}

function triggerAlarm() {
  ringingOverlay.classList.remove('hidden');
  beepInterval = setInterval(beep, 600);
  beep();
}

function dismiss() {
  ringingOverlay.classList.add('hidden');
  clearInterval(beepInterval);
  beepInterval = null;
  deactivateAlarm();
}

function activateAlarm() {
  alarmActive = true;
  toggleBtn.textContent = 'CANCEL';
  toggleBtn.classList.add('active');
  statusText.textContent = alarmInput.value;
  alarmStatus.classList.remove('hidden');
  localStorage.setItem('alarmTime', alarmInput.value);
}

function deactivateAlarm() {
  alarmActive = false;
  toggleBtn.textContent = 'SET';
  toggleBtn.classList.remove('active');
  alarmStatus.classList.add('hidden');
  localStorage.removeItem('alarmTime');
}

toggleBtn.addEventListener('click', () => {
  if (!alarmInput.value) return;
  alarmActive ? deactivateAlarm() : activateAlarm();
});

dismissBtn.addEventListener('click', dismiss);

const saved = localStorage.getItem('alarmTime');
if (saved) {
  alarmInput.value = saved;
  activateAlarm();
}

updateClock();
setInterval(updateClock, 1000);
