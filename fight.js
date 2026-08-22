/* =========================================================
   DOTA SHADOW FIGHT — FIGHT ENGINE v2
   data.js оставляем как есть.
   ========================================================= */

import { FIGHTERS } from "./data.js";

const W = 400;
const H = 700;
const FLOOR = 450;

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOut(t) {
  return t < .5
    ? 2 * t * t
    : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/* ---------------- AUDIO ---------------- */

class AudioFX {
  constructor() {
    this.ctx = null;
    this.master = .22;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  tone(freq, duration, type = "sine", volume = .08, slide = 0) {
    if (!this.ctx) return;

    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    o.type = type;
    o.frequency.setValueAtTime(freq, this.ctx.currentTime);
    if (slide) {
      o.frequency.exponentialRampToValueAtTime(
        Math.max(30, freq + slide),
        this.ctx.currentTime + duration
      );
    }

    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(
      volume * this.master,
      this.ctx.currentTime + .008
    );
    g.gain.exponentialRampToValueAtTime(
      .001,
      this.ctx.currentTime + duration
    );

    o.connect(g);
    g.connect(this.ctx.destination);

    o.start();
    o.stop(this.ctx.currentTime + duration + .02);
  }

  hit() {
    this.tone(95, .12, "sawtooth", .13, -55);
  }

  whoosh() {
    this.tone(280, .16, "triangle", .06, -220);
  }

  magic() {
    this.tone(520, .22, "sine", .07, 380);
  }

  lightning() {
    this.tone(900, .09, "sawtooth", .11, -700);
    setTimeout(() => this.tone(180, .16, "square", .08, -100), 35);
  }

  explosion() {
    this.tone(80, .3, "sawtooth", .16, -60);
  }

  critical() {
    this.tone(900, .12, "square", .08, 500);
  }
}

/* ---------------- PARTICLES ---------------- */

class Particles {
  constructor() {
    this.items = [];
  }

  burst(x, y, color, count = 16, power = 3) {
    for (let i = 0; i < count; i++) {
      const a = rnd(0, Math.PI * 2);
      const s = rnd(.8, power);

      this.items.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: rnd(.3, .8),
        max: .8,
        size: rnd(1, 4),
        color
      });
    }
  }

  update(dt) {
    for (const p of this.items) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += .08;
      p.life -= dt;
    }

    this.items = this.items.filter(p => p.life > 0);
  }

  draw(ctx) {
    for (const p of this.items) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }

    ctx.globalAlpha = 1;
  }
}

/* ---------------- LIGHTNING ---------------- */

function lightning(ctx, x1, y1, x2, y2, color, width = 2) {
  const points = [];
  const segments = 9;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;

    points.push({
      x: lerp(x1, x2, t) + (i === 0 || i === segments ? 0 : rnd(-12, 12)),
      y: lerp(y1, y2, t) + (i === 0 || i === segments ? 0 : rnd(-10, 10))
    });
  }

  ctx.save();

  ctx.shadowBlur = 15;
  ctx.shadowColor = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;

  ctx.beginPath();

  points.forEach((p, i) => {
    if (!i) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  });

  ctx.stroke();

  ctx.restore();
}

/* ---------------- FIGHTER ---------------- */

class Fighter {
  constructor(data, x, side) {
    this.data = data;
    this.x = x;
    this.baseX = x;
    this.y = FLOOR;
    this.side = side;

    this.hp = data.hp;
    this.maxHp = data.hp;
    this.energy = 120;

    this.vx = 0;
18:19
this.vy = 0;

    this.scale = 1;
    this.alpha = 1;

    this.attack = 0;
    this.hit = 0;
    this.knock = 0;
    this.invincible = 0;

    this.block = false;
    this.invisible = false;
    this.stun = 0;

    this.pose = "idle";
    this.trails = [];
  }

