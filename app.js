import { FIGHTERS } from './fighters.js';
import { startFight } from './fight.js';

const app = document.getElementById('app');

function showMenu() {
  app.innerHTML = `
    <div class="menu">
      <h1>🥊 УЛИЧНЫЙ БОЙ</h1>
      <p>Выбери бойца для битвы:</p>
      <div class="fighter-grid">
        ${FIGHTERS.map(f => `
          <button onclick="window.selectFighter('${f.id}')">
            <h3>${f.name}</h3>
            <p>❤️ ${f.hp} ⚡ ${f.speed}</p>
            <small>⚔️ ${f.weapon}</small>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

window.showMenu = showMenu;
showMenu();
