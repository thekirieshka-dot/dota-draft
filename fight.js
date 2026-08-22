// fight.js - движок боя
export function startFight(app, menu, audio, playerFighter, enemyFighter) {
  // Состояние боя
  const state = {
    player: {
      ...playerFighter,
      currentHp: playerFighter.hp,
      maxHp: playerFighter.hp,
      combo: [],
      block: false,
      isDown: false
    },
    enemy: {
      ...enemyFighter,
      currentHp: enemyFighter.hp,
      maxHp: enemyFighter.hp,
      combo: [],
      block: false,
      isDown: false
    },
    round: 1,
    timer: 60,
    isFighting: true
  };

  // Отрисовка интерфейса
  renderFight(state, app);

  // Обработка клавиш
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    
    // Удары (Q W E R)
    if ('qwer'.includes(key) && state.isFighting) {
      handleHit(state, key);
    }
    
    // Движение (A S D)
    if ('asd'.includes(key)) {
      handleMovement(state, key);
    }
    
    // Спецприёмы (Z X C)
    if (key === 'z') state.player.block = true;
    if (key === 'x') useCombo(state);
    if (key === 'c') useFatality(state);
  });

  document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'z') state.player.block = false;
  });
}

function handleHit(state, key) {
  const player = state.player;
  const enemy = state.enemy;
  
  // Добавляем в комбо
  player.combo.push(key);
  clearTimeout(player.comboTimer);
  
  // Выполняем комбо через 0.3с
  player.comboTimer = setTimeout(() => {
    executeCombo(player, enemy);
    player.combo = [];
  }, 300);
}

function executeCombo(player, enemy) {
  const comboKey = player.combo.join('');
  const move = player.moves.combo[comboKey];
  
  if (move) {
    // Сложное комбо
    const damage = move.damage * (enemy.block ? 0.5 : 1);
    enemy.currentHp -= damage;
    showFightMessage(`💥 ${move.name}! -${damage} HP`);
    audio.hit();
  } else if (player.combo.length === 1) {
    // Одиночный удар
    const moveData = player.moves[player.combo[0]];
    if (moveData) {
      const damage = moveData.damage * (enemy.block ? 0.5 : 1);
      enemy.currentHp -= damage;
      showFightMessage(`👊 ${moveData.name}! -${damage} HP`);
      audio.hit();
    }
  }
  
  // Проверка нокаута
  if (enemy.currentHp <= 0) {
    enemy.currentHp = 0;
    state.isFighting = false;
    showFightMessage(`🏆 ПОБЕДА! Нажмите C для добивания`);
  }
  
  updateUI(state);
}
