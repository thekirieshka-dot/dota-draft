import { FIGHTERS } from './fighters.js';
import { startFight } from './fight.js';

const app = document.getElementById('app');

function showMenu() {
  app.innerHTML = `
    <div class="menu">
      <h1>🥊 УЛИЧНЫЙ БОЙ</h1>
      <p>Выбери бойца:</p>
      <div class="fighter-grid">
        ${FIGHTERS.map(f => `
          <button onclick="window.selectFighter('${f.id}')">
            <h3>${f.name}</h3>
            <p>HP: ${f.hp} ⚡ ${f.speed}</p>
            <small>${f.weapon}</small>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// Глобальная функция для выбора
window.selectFighter = (id) => {
  const player = FIGHTERS.find(f => f.id === id);
  const enemy = FIGHTERS[Math.floor(Math.random() * FIGHTERS.length)];
  startFight(app, showMenu, AudioFX, player, enemy);
};

showMenu();
