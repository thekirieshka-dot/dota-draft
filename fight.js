import { FIGHTERS } from './fighters.js';

let fightState = null;

export function startFight(app, menu, playerFighter, enemyFighter) {
  const player = {
    ...playerFighter,
    currentHp: playerFighter.hp,
    maxHp: playerFighter.hp,
    combo: [],
    energy: 100,
    maxEnergy: 100
  };
  
  const enemy = {
    ...enemyFighter,
    currentHp: enemyFighter.hp,
    maxHp: enemyFighter.hp,
    combo: [],
    energy: 100,
    maxEnergy: 100
  };

  fightState = {
    player,
    enemy,
    isFighting: true,
    round: 1
  };

  renderFight();
  setupControls();

  setTimeout(() => {
    if (fightState.isFighting) aiTurn();
  }, 1000);
}

function renderFight() {
  const app = document.getElementById('app');
  const state = fightState;
  const p = state.player;
  const e = state.enemy;

  app.innerHTML = `
    <div class="fight-screen">
      <div class="hud">
        <div class="hp-row">
          <div class="hp-label">${p.name}</div>
          <div class="hp-bar">
            <div class="hp-fill player" style="width: ${(p.currentHp / p.maxHp) * 100}%"></div>
            <div class="hp-text">${Math.round(p.currentHp)} / ${p.maxHp}</div>
          </div>
          <div class="round">⚔️ РАУНД ${state.round}</div>
          <div class="hp-bar">
            <div class="hp-fill enemy" style="width: ${(e.currentHp / e.maxHp) * 100}%"></div>
            <div class="hp-text">${Math.round(e.currentHp)} / ${e.maxHp}</div>
          </div>
          <div class="hp-label enemy">${e.name}</div>
        </div>
        <div class="energy-row">
          <div class="energy-bar"><div class="energy-fill" style="width: ${(p.energy / p.maxEnergy) * 100}%"></div></div>
          <div class="energy-bar"><div class="energy-fill" style="width: ${(e.energy / e.maxEnergy) * 100}%"></div></div>
        </div>
      </div>

      <div class="arena" id="arena">
        <div class="fighters-display">
          <div class="fighter-card">
            <div class="name">${p.name}</div>
            <div class="weapon">⚔️ ${p.weapon}</div>
            <div class="hp-text">❤️ ${Math.round(p.currentHp)}/${p.maxHp}</div>
          </div>
          <div style="font-size: 40px;">⚔️</div>
          <div class="fighter-card">
            <div class="name">${e.name}</div>
            <div class="weapon">⚔️ ${e.weapon}</div>
            <div class="hp-text">❤️ ${Math.round(e.currentHp)}/${e.maxHp}</div>
          </div>
        </div>
        <div id="fightMessage" class="fight-message"></div>
      </div>

      <button class="menu-btn" id="menuBtn">🏠 Меню</button>

      <div class="action-buttons">
        <button class="action-btn" id="comboBtn">⚡ Комбо (X)</button>
        <button class="action-btn" id="fatalityBtn">💀 Добивание (C)</button>
      </div>

      <div class="controls-hint">
        <span><span class="key">Q</span> Джеб</span>
        <span><span class="key">W</span> Хук</span>
        <span><span class="key">E</span> Апперкот</span>
        <span><span class="key">R</span> Нога</span>
        <span><span class="key">X</span> Комбо</span>
        <span><span class="key">C</span> Добивание</span>
      </div>
    </div>
  `;

  document.getElementById('menuBtn').onclick = () => {
    document.removeEventListener('keydown', handleKeyDown);
    window.showMenu();
  };

  document.getElementById('comboBtn').onclick = () => useCombo();
  document.getElementById('fatalityBtn').onclick = () => useFatality();
}

function setupControls() {
  document.removeEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
  const key = e.key.toLowerCase();
  if (!fightState || !fightState.isFighting) return;
  if ('qwer'.includes(key)) playerHit(key);
  if (key === 'x') useCombo();
  if (key === 'c') useFatality();
}

function playerHit(key) {
  const state = fightState;
  const player = state.player;
  const enemy = state.enemy;
  
  player.combo.push(key);
  clearTimeout(player.comboTimer);
  
  player.comboTimer = setTimeout(() => {
    executePlayerCombo();
  }, 300);
  
  const move = player.moves[key];
  if (move) showMessage(`👊 ${move.name}!`);
}