  damage(amount, game, color = "#fff") {
    if (this.invincible > 0 || this.block) {
      game.fx.burst(this.x, this.y - 80, "#fff", 8, 2);
      game.audio.hit();
      return;
    }

    amount *= 1 - this.data.defense / 100;
    amount = Math.max(1, Math.round(amount));

    this.hp = clamp(this.hp - amount, 0, this.maxHp);
    this.hit = .16;
    this.knock = .25;

    game.fx.burst(this.x, this.y - 70, color, 14, 3);
    game.audio.hit();
    game.shake = Math.max(game.shake, 7);

    if (this.hp <= 0) {
      game.startFatality(this);
    }
  }

  update(dt) {
    this.energy = clamp(this.energy + 1.5 * dt, 0, 120);

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= .86;

    if (this.y < FLOOR) {
      this.vy += .65;
    } else {
      this.y = FLOOR;
      this.vy = 0;
    }

    this.x = clamp(this.x, 40, 360);

    this.hit = Math.max(0, this.hit - dt);
    this.knock = Math.max(0, this.knock - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.stun = Math.max(0, this.stun - dt);

    if (this.invisible) {
      this.alpha = .15 + Math.sin(performance.now() / 100) * .05;
    } else {
      this.alpha = 1;
    }

    this.trails.push({
      x: this.x,
      y: this.y,
      alpha: this.alpha
    });

    if (this.trails.length > 8) this.trails.shift();
  }

  draw(ctx) {
    ctx.save();

    /* motion trails */

    for (let i = 0; i < this.trails.length; i++) {
      const t = this.trails[i];
      ctx.globalAlpha = (i / this.trails.length) * .13;
      this.drawSilhouette(ctx, t.x, t.y, this.scale);
    }

    ctx.globalAlpha = this.alpha;

    const squish =
      this.knock > 0 ? 1.15 :
      this.attack > 0 ? .95 : 1;

    ctx.translate(this.x, this.y);
    ctx.scale(this.side * squish, 1 / squish);

    this.drawSilhouette(ctx, 0, 0, this.scale);

    ctx.restore();
  }

  drawSilhouette(ctx, x, y, scale = 1) {
    const c = this.data.color || "#fff";

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    ctx.shadowBlur = 10;
    ctx.shadowColor = c;

    /* legs */

    ctx.fillStyle = "#08090c";

    ctx.beginPath();
    ctx.moveTo(-12, -7);
    ctx.lineTo(-7, -62);
    ctx.lineTo(-1, -62);
    ctx.lineTo(-2, -7);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(2, -7);
    ctx.lineTo(7, -62);
    ctx.lineTo(13, -62);
    ctx.lineTo(16, -7);
    ctx.closePath();
    ctx.fill();

    /* torso */

    ctx.beginPath();
    ctx.ellipse(0, -91, 23, 39, 0, 0, Math.PI * 2);
    ctx.fill();

    /* head */

    ctx.beginPath();
    ctx.arc(0, -135, 17, 0, Math.PI * 2);
    ctx.fill();

    /* shoulder glow */

    ctx.strokeStyle = c;
    ctx.lineWidth = 2;
    ctx.globalAlpha *= .7;

    ctx.beginPath();
    ctx.arc(0, -95, 27, Math.PI * .15, Math.PI * .85);
    ctx.stroke();

    /* arms */

    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#07080a";
    ctx.lineWidth = 10;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(-18, -112);
    ctx.lineTo(-38, -80);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(18, -112);
    ctx.lineTo(38, -80);
    ctx.stroke();

    ctx.restore();
  }
}

/* =========================================================
   ANIMATION SYSTEM
   ========================================================= */

class Animation {
  constructor(name, duration, update, done = null) {
    this.name = name;
    this.duration = duration;
    this.time = 0;
    this.updateFn = update;
    this.done = done;
  }

