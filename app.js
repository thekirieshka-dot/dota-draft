import { FIGHTERS } from "./data.js";
import { startDraft } from "./draft.js";
import { startFight } from "./fight.js";

const app = document.getElementById("app");
const tg = window.Telegram?.WebApp;

if (tg) {
  tg.ready();
  tg.expand();
}

/* =========================
   SOUND ENGINE
   ========================= */
export const AudioFX = {
  ctx: null,
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },
  tone(freq, duration = .1, type = "sine", volume = .06) {
    this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  click() {
    this.tone(400, .06, "square", .04);
  },
  hit() {
    this.tone(90, .08, "sawtooth", .1);
  },
  skill() {
    this.tone(250, .08, "triangle", .07);
    setTimeout(() => {
      this.tone(560, .13, "triangle", .06);
    }, 50);
  },
  crit() {
    this.tone(750, .18, "triangle", .1);
  },
  knockout() {
    this.tone(60, .45, "square", .13);
  }
};

/* =========================
   MENU
   ========================= */
function showMenu() {
  app.innerHTML = `
    <main class="screen menu">
      <div class="menu-title">
        <span class="badge">TELEGRAM MINI APP</span>
        <h1>SHADOW ARENA</h1>
        <p>Dota Drafts × Shadow Fight</p>
      </div>
      <button class="mode-button" id="draftButton">
        <span class="badge">DOTA 2 • CAPTAIN'S MODE</span>
        <h2>⚔️ Битва драфтов</h2>
        <p>7 банов + 5 пиков у каждой команды. Полный ростер героев. Кто собрал сильнее драфт — тот победил.</p>
        <div class="mode-icon">⚔</div>
      </button>
      <button class="mode-button" id="fightButton">
        <span class="badge">DOTA SHADOW FIGHT</span>
        <h2>🥊 Shadow Fight</h2>
        <p>15 бойцов, 3 раунда, энергия, Q/W/E/R, блок, комбо, крит, нокаут и Fatality.</p>
        <div class="mode-icon">☠</div>
      </button>
    </main>
  `;

  document.getElementById("draftButton").onclick = () => {
    AudioFX.init();
    startDraft(app, showMenu, AudioFX);
  };

  document.getElementById("fightButton").onclick = () => {
    AudioFX.init();
    showFighterSelect();
  };
}

/* =========================
   FIGHTER SELECT
   ========================= */
function showFighterSelect() {
  app.innerHTML = `
    <main class="screen">
      <div class="topbar">
        <button class="back" id="back">←</button>
        <div class="logo">SHADOW FIGHT</div>
        <div></div>
      </div>
      <div style="padding:14px">
        <h2 style="margin:0">Выбери бойца</h2>
        <p style="color:#8793a4">Все 15 персонажей.</p>
      </div>
      <div class="fighter-list" id="fighterList"></div>
    </main>
  `;

  document.getElementById("back").onclick = showMenu;

  const list = document.getElementById("fighterList");
  FIGHTERS.forEach(fighter => {
    const button = document.createElement("button");
    button.className = "fighter";
    button.innerHTML = `
      <h3>${fighter.ru}</h3>
      <small>${fighter.name} • ${fighter.role}</small>
      <div class="fighter-info">
        ❤️ ${fighter.hp} ⚔️ ${fighter.damage} 🛡 ${fighter.defense}<br>
        ⚡ Скорость: ${fighter.speed}<br><br>
        Q — ${fighter.skills[0]}<br>
        W — ${fighter.skills[1]}<br>
        E — ${fighter.skills[2]}<br>
        R — ${fighter.skills[3]}
      </div>
    `;
    button.onclick = () => {
      const enemy = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
      startFight(app, showMenu, AudioFX, fighter, enemy);
    };
    list.appendChild(button);
  });
}

showMenu();