function executePlayerCombo() {
  const state = fightState;
  const player = state.player;
  const enemy = state.enemy;
  
  const comboKey = player.combo.join('');
  let damage = 0;
  let moveName = '';
  
  if (player.combos && player.combos[comboKey]) {
    const combo = player.combos[comboKey];
    damage = combo.damage;
    moveName = combo.name;
  } else if (player.combo.length === 1) {
    const key = player.combo[0];
    const move = player.moves[key];
    if (move) {
      damage = move.damage;
      moveName = move.name;
    }
  }
  
  if (damage > 0) {
    const actualDamage = damage * (Math.random() > 0.8 ? 1.5 : 1);
    enemy.currentHp = Math.max(0, enemy.currentHp - actualDamage);
    showMessage(`💥 ${moveName}! -${Math.round(actualDamage)} HP`);
    updateHUD();
    
    if (enemy.currentHp <= 0) {
      enemy.currentHp = 0;
      state.isFighting = false;
      showMessage(`🏆 ПОБЕДА! Нажми C для добивания!`);
      updateHUD();
    } else {
      setTimeout(() => {
        if (state.isFighting) aiTurn();
      }, 500);
    }
  }
  player.combo = [];
}

function aiTurn() {
  const state = fightState;
  if (!state || !state.isFighting) return;
  
  const enemy = state.enemy;
  const player = state.player;
  const keys = ['q', 'w', 'e', 'r'];
  const key = keys[Math.floor(Math.random() * keys.length)];
  const move = enemy.moves[key];
  
  if (move) {
    const damage = move.damage * (Math.random() > 0.7 ? 1.5 : 1);
    player.currentHp = Math.max(0, player.currentHp - damage);
    showMessage(`💢 ${enemy.name} использует ${move.name}! -${Math.round(damage)} HP`);
    updateHUD();
    
    if (player.currentHp <= 0) {
      player.currentHp = 0;
      state.isFighting = false;
      showMessage(`💀 ВЫ НОКАУТИРОВАНЫ!`);
      updateHUD();
    } else {
      setTimeout(() => {
        if (state.isFighting) aiTurn();
      }, 800);
    }
  }
}

function useCombo() {
  const state = fightState;
  if (!state || !state.isFighting) return;
  
  const player = state.player;
  const enemy = state.enemy;
  
  if (player.energy < 30) {
    showMessage('⚠️ Недостаточно энергии!');
    return;
  }
  
  player.energy -= 30;
  const keys = Object.keys(player.combos);
  const comboKey = keys[Math.floor(Math.random() * keys.length)];
  const combo = player.combos[comboKey];
  
  if (combo) {
    const damage = combo.damage * 1.2;
    enemy.currentHp = Math.max(0, enemy.currentHp - damage);
    showMessage(`🔥 КОМБО: ${combo.name}! -${Math.round(damage)} HP`);
    updateHUD();
    
    if (enemy.currentHp <= 0) {
      enemy.currentHp = 0;
      state.isFighting = false;
      showMessage(`🏆 ПОБЕДА! Нажми C для добивания!`);
      updateHUD();
    } else {
      setTimeout(() => {
        if (state.isFighting) aiTurn();
      }, 500);
    }
  }
}

function useFatality() {
  const state = fightState;
  if (!state) return;
  
  const enemy = state.enemy;
  
  if (enemy.currentHp <= 0) {
    showMessage(`💀 ${state.player.name}: "${enemy.fatality}"`);
    state.isFighting = false;
    setTimeout(() => {
      document.removeEventListener('keydown', handleKeyDown);
      window.showMenu();
    }, 2000);
  } else {
    showMessage('⚠️ Враг ещё не нокаутирован!');
  }
}

function showMessage(text) {
  const el = document.getElementById('fightMessage');
  if (el) {
    el.style.animation = 'none';
    el.offsetHeight;
    el.textContent = text;
    el.style.animation = 'fadeMessage 1.5s forwards';
  }
}

function updateHUD() {
  const state = fightState;
  if (!state) return;
  
  const p = state.player;
  const e = state.enemy;
  
  const hpFills = document.querySelectorAll('.hp-fill');
  if (hpFills.length >= 2) {
    hpFills[0].style.width = `${(p.currentHp / p.maxHp) * 100}%`;
    hpFills[1].style.width = `${(e.currentHp / e.maxHp) * 100}%`;
  }
  
  const hpTexts = document.querySelectorAll('.hp-text');
  if (hpTexts.length >= 2) {
    hpTexts[0].textContent = `${Math.round(p.currentHp)} / ${p.maxHp}`;
    hpTexts[1].textContent = `${Math.round(e.currentHp)} / ${e.maxHp}`;
  }
}