  update(dt, game) {
    this.time += dt;

    const p = clamp(this.time / this.duration, 0, 1);

    this.updateFn(p, game, this);

    if (p >= 1) {
      if (this.done) this.done(game);
      return true;
    }

    return false;
  }
}
18:19
/* =========================================================
   SKILL ANIMATION FACTORY
   ========================================================= */

function playSkill(game, fighter, enemy, slot) {
  const id = fighter.data.id;

  const handlers = {

    sniper: sniperSkill,
    pudge: pudgeSkill,
    "shadow-fiend": shadowSkill,
    techies: techiesSkill,
    juggernaut: juggerSkill,
    "crystal-maiden": maidenSkill,
    zeus: zeusSkill,
    "anti-mage": antiMageSkill,
    lina: linaSkill,
    invoker: invokerSkill,
    "void-spirit": voidSkill,
    clinkz: clinkzSkill,
    zemelya: zemelyaSkill,
    nyx: nyxSkill,
    storm: stormSkill
  };

  const fn = handlers[id];

  if (fn) fn(game, fighter, enemy, slot);
}

/* ---------------- SNIPER ---------------- */

function sniperSkill(g, f, e, s) {
  if (s === 0) {
    g.animation = new Animation("sniper-shot", .55, (p, game) => {

      if (p < .35) {
        f.pose = "aim";
      }

      if (p > .35 && !game.animationFired) {
        game.animationFired = true;

        game.audio.tone(1200, .08, "square", .12, -900);

        game.projectile({
          x: f.x,
          y: f.y - 125,
          tx: e.x,
          ty: e.y - 90,
          color: "#ffd700",
          speed: 14,
          damage: 25
        });
      }

      if (p > .6) f.pose = "idle";

    }, () => {
      g.animationFired = false;
    });
  }

  if (s === 1) {
    g.animation = new Animation("sniper-roll", .65, (p) => {
      f.vx = f.side * -5 * Math.sin(p * Math.PI);
      f.vy = -3 * Math.sin(p * Math.PI);
      f.invincible = .08;
    });
  }

  if (s === 2) {
    g.animation = new Animation("sniper-stance", 1, (p) => {
      f.scale = 1 + Math.sin(p * Math.PI) * .08;
      f.pose = "aim";
    }, () => {
      f.scale = 1;
      f.pose = "idle";
    });
  }

  if (s === 3) {
    g.animation = new Animation("sniper-duet", 1.6, (p, game) => {
      const shot = Math.floor(p * 6);

      if (shot !== game.lastShot) {
        game.lastShot = shot;

        if (shot > 0) {
          game.audio.tone(1050, .06, "square", .08);
          game.projectile({
            x: f.x + f.side * 20,
            y: f.y - 120,
            tx: e.x,
            ty: e.y - 80,
            color: "#ffd700",
            speed: 16,
            damage: 10
          });
        }
      }
    }, () => {
      g.lastShot = -1;
    });
  }
}

/* ---------------- PUDGE ---------------- */

function pudgeSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("hook", .8, (p, game) => {

      const endX = e.x;

      const hx = lerp(f.x, endX, easeOut(p));

      game.lineEffect(
        f.x,
        f.y - 100,
        hx,
        e.y - 100,
        "#74ff8a",
        5
      );

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;

        e.vx = (f.x - e.x) * .08;
        e.damage(30, game, "#74ff8a");
      }

    }, () => {
      g.animationFired = false;
    });
  }

  if (s === 1) {
    g.animation = new Animation("fat-rush", .7, (p) => {
      f.vx = f.side * 8 * Math.sin(p * Math.PI);
    });
  }

  if (s === 2) {
    g.animation = new Animation("feast", 2, (p, game) => {
      f.scale = 1 + Math.sin(p * Math.PI) * .15;
      game.aura(f.x, f.y - 80, 55, "#00ff88", p);
    }, () => f.scale = 1);
  }

  if (s === 3) {
    g.animation = new Animation("death-chain", 1.5, (p, game) => {
      game.lineEffect(
        f.x,
        f.y - 90,
        e.x,
        e.y - 90,
        "#00ff88",
        8
      );

      e.vx *= .85;

      if (p > .5 && !game.animationFired) {
        game.animationFired = true;
        e.damage(50, game, "#00ff88");
      }

    }, () => {
      g.animationFired = false;
    });
  }
}

