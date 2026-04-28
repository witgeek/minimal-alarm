const clockEl = document.getElementById('clock');
const dateLabel = document.getElementById('date-label');
const ringEl = document.getElementById('ring');
const alarmInput = document.getElementById('alarm-time');
const toggleBtn = document.getElementById('toggle-btn');
const alarmBadge = document.getElementById('alarm-badge');
const badgeText = document.getElementById('badge-text');
const ringingOverlay = document.getElementById('ringing-overlay');
const dismissBtn = document.getElementById('dismiss-btn');

const CIRCUMFERENCE = 2 * Math.PI * 104;
ringEl.style.strokeDasharray = CIRCUMFERENCE;

let alarmActive = false;
let audioCtx = null;
let beepInterval = null;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function updateClock() {
  const now = new Date();
  clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  dateLabel.textContent = `${DAYS[now.getDay()]} ${MONTHS[now.getMonth()]} ${now.getDate()}`;
  updateRing(now);
  checkAlarm(now);
}

function updateRing(now) {
  if (!alarmActive || !alarmInput.value) {
    ringEl.style.strokeDashoffset = CIRCUMFERENCE;
    return;
  }

  const [ah, am] = alarmInput.value.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  let alarmMins = ah * 60 + am;
  if (alarmMins <= nowMins) alarmMins += 1440;

  const remaining = alarmMins - nowMins;
  const progress = 1 - remaining / 1440;
  ringEl.style.strokeDashoffset = CIRCUMFERENCE * (1 - progress);
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
  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime);
  osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);
}

function triggerAlarm() {
  ringingOverlay.classList.remove('hidden');
  beepInterval = setInterval(beep, 700);
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
  badgeText.textContent = `set for ${alarmInput.value}`;
  alarmBadge.classList.remove('hidden');
  localStorage.setItem('alarmTime', alarmInput.value);
}

function deactivateAlarm() {
  alarmActive = false;
  toggleBtn.textContent = 'SET ALARM';
  toggleBtn.classList.remove('active');
  alarmBadge.classList.add('hidden');
  ringEl.style.strokeDashoffset = CIRCUMFERENCE;
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
