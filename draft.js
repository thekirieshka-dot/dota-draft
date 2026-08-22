/*
  БИТВА ДРАФТОВ
  Именно:
  TEAM 1: 7 BAN + 5 PICK
  TEAM 2: 7 BAN + 5 PICK
  Это НЕ 10 банов.
  Используется Captain's Mode-подобная последовательность.
*/

export function startDraft(app, menu, audio) {
  let heroes = [];
  const state = {
    step: 0,
    bans: [],
    team1: [],
    team2: []
  };

  /*
    7 банов каждой команды
    + 5 пиков каждой команды.
    Всего: 14 BAN + 10 PICK
  */
  const order = [
    // BAN PHASE 1
    ["ban", 1],
    ["ban", 1],
    ["ban", 2],
    ["ban", 2],
    ["ban", 1],
    ["ban", 2],
    ["ban", 2],
    // PICKS
    ["pick", 1],
    ["pick", 2],
    // BAN PHASE 2
    ["ban", 1],
    ["ban", 1],
    ["ban", 2],
    ["ban", 2],
    // PICKS
    ["pick", 2],
    ["pick", 1],
    ["pick", 1],
    ["pick", 2],
    // BAN PHASE 3
    ["ban", 1],
    ["ban", 2],
    ["ban", 1],
    ["ban", 2],
    // FINAL PICKS
    ["pick", 1],
    ["pick", 2]
  ];

  function heroImage(hero) {
    const name = hero.name.replace("npc_dota_hero_", "");
    return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${name}.png`.replace(/\s+/g, "");
  }

  function render() {
    app.innerHTML = `
      <main class="draft">
        <div class="topbar">
          <button class="back" id="back">←</button>
          <div class="logo">БИТВА ДРАФТОВ</div>
          <div></div>
        </div>
        <div class="draft-status" id="draftStatus"></div>
        <div class="teams">
          <div class="team team-red">
            <div class="team-name">
              <span>🔴 TEAM 1</span>
              <span>${state.team1.length}/5</span>
            </div>
            <div class="pick-grid" id="team1"></div>
          </div>
          <div class="team team-blue">
            <div class="team-name">
              <span>🔵 TEAM 2</span>
              <span>${state.team2.length}/5</span>
            </div>
            <div class="pick-grid" id="team2"></div>
          </div>
        </div>
        <div class="bans">
          <div class="ban-title">🚫 БАНЫ: ${state.bans.length}/14 (7 + 7)</div>
          <div class="ban-list" id="banList"></div>
        </div>
        <input class="search" id="search" placeholder="🔎 Поиск героя...">
        <div class="hero-grid" id="heroGrid"></div>
      </main>
    `;

    document.getElementById("back").onclick = menu;
    document.getElementById("search").oninput = drawHeroes;
    draw();
  }

  function draw() {
    const current = order[state.step];
    const status = document.getElementById("draftStatus");

    if (!current) {
      status.innerHTML = `<div class="draft-phase">🏆 ДРАФТ ЗАВЕРШЁН</div>`;
    } else {
      const type = current[0];
      const team = current[1];
      status.innerHTML = `
        <div class="draft-phase">${type === "ban" ? "🚫 БАН" : "🎯 ПИК"}</div>
        <div class="draft-turn">Ход команды ${team} • Шаг ${state.step + 1} / ${order.length}</div>
      `;
    }

    drawTeams();
    drawBans();
    drawHeroes();
  }

  function drawTeams() {
    const team1 = document.getElementById("team1");
    const team2 = document.getElementById("team2");
    team1.innerHTML = createSlots(state.team1);
    team2.innerHTML = createSlots(state.team2);
  }

  function createSlots(list) {
    let html = "";
    for (let i = 0; i < 5; i++) {
      const id = list[i];
      const hero = heroes.find(h => h.id === id);
      html += `
        <div class="pick-slot">
          ${hero ? `<img src="${heroImage(hero)}"><span>${hero.localized_name}</span>` : ""}
        </div>
      `;
    }
    return html;
  }

  function drawBans() {
    const container = document.getElementById("banList");
    container.innerHTML = state.bans.map(id => {
      const hero = heroes.find(h => h.id === id);
      return `<div class="ban-slot"><img src="${heroImage(hero)}"></div>`;
    }).join("");
  }

  function drawHeroes() {
    const container = document.getElementById("heroGrid");
    const query = (document.getElementById("search")?.value || "").toLowerCase();
    const used = new Set([...state.bans, ...state.team1, ...state.team2]);

    container.innerHTML = "";
    heroes
      .filter(hero => {
        if (!query) return true;
        return hero.localized_name.toLowerCase().includes(query);
      })
      .forEach(hero => {
        const button = document.createElement("button");
        button.className = "hero-card";
        if (used.has(hero.id)) button.classList.add("used");
        button.innerHTML = `
          <img loading="lazy" src="${heroImage(hero)}">
          <b>${hero.localized_name}</b>
        `;
        if (!used.has(hero.id)) {
          button.onclick = () => choose(hero.id);
        }
        container.appendChild(button);
      });
  }

  function choose(id) {
    const current = order[state.step];
    if (!current) return;

    const type = current[0];
    const team = current[1];

    if (type === "ban") {
      state.bans.push(id);
    } else {
      if (team === 1) {
        if (state.team1.length < 5) state.team1.push(id);
      } else {
        if (state.team2.length < 5) state.team2.push(id);
      }
    }

    audio.skill();
    state.step++;

    if (state.step >= order.length) {
      finish();
      return;
    }

    draw();
  }

  function calculateTeamPower(list) {
    return list.reduce((total, id) => {
      const hero = heroes.find(h => h.id === id);
      if (!hero) return total;
      // Упрощённая оценка силы драфта
      const attack = hero.attack_type === "Ranged" ? 8 : 6;
      const durability = hero.base_str;
      const utility = hero.base_int;
      return total + attack + durability + utility;
    }, 0);
  }

  function finish() {
    const power1 = calculateTeamPower(state.team1);
    const power2 = calculateTeamPower(state.team2);
    let winner;
    if (power1 > power2) winner = "🔴 TEAM 1";
    else if (power2 > power1) winner = "🔵 TEAM 2";
    else winner = "🤝 НИЧЬЯ";

    audio.knockout();

    const result = document.createElement("div");
    result.className = "result";
    result.innerHTML = `
      <div class="result-box">
        <h1>🏆 ДРАФТ ГОТОВ</h1>
        <p>Team 1: <b>${power1}</b></p>
        <p>Team 2: <b>${power2}</b></p>
        <h2>${winner}</h2>
        <button class="primary" id="again">Новый драфт</button>
        <button id="menu">Меню</button>
      </div>
    `;
    app.appendChild(result);

    document.getElementById("again").onclick = () => {
      result.remove();
      state.step = 0;
      state.bans = [];
      state.team1 = [];
      state.team2 = [];
      draw();
    };

    document.getElementById("menu").onclick = menu;
  }

  // Загружаем ПОЛНЫЙ ростер через OpenDota API
  fetch("https://api.opendota.com/api/heroStats")
    .then(response => {
      if (!response.ok) throw new Error("OpenDota error");
      return response.json();
    })
    .then(data => {
      heroes = data.sort((a, b) => a.localized_name.localeCompare(b.localized_name));
      render();
    })
    .catch(error => {
      console.error(error);
      app.innerHTML = `
        <main class="screen">
          <div class="result">
            <div class="result-box">
              <h2>Не удалось загрузить ростер</h2>
              <p>Для драфта нужен интернет, потому что герои и их иконки загружаются автоматически.</p>
              <button id="back">Назад</button>
            </div>
          </div>
        </main>
      `;
      document.getElementById("back").onclick = menu;
    });
}