/* ---------------- SHADOW FIEND ---------------- */

function shadowSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("shadow-blade", .8, (p, game) => {
      game.shadowSlash(f.x, f.y - 100, e.x, e.y - 90, "#9b59b6", p);
18:20
if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.damage(25, game, "#9b59b6");
      }
    }, () => g.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("shadow-step", 1.5, (p, game) => {
      f.alpha = p < .5 ? 1 - p * 2 : (p - .5) * 2;
      f.invisible = true;

      if (p > .5 && !game.animationFired) {
        f.x = e.x - f.side * 55;
        game.animationFired = true;
      }
    }, () => {
      f.invisible = false;
      f.alpha = 1;
      g.animationFired = false;
    });
  }

  if (s === 2) {
    g.animation = new Animation("shadow-swarm", 1.2, (p, game) => {
      for (let i = 0; i < 4; i++) {
        const a = p * 9 + i * Math.PI / 2;
        const x = e.x + Math.cos(a) * 45;
        const y = e.y - 90 + Math.sin(a) * 35;

        game.shadowSlash(f.x, f.y - 90, x, y, "#9b59b6", .8);
      }

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;
        e.damage(32, game, "#9b59b6");
      }
    }, () => g.animationFired = false);
  }

  if (s === 3) {
    g.animation = new Animation("dark-blade", .9, (p, game) => {
      game.shadowSlash(
        f.x,
        f.y - 100,
        e.x,
        e.y - 90,
        "#b56cff",
        p
      );

      if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.vx = f.side * 8;
        e.damage(60, game, "#b56cff");
      }
    }, () => g.animationFired = false);
  }
}

/* ---------------- TECHIES ---------------- */

function techiesSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = projectileSkill(g, f, e, "#ff6b6b", 25, "knife");
  }

  if (s === 1) {
    g.animation = new Animation("boost", .8, (p, game) => {
      f.vx = f.side * 7 * Math.sin(p * Math.PI);
      game.fireTrail(f.x, f.y - 80, "#ff6b6b");
    });
  }

  if (s === 2) {
    g.animation = new Animation("rocket-pack", 1, (p, game) => {
      f.y = FLOOR - Math.sin(p * Math.PI) * 100;
      game.fireTrail(f.x, f.y, "#ff6b6b");

      if (p > .8 && !game.animationFired) {
        game.animationFired = true;
        e.damage(30, game, "#ff6b6b");
        game.explosion(e.x, e.y - 40, "#ff6b6b");
      }
    }, () => {
      f.y = FLOOR;
      g.animationFired = false;
    });
  }

  if (s === 3) {
    g.animation = new Animation("mine", 1, (p, game) => {
      game.mine(f.x, FLOOR, p);

      if (p > .8) {
        game.explosion(e.x, FLOOR - 20, "#ff4f4f");
        e.damage(70, game, "#ff4f4f");
      }
    });
  }
}

/* ---------------- JUGGERNAUT ---------------- */

function juggerSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("blade-spin", 1.2, (p, game) => {
      f.vx = f.side * 2.5;
      game.bladeArc(f.x, f.y - 100, 65, p, "#4ecdc4");

      if (p > .5 && !game.animationFired) {
        game.animationFired = true;
        e.damage(20, game, "#4ecdc4");
      }
    }, () => g.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("battle-cry", .8, (p, game) => {
      game.shockwave(f.x, f.y - 70, p, "#4ecdc4");
    });
  }

  if (s === 2) {
    g.animation = new Animation("steel-block", .6, (p) => {
      f.block = true;
      f.invincible = .65;
    }, () => f.block = false);
  }

  if (s === 3) {
    g.animation = new Animation("death-dance", 1.5, (p, game) => {
      const n = Math.floor(p * 5);

      if (n !== game.lastHit) {
        game.lastHit = n;

        if (n > 0) {
          f.x = e.x - f.side * 55;
          e.damage(13, game, "#4ecdc4");
          game.bladeArc(e.x, e.y - 90, 55, n / 5, "#4ecdc4");
        }
      }
    }, () => game.lastHit = -1);
  }
}

/* ---------------- CRYSTAL MAIDEN ---------------- */

function maidenSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = projectileSkill(g, f, e, "#45b7d1", 20, "ice");
  }

  if (s === 1) {
    g.animation = new Animation("frost-wind", 1, (p, game) => {
      game.vortex(e.x, e.y - 80, 70 * p, "#45b7d1");

      if (p > .65 && !game.animationFired) {
18:20
game.animationFired = true;
        e.damage(8, game, "#45b7d1");
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("crystal-shield", 1, (p, game) => {
      f.invincible = .1;
      game.crystalShield(f.x, f.y - 85, p);
    });
  }

  if (s === 3) {
    g.animation = new Animation("arctic", 2, (p, game) => {
      game.vortex(e.x, e.y - 80, 100, "#45b7d1");

      if (p > .7 && !game.animationFired) {
        game.animationFired = true;
        e.damage(60, game, "#45b7d1");
        game.freeze(e);
        game.explosion(e.x, e.y - 80, "#45b7d1");
      }
    }, () => game.animationFired = false);
  }
}

/* ---------------- ZEUS ---------------- */

function zeusSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("fate-chain", 1, (p, game) => {
      game.lineEffect(
        f.x,
        f.y - 115,
        e.x,
        e.y - 100,
        "#ffeaa7",
        3
      );

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.damage(25, game, "#ffeaa7");
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("lightning-ring", 1, (p, game) => {
      game.lightningRing(e.x, e.y - 70, 75 * p, "#ffeaa7");

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;
        e.damage(35, game, "#ffeaa7");
        game.audio.lightning();
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("divine-jump", 1, (p, game) => {
      f.y = FLOOR - Math.sin(p * Math.PI) * 130;
      game.lightning(f.x, 100, f.x, f.y - 50, "#ffeaa7");
    });
  }

  if (s === 3) {
    g.animation = new Animation("heaven-judgment", 2.3, (p, game) => {

      for (let i = 0; i < 3; i++) {
        const start = i / 3;

        if (p > start) {
          const q = clamp((p - start) * 5, 0, 1);

          game.lightning(
            e.x + rnd(-25, 25),
            90,
            e.x + rnd(-8, 8),
            e.y - 20,
            "#ffeaa7",
            4
          );

          if (q > .8 && !game.zaps?.[i]) {
            game.zaps = game.zaps || {};
            game.zaps[i] = true;

            e.damage(25, game, "#ffeaa7");
            game.audio.lightning();
            game.shake = 12;
          }
        }
      }

    }, () => game.zaps = {});
  }
}

/* ---------------- ANTI MAGE ---------------- */

function antiMageSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("mana-blade", .6, (p, game) => {
      game.bladeArc(e.x, e.y - 90, 45, p, "#96ceb4");

      if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.energy = clamp(e.energy - 20, 0, 120);
        e.damage(25, game, "#96ceb4");
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("blink", .5, (p) => {
      if (p > .45) {
        f.x = e.x - f.side * 50;
        f.invincible = .2;
      }
    });
  }

  if (s === 2) {
    g.animation = new Animation("counterspell", 1, (p, game) => {
      f.invincible = .1;
      game.aura(f.x, f.y - 90, 50, "#96ceb4", p);
    });
  }

  if (s === 3) {
    g.animation = new Animation("mana-void", 1.4, (p, game) => {
      game.vortex(e.x, e.y - 80, 90 * p, "#96ceb4");

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;

        const missing = 120 - e.energy;
        e.energy = 0;
        e.damage(missing * 2, game, "#96ceb4");
      }
    }, () => game.animationFired = false);
  }
}

/* ---------------- LINA ---------------- */

function linaSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("fire-wave", 1, (p, game) => {
      game.fireWave(f.x, f.y - 40, e.x, "#ff6b6b", p);

      if (p > .7 && !game.animationFired) {
        game.animationFired = true;
        e.damage(30, game, "#ff6b6b");
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
18:20
g.animation = new Animation("fire-cage", 1.4, (p, game) => {
      game.fireCage(e.x, e.y - 80, p);

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;
        e.stun = 2;
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("rage-sparks", 1, (p, game) => {
      game.aura(f.x, f.y - 90, 45 + p * 15, "#ff6b6b", p);
    });
  }

  if (s === 3) {
    g.animation = new Animation("laser", 1.3, (p, game) => {
      game.laser(
        f.x,
        f.y - 105,
        e.x,
        e.y - 90,
        "#ff5533",
        p
      );

      if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.damage(70, game, "#ff5533");
        game.shake = 15;
      }
    }, () => game.animationFired = false);
  }
}

/* ---------------- INVOKER ---------------- */

function invokerSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = projectileSkill(g, f, e, "#dda0dd", 20, "ice");
  }

  if (s === 1) {
    g.animation = new Animation("tornado", 1.1, (p, game) => {
      game.vortex(e.x, e.y - 80, 45 + p * 30, "#dda0dd");

      if (p > .7 && !game.animationFired) {
        game.animationFired = true;
        e.vx = f.side * 7;
        e.damage(8, game, "#dda0dd");
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("fire-shield", 1, (p, game) => {
      game.aura(f.x, f.y - 85, 48, "#ff7b3d", p);
      f.invincible = .1;
    });
  }

  if (s === 3) {
    g.animation = new Animation("element-seal", 2, (p, game) => {
      game.elementCircle(e.x, e.y - 80, 80 * p);

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;
        e.damage(65, game, "#dda0dd");
        game.explosion(e.x, e.y - 80, "#dda0dd");
      }
    }, () => game.animationFired = false);
  }
}

/* ---------------- VOID ---------------- */

function voidSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("void-hit", .8, (p, game) => {
      game.rift(e.x, e.y - 90, 45 * p, "#8e44ad");

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.x += f.side * 50;
        e.damage(25, game, "#8e44ad");
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("rift-dash", .8, (p, game) => {
      f.x = lerp(f.x, e.x + f.side * 80, easeOut(p));
      game.rift(f.x, f.y - 80, 35, "#8e44ad");

      if (p > .7 && !game.animationFired) {
        game.animationFired = true;
        e.damage(12, game, "#8e44ad");
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("void-armor", 1, (p, game) => {
      f.invincible = .1;
      game.aura(f.x, f.y - 90, 50, "#8e44ad", p);
    });
  }

  if (s === 3) {
    g.animation = new Animation("fear-dimension", 2, (p, game) => {
      game.rift(e.x, e.y - 80, 100 * p, "#8e44ad");

      e.alpha = .25;

      if (p > .7 && !game.animationFired) {
        game.animationFired = true;
        e.stun = 2;
        e.damage(60, game, "#8e44ad");
      }
    }, () => {
      e.alpha = 1;
      game.animationFired = false;
    });
  }
}

/* ---------------- CLINKZ ---------------- */

function clinkzSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = projectileSkill(g, f, e, "#f39c12", 25, "fire-arrow");
  }

  if (s === 1) {
    g.animation = new Animation("shadow-step", 1.3, (p, game) => {
      f.invisible = true;
      f.alpha = .15;

      if (p > .55 && !game.animationFired) {
        f.x = e.x - f.side * 65;
        game.animationFired = true;
      }

      game.smoke(f.x, f.y - 70);
    }, () => {
      f.invisible = false;
      f.alpha = 1;
      game.animationFired = false;
    });
  }

  if (s === 2) {
    g.animation = projectileSkill(g, f, e, "#74ff5b", 0, "poison");
  }

  if (s === 3) {
    g.animation = new Animation("death-volley", 1.7, (p, game) => {
      const n = Math.floor(p * 3);
18:20
if (n !== game.lastArrow) {
        game.lastArrow = n;

        game.projectile({
          x: f.x,
          y: f.y - 120,
          tx: e.x + rnd(-15, 15),
          ty: e.y - 90,
          color: "#f39c12",
          speed: 11,
          damage: 20
        });
      }
    }, () => game.lastArrow = -1);
  }
}

/* ---------------- ZEMELYA ---------------- */

function zemelyaSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("stone-fist", .75, (p, game) => {
      game.groundCrack(e.x, FLOOR, p, "#8b4513");

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.vx = f.side * 6;
        e.damage(30, game, "#8b4513");
        game.shake = 8;
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("earthquake", 1.5, (p, game) => {
      game.groundCrack(f.x, FLOOR, p, "#8b4513");
      game.shockwave(f.x, FLOOR - 10, p, "#8b4513");

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.stun = 2;
        e.damage(10, game, "#8b4513");
      }
    }, () => game.animationFired = false);
  }

  if (s === 2) {
    g.animation = new Animation("stone-skin", 1, (p, game) => {
      f.invincible = .1;
      game.stoneArmor(f.x, f.y - 90, p);
    });
  }

  if (s === 3) {
    g.animation = new Animation("earth-rage", 1.8, (p, game) => {
      game.groundWave(f.x, e.x, FLOOR, "#8b4513", p);

      if (p > .65 && !game.animationFired) {
        game.animationFired = true;

        e.vy = -12;
        e.damage(65, game, "#8b4513");
        game.shake = 15;
      }
    }, () => game.animationFired = false);
  }
}

/* ---------------- NYX ---------------- */

function nyxSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("shadow-stab", .7, (p, game) => {

      f.x = lerp(f.x, e.x - f.side * 45, easeOut(p));

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.damage(35, game, "#2c3e50");
      }
    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("nyx-invis", 1.5, (p, game) => {
      f.invisible = true;
      f.alpha = .1;
      game.smoke(f.x, f.y - 60);
    }, () => {
      f.invisible = false;
      f.alpha = 1;
    });
  }

  if (s === 2) {
    g.animation = new Animation("poison-sting", .8, (p, game) => {
      game.bladeArc(e.x, e.y - 90, 40, p, "#71ff8a");

      if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.damage(8, game, "#71ff8a");
      }
    }, () => game.animationFired = false);
  }

  if (s === 3) {
    g.animation = new Animation("deadly-bite", 1, (p, game) => {

      game.shadowSlash(
        f.x,
        f.y - 100,
        e.x,
        e.y - 90,
        "#2c3e50",
        p
      );

      if (p > .55 && !game.animationFired) {
        game.animationFired = true;
        e.damage(70, game, "#2c3e50");
        game.shake = 14;
      }

    }, () => game.animationFired = false);
  }
}

/* ---------------- STORM ---------------- */

function stormSkill(g, f, e, s) {

  if (s === 0) {
    g.animation = new Animation("electric-bolt", .9, (p, game) => {

      lightning(
        game.ctx,
        f.x,
        f.y - 110,
        e.x,
        e.y - 90,
        "#00bfff",
        4
      );

      if (p > .6 && !game.animationFired) {
        game.animationFired = true;
        e.damage(25, game, "#00bfff");
        game.audio.lightning();
      }

    }, () => game.animationFired = false);
  }

  if (s === 1) {
    g.animation = new Animation("storm-flight", 1, (p, game) => {
      f.x = lerp(f.x, e.x - f.side * 80, easeOut(p));
      game.lightning(f.x, 100, f.x, f.y - 50, "#00bfff", 3);
      f.invincible = .1;
    });
  }

  if (s === 2) {
    g.animation = new Animation("charged-shield", 1, (p, game) => {
      game.lightningRing(f.x, f.y - 85, 45, "#00bfff");
      f.invincible = .1;
    });
  }

  if (s === 3) {
