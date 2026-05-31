const W = 256;
const H = 240;
const FIELD_TOP = 14;
const UI_TOP = 137;
const COLORS = {
  black: "#000000",
  navy: "#002E98",
  blue: "#0064F4",
  sky: "#4AA5FF",
  cyan: "#2BC9D0",
  white: "#FFFFFF",
  silver: "#ABABAB",
  darkSilver: "#4B4B4B",
  gold: "#F8D6A8",
  yellow: "#E2E095",
  green: "#359000",
  lightGreen: "#7BD200",
  red: "#CF231C",
  ruby: "#FF52C5",
  purple: "#B362FF",
  lavender: "#CCD2FF",
  stone: "#626262",
  darkStone: "#3B3600"
};

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const assets = {
  units: image("./assets/units_preview_32.png"),
  battle: image("./assets/battle_mock.png"),
  font: image("./assets/misaki_4x8.png"),
  fontJp: image("./assets/font_tiles_jp.png")
};
const fontCache = new Map();
const JP_FONT_CHARS = "時刻資金部隊混沌味方敵戦魔法待機退却詠唱回復行動接触指揮勝利敗北撤前衛後白黒剣士騎道う失敗防御選択攻撃";

function image(src) {
  const img = new Image();
  img.src = src;
  return img;
}

class Input {
  constructor() {
    this.keys = new Set();
    this.prev = new Set();
    this.edges = new Set();
    addEventListener("keydown", (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "z", "x", "Enter", "Backspace", " "].includes(e.key)) e.preventDefault();
      if (!this.keys.has(e.key)) this.edges.add(e.key);
      this.keys.add(e.key);
    });
    addEventListener("keyup", (e) => this.keys.delete(e.key));
  }
  beginFrame() {
    this.state = {
      up: this.keys.has("ArrowUp"),
      down: this.keys.has("ArrowDown"),
      left: this.keys.has("ArrowLeft"),
      right: this.keys.has("ArrowRight"),
      a: this.keys.has("z") || this.keys.has("Enter"),
      b: this.keys.has("x") || this.keys.has("Backspace"),
      start: this.keys.has(" "),
      select: this.keys.has("Shift")
    };
    this.edgeState = {
      up: this.edges.has("ArrowUp"),
      down: this.edges.has("ArrowDown"),
      left: this.edges.has("ArrowLeft"),
      right: this.edges.has("ArrowRight"),
      a: this.edges.has("z") || this.edges.has("Enter"),
      b: this.edges.has("x") || this.edges.has("Backspace"),
      start: this.edges.has(" "),
      select: this.edges.has("Shift")
    };
  }
  endFrame() {
    this.prev = new Set(Object.entries(this.state).filter(([, v]) => v).map(([k]) => k));
    this.edges.clear();
  }
  pressed(btn) {
    return this.edgeState[btn] || (this.state[btn] && !this.prev.has(btn));
  }
  get up() { return this.state.up; }
  get down() { return this.state.down; }
  get left() { return this.state.left; }
  get right() { return this.state.right; }
}

class Game {
  constructor() {
    this.mode = "map";
    this.command = 0;
    this.selectedNode = 1;
    this.time = 0;
    this.funds = 2840;
    this.chaos = 62;
    this.cast = 0.42;
    this.healCast = 0;
    this.message = "接触 指揮";
    this.resetBattle();
  }
  resetBattle() {
    this.cast = 0.42;
    this.healCast = 0;
    this.allies = [
      unit("warrior", "戦士", 62, 91, 148, 180, 16),
      unit("knight", "騎士", 86, 96, 136, 160, 12),
      unit("white", "白魔道士", 38, 72, 110, 120, 3)
    ];
    this.enemies = [
      unit("goblin1", "GOBLIN", 164, 82, 76, 76, 13),
      unit("goblin2", "GOBLIN", 181, 102, 76, 76, 13),
      unit("mage", "MAGICIAN", 209, 84, 90, 90, 0)
    ];
  }
  update(input, dt) {
    this.time += dt;
    if (input.pressed("start")) this.message = this.mode === "battle" ? "行動指揮" : "部隊選択";
    if (this.mode === "map") return this.updateMap(input);
    if (this.mode === "result") {
      if (input.pressed("a")) {
        this.mode = "map";
        this.message = "勝利";
        this.resetBattle();
      }
      return;
    }
    this.updateBattle(input, dt);
  }
  updateMap(input) {
    if (input.pressed("left") || input.pressed("up")) this.selectedNode = Math.max(0, this.selectedNode - 1);
    if (input.pressed("right") || input.pressed("down")) this.selectedNode = Math.min(2, this.selectedNode + 1);
    if (input.pressed("a")) {
      this.mode = "battle";
      this.message = "接触 指揮";
    }
  }
  updateBattle(input, dt) {
    const commands = ["FIGHT", "MAGIC", "WAIT", "RETREAT"];
    if (input.pressed("up")) this.command = (this.command + 3) % 4;
    if (input.pressed("down")) this.command = (this.command + 1) % 4;
    if (input.pressed("a")) this.message = this.applyCommand(commands[this.command]);

    const speed = input.up || input.down ? 0.55 : 1;
    const allies = this.allies.filter((u) => u.alive);
    const enemies = this.enemies.filter((u) => u.alive);
    if (!enemies.length || !allies.length) return this.finish(enemies.length ? "DEFEAT" : "VICTORY");

    for (const ally of allies) {
      ally.timer += dt * speed * (commands[this.command] === "WAIT" ? 0.6 : 1);
      if (ally.timer >= 1) {
        ally.timer = 0;
        if (ally.id === "white") {
          this.healCast = Math.min(1, this.healCast + 0.34);
          if (this.healCast >= 1) this.resolveHeal();
        } else {
          const target = this.enemies.find((u) => u.alive);
          if (target) {
            target.hp = Math.max(0, target.hp - ally.atk - (commands[this.command] === "FIGHT" ? 4 : 0));
            if (!target.hp) {
              target.alive = false;
              this.message = `${target.cls} DOWN`;
            }
          }
        }
      }
    }
    for (const enemy of enemies) {
      enemy.timer += dt * speed;
      if (enemy.id === "mage") {
        this.cast += dt * 0.09 * speed;
        if (this.cast >= 1) this.resolveEnemyMagic();
      } else if (enemy.timer >= 1.1) {
        enemy.timer = 0;
        this.damageFrontline(enemy.atk, commands[this.command]);
      }
    }
  }
  applyCommand(command) {
    if (command === "MAGIC") {
      this.healCast = Math.min(1, this.healCast + 0.28);
      return "回復詠唱";
    }
    if (command === "WAIT") return "待機 防御";
    if (command === "RETREAT") {
      if (this.time % 1 > 0.35) {
        this.funds = Math.max(0, this.funds - 80);
        this.chaos = Math.max(0, this.chaos - 2);
        this.finish("RETREATED");
        return "退却";
      }
      return "退却失敗";
    }
    return "前衛攻撃";
  }
  resolveHeal() {
    this.healCast = 0;
    const target = this.allies.filter((u) => u.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (target) {
      target.hp = Math.min(target.maxHp, target.hp + 34);
      this.message = "回復";
    }
  }
  resolveEnemyMagic() {
    this.cast = 0;
    for (const ally of this.allies.filter((u) => u.alive)) {
      ally.hp = Math.max(0, ally.hp - (ally.id === "knight" ? 12 : 18));
      if (!ally.hp) ally.alive = false;
    }
    this.message = "敵魔法";
  }
  damageFrontline(amount, command) {
    const knight = this.allies.find((u) => u.id === "knight" && u.alive);
    const frontline = this.allies.filter((u) => u.alive && u.id !== "white");
    const target = knight && this.time % 2 > 0.75 ? knight : frontline[0] || this.allies.find((u) => u.alive);
    if (!target) return;
    const guarded = target.id === "knight" || command === "WAIT";
    target.hp = Math.max(0, target.hp - (guarded ? Math.ceil(amount * 0.55) : amount));
    if (!target.hp) target.alive = false;
  }
  finish(kind) {
    this.mode = "result";
    if (kind === "VICTORY") {
      this.funds += 180;
      this.chaos += 1;
    }
    if (kind === "DEFEAT") this.chaos = Math.max(0, this.chaos - 5);
    this.message = kind === "VICTORY" ? "勝利" : kind === "DEFEAT" ? "敗北" : "退却";
  }
  render() {
    rect(0, 0, W, H, COLORS.black);
    this.mode === "map" ? drawRouteMap(this) : drawBattlefield(this);
    drawHud(this);
    drawStatus(this);
  }
}

function unit(id, cls, x, y, hp, maxHp, atk) {
  return { id, cls, x, y, hp, maxHp, atk, timer: Math.random() * 0.5, alive: true };
}

function drawHud(game) {
  rect(0, 0, W, 14, COLORS.black);
  line(0, 13, W, 13, COLORS.gold);
  text(`時刻12:${String(40 + Math.floor(game.time) % 20).padStart(2, "0")}`, 5, 3, COLORS.cyan);
  text(`資金${game.funds}`, 65, 3, COLORS.white);
  text("部隊03/12", 132, 3, COLORS.cyan);
  text(`混沌${game.chaos}`, 198, 3, COLORS.white);
}

function drawRouteMap(game) {
  sky();
  island(14, 48, 220, 68);
  path([[31, 101], [72, 84], [115, 92], [155, 65], [211, 76]], COLORS.gold);
  path([[75, 85], [58, 120], [112, 121], [154, 103], [209, 112]], COLORS.gold);
  tower(146, 42, "magic");
  tower(198, 58, "fort");
  tower(31, 91, "fort");
  for (const [x, y] of [[38, 101], [178, 70], [205, 113]]) drawFlag(x, y, x < 100 ? COLORS.blue : COLORS.red);
  const squadX = 93 + game.selectedNode * 18;
  drawSprite("black", squadX - 10, 87);
  drawSprite("warrior", squadX + 2, 86);
  drawCursor(squadX - 13, 83);
}

function drawBattlefield(game) {
  tileBattleBackdrop(game.time);
  scrollingCloudLayer(game.time, 25, 0.18, 0);
  scrollingCloudLayer(game.time, 47, 0.34, 1);
  drawBattleRoad();
  for (const u of game.allies) if (u.alive) drawSprite(u.id, u.x, u.y);
  for (const u of game.enemies) if (u.alive) drawSprite(u.id.startsWith("goblin") ? "goblin" : "mage", u.x, u.y);
  particles(42, 76, COLORS.cyan, game.healCast || 0.25);
  orb(211, 83, COLORS.ruby, game.cast);
}

function tileBattleBackdrop(time) {
  for (let y = FIELD_TOP; y < UI_TOP; y += 8) {
    const band = y < 38 ? COLORS.blue : y < 70 ? COLORS.sky : COLORS.cyan;
    rect(0, y, W, 8, band);
  }
  pixelMountains(88, 86, COLORS.lavender, COLORS.purple);
  pixelMountains(126, 88, COLORS.lavender, COLORS.stone);
  floatingIslandTile(7, 50, 56, 31, "fort");
  floatingIslandTile(197, 52, 54, 29, "magic");
  floatingIslandTile(137, 68, 38, 20, "ruin");
  sign(119, 52);
  for (let x = -16 + ((time * -10) % 64); x < W + 24; x += 64) {
    tinyCloud(x, 34, 0);
    tinyCloud(x + 30, 61, 1);
  }
}

function pixelMountains(x, y, c1, c2) {
  tri(x, y, x + 17, y - 40, x + 34, y, c1);
  tri(x + 16, y, x + 35, y - 32, x + 58, y, c2);
  tri(x + 7, y - 19, x + 17, y - 40, x + 26, y - 19, COLORS.white);
  tri(x + 27, y - 14, x + 35, y - 32, x + 45, y - 14, COLORS.white);
  for (let px = x; px < x + 58; px += 8) rect(px, y - 3, 5, 3, COLORS.darkSilver);
}

function floatingIslandTile(x, y, w, h, kind) {
  for (let tx = x; tx < x + w; tx += 8) {
    rect(tx, y + 8, 8, 8, COLORS.green);
    rect(tx, y + 16, 8, 8, COLORS.darkStone);
  }
  rect(x + 4, y + 4, w - 8, 8, COLORS.lightGreen);
  for (let tx = x + 4; tx < x + w - 4; tx += 12) rect(tx, y + 10, 4, 3, COLORS.yellow);
  for (let tx = x + 8; tx < x + w - 8; tx += 8) tri(tx, y + h - 4, tx + 4, y + h + 10, tx + 8, y + h - 4, COLORS.darkStone);
  if (kind === "fort") {
    rect(x + 14, y - 10, 24, 18, COLORS.stone);
    rect(x + 18, y - 18, 5, 10, COLORS.silver);
    rect(x + 28, y - 22, 6, 14, COLORS.silver);
    rect(x + 22, y, 8, 8, COLORS.black);
    drawFlag(x + 35, y - 17, COLORS.blue);
  } else if (kind === "magic") {
    rect(x + 19, y - 14, 16, 22, COLORS.stone);
    tri(x + 17, y - 14, x + 27, y - 31, x + 37, y - 14, COLORS.purple);
    rect(x + 24, y - 6, 4, 14, COLORS.black);
    rect(x + 25, y - 35, 4, 4, COLORS.cyan);
  } else {
    rect(x + 12, y - 5, 6, 13, COLORS.silver);
    rect(x + 24, y - 8, 5, 16, COLORS.stone);
  }
}

function tinyCloud(x, y, variant) {
  const c2 = variant ? COLORS.lavender : COLORS.white;
  rect(x, y + 4, 16, 4, COLORS.white);
  rect(x + 8, y, 20, 8, COLORS.white);
  rect(x + 24, y + 5, 18, 4, c2);
  rect(x + 4, y + 8, 30, 3, COLORS.lavender);
}

function drawBattleRoad() {
  for (let x = 0; x < W; x += 8) {
    for (let y = 95; y < UI_TOP; y += 8) {
      const variant = ((x / 8) * 3 + y / 8) % 5;
      drawStoneTile(x, y, variant);
    }
  }
  drawCliff();
}

function drawStoneTile(x, y, variant) {
  rect(x, y, 8, 8, variant % 2 ? COLORS.stone : COLORS.silver);
  line(x, y + 7, x + 7, y + 7, COLORS.darkSilver);
  line(x + 7, y, x + 7, y + 7, COLORS.darkSilver);
  if (variant === 0) line(x + 1, y + 3, x + 5, y + 1, COLORS.darkSilver);
  if (variant === 1) rect(x + 2, y + 5, 3, 2, COLORS.green);
  if (variant === 2) line(x + 1, y + 1, x + 6, y + 5, COLORS.darkSilver);
  if (variant === 3) rect(x + 5, y + 2, 2, 2, COLORS.darkStone);
}

function scrollingCloudLayer(time, y, speed, variant) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, FIELD_TOP + 3, W, 78);
  ctx.clip();
  const offset = -((time * 60 * speed) % 96);
  for (let x = offset - 96; x < W + 96; x += 96) {
    if (variant === 0) {
      cloud(x + 8, y);
      cloud(x + 54, y + 7);
    } else {
      cloud(x + 4, y + 5);
      cloud(x + 39, y - 4);
      cloud(x + 78, y + 3);
    }
  }
  ctx.restore();
}

function drawStatus(game) {
  rect(0, UI_TOP, W, H - UI_TOP, COLORS.black);
  panel(2, 141, 82, 95);
  panel(87, 141, 70, 95);
  panel(160, 141, 94, 95);
  text("味方部隊", 13, 146, COLORS.yellow);
  game.allies.forEach((u, i) => {
    const y = 157 + i * 18;
    drawSprite(u.id, 10, y);
    text(`${i + 1} ${u.cls}`, 27, y, u.alive ? COLORS.white : COLORS.darkSilver);
    text(`HP ${u.hp}/${u.maxHp}`, 27, y + 8, COLORS.cyan);
    bar(82, y + 10, 28, 4, u.hp / u.maxHp, COLORS.cyan);
  });
  const commands = ["戦う", "魔法", "待機", "退却"];
  commands.forEach((cmd, i) => {
    const y = 151 + i * 16;
    text(`${i === game.command ? ">" : " "} ${cmd}`, 101, y, i === game.command ? COLORS.yellow : COLORS.white);
  });
  rect(92, 213, 60, 18, COLORS.black);
  line(92, 213, 152, 213, COLORS.gold);
  text(game.message.slice(0, 14), 95, 219, COLORS.white);
  text("敵部隊", 173, 146, COLORS.red);
  game.enemies.forEach((u, i) => {
    const x = 171 + i * 25;
    drawSprite(u.id.startsWith("goblin") ? "goblin" : "mage", x, 158);
    bar(x, 176, 18, 4, u.hp / u.maxHp, COLORS.red);
  });
  text("詠唱", 173, 188, COLORS.purple);
  bar(205, 190, 39, 5, game.cast, COLORS.purple);
  text("回復", 173, 205, COLORS.cyan);
  bar(205, 207, 39, 5, game.healCast, COLORS.cyan);
  text("行動", 173, 221, COLORS.yellow);
  [...game.allies, ...game.enemies].slice(0, 6).forEach((u, i) => bar(203 + i * 8, 223, 6, 4, u.timer, u.alive ? COLORS.yellow : COLORS.darkSilver));
}

function sky() {
  for (let y = FIELD_TOP; y < UI_TOP; y++) rect(0, y, W, 1, y < 70 ? COLORS.blue : COLORS.sky);
  cloud(15, 32); cloud(69, 24); cloud(169, 32); cloud(220, 42);
  mountain(101, 84, COLORS.lavender); mountain(134, 86, COLORS.purple);
}
function island(x, y, w, h) {
  ellipse(x, y, w, h, COLORS.green);
  ellipse(x + 8, y + 10, w - 20, h - 18, COLORS.lightGreen);
  for (let i = 0; i < 36; i++) rect(x + 5 + (i * 19) % (w - 12), y + 20 + (i * 13) % (h - 28), 3, 2, COLORS.darkStone);
}
function cloud(x, y) {
  ellipse(x, y, 28, 7, COLORS.white); ellipse(x + 14, y - 4, 28, 8, COLORS.white); ellipse(x + 28, y + 1, 26, 6, COLORS.lavender);
}
function mountain(x, y, c) {
  tri(x, y, x + 18, y - 42, x + 36, y, c); tri(x + 8, y, x + 22, y - 27, x + 45, y, COLORS.lavender);
}
function tower(x, y, kind) {
  rect(x, y + 18, 24, 23, COLORS.stone); rect(x + 5, y + 7, 14, 12, COLORS.silver);
  tri(x + 5, y + 7, x + 12, y - 4, x + 19, y + 7, kind === "magic" ? COLORS.cyan : COLORS.red);
  rect(x + 9, y + 29, 6, 12, COLORS.black);
}
function sign(x, y) {
  rect(x + 8, y, 4, 43, COLORS.darkStone);
  rect(x - 12, y + 5, 26, 12, COLORS.darkStone);
  rect(x + 10, y + 18, 27, 12, COLORS.darkStone);
  text("N", x - 4, y + 8, COLORS.white); text("E", x + 20, y + 21, COLORS.white);
}
function drawCliff() {
  for (let x = 0; x < W; x += 9) {
    tri(x, 130, x + 4, 145, x + 9, 130, COLORS.darkStone);
  }
}
function path(points, c) {
  ctx.strokeStyle = c; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(points[0][0], points[0][1]);
  for (const p of points.slice(1)) ctx.lineTo(p[0], p[1]);
  ctx.stroke(); ctx.lineWidth = 1;
}
function panel(x, y, w, h) {
  rect(x, y, w, h, COLORS.black);
  line(x, y, x + w, y, COLORS.silver); line(x, y + h, x + w, y + h, COLORS.silver);
  line(x, y, x, y + h, COLORS.silver); line(x + w, y, x + w, y + h, COLORS.silver);
  line(x + 2, y + 2, x + w - 2, y + 2, COLORS.gold);
}
function drawSprite(id, x, y) {
  if (assets.units.complete && assets.units.naturalWidth) {
    const map = {
      warrior: 0,
      knight: 1,
      white: 2,
      goblin: 3,
      mage: 5,
      black: 0
    };
    const idx = map[id];
    if (idx !== undefined) {
      const sx = idx * 32;
      ctx.drawImage(assets.units, sx, 0, 32, 32, Math.round(x) - 4, Math.round(y) - 14, 24, 24);
      return;
    }
  }
  const ix = Math.round(x), iy = Math.round(y);
  if (id === "white") {
    rect(ix + 5, iy + 2, 6, 12, COLORS.white); rect(ix + 3, iy + 6, 10, 9, COLORS.lavender); rect(ix + 6, iy, 5, 4, COLORS.gold); line(ix + 13, iy + 1, ix + 13, iy + 15, COLORS.gold); rect(ix + 12, iy, 3, 3, COLORS.cyan);
  } else if (id === "warrior") {
    rect(ix + 3, iy + 4, 9, 10, COLORS.blue); rect(ix + 5, iy + 1, 7, 5, COLORS.gold); line(ix + 12, iy + 8, ix + 20, iy + 4, COLORS.white); rect(ix + 1, iy + 12, 5, 3, COLORS.navy);
  } else if (id === "knight") {
    rect(ix + 4, iy + 3, 9, 12, COLORS.blue); rect(ix + 5, iy, 8, 5, COLORS.gold); rect(ix + 11, iy + 5, 6, 9, COLORS.gold); line(ix + 15, iy + 6, ix + 15, iy + 13, COLORS.white);
  } else if (id === "black") {
    rect(ix + 5, iy + 5, 7, 10, COLORS.blue); tri(ix + 2, iy + 6, ix + 8, iy, ix + 15, iy + 6, COLORS.yellow); line(ix + 13, iy + 7, ix + 16, iy + 3, COLORS.white);
  } else if (id === "goblin") {
    rect(ix + 4, iy + 5, 10, 8, COLORS.green); rect(ix + 6, iy + 2, 7, 5, COLORS.lightGreen); rect(ix + 2, iy + 8, 4, 3, COLORS.gold); line(ix + 1, iy + 6, ix + 9, iy - 1, COLORS.white);
  } else if (id === "mage") {
    rect(ix + 5, iy + 4, 8, 11, COLORS.purple); tri(ix + 2, iy + 5, ix + 9, iy, ix + 16, iy + 5, COLORS.purple); rect(ix + 7, iy + 7, 2, 2, COLORS.yellow); line(ix + 2, iy + 5, ix - 1, iy + 1, COLORS.gold);
  }
}
function particles(x, y, c, level) {
  for (let i = 0; i < 10; i++) {
    const a = game.time * 5 + i;
    rect(x + Math.cos(a) * (7 + level * 8) + i % 3, y + Math.sin(a * 1.4) * (5 + level * 5), 2, 2, c);
  }
}
function orb(x, y, c, level) {
  ellipse(x - 2, y - 2, 5 + level * 8, 5 + level * 8, c);
  rect(x - 1, y - 1, 2, 2, COLORS.white);
}
function drawFlag(x, y, c) { rect(x, y, 2, 18, COLORS.gold); rect(x + 2, y, 12, 8, c); }
function drawCursor(x, y) { line(x, y, x + 7, y, COLORS.cyan); line(x, y, x, y + 7, COLORS.cyan); line(x + 25, y + 20, x + 18, y + 20, COLORS.cyan); line(x + 25, y + 20, x + 25, y + 13, COLORS.cyan); }
function bar(x, y, w, h, pct, c) { rect(x, y, w, h, COLORS.darkSilver); rect(x + 1, y + 1, Math.max(0, Math.round((w - 2) * pct)), h - 2, c); line(x, y, x + w, y, COLORS.gold); }
function text(s, x, y, c = COLORS.white) {
  if (!assets.font.complete || !assets.font.naturalWidth) {
    ctx.fillStyle = c; ctx.font = "7px monospace"; ctx.fillText(s, Math.round(x), Math.round(y + 6));
    return;
  }
  const tinted = tintedFont(c);
  const tintedJp = tintedJapaneseFont(c);
  let dx = 0;
  [...String(s)].forEach((ch, i) => {
    const jpIndex = JP_FONT_CHARS.indexOf(ch);
    if (jpIndex >= 0 && tintedJp) {
      const sx = (jpIndex % 16) * 8;
      const sy = Math.floor(jpIndex / 16) * 8;
      ctx.drawImage(tintedJp, sx, sy, 8, 8, Math.round(x + dx), Math.round(y), 8, 8);
      dx += 8;
      return;
    }
    const code = ch.charCodeAt(0) & 0xff;
    const sx = (code & 0x0f) * 4;
    const sy = (code >> 4) * 8;
    ctx.drawImage(tinted, sx, sy, 4, 8, Math.round(x + dx), Math.round(y), 4, 8);
    dx += 4;
  });
}

function tintedFont(color) {
  if (fontCache.has(color)) return fontCache.get(color);
  const off = document.createElement("canvas");
  off.width = assets.font.naturalWidth;
  off.height = assets.font.naturalHeight;
  const octx = off.getContext("2d");
  octx.drawImage(assets.font, 0, 0);
  const data = octx.getImageData(0, 0, off.width, off.height);
  const rgb = hexToRgb(color);
  for (let i = 0; i < data.data.length; i += 4) {
    const ink = data.data[i] < 128;
    data.data[i] = rgb[0];
    data.data[i + 1] = rgb[1];
    data.data[i + 2] = rgb[2];
    data.data[i + 3] = ink ? 255 : 0;
  }
  octx.putImageData(data, 0, 0);
  fontCache.set(color, off);
  return off;
}

function tintedJapaneseFont(color) {
  if (!assets.fontJp.complete || !assets.fontJp.naturalWidth) return null;
  const key = `jp:${color}`;
  if (fontCache.has(key)) return fontCache.get(key);
  const off = document.createElement("canvas");
  off.width = assets.fontJp.naturalWidth;
  off.height = assets.fontJp.naturalHeight;
  const octx = off.getContext("2d");
  octx.drawImage(assets.fontJp, 0, 0);
  const data = octx.getImageData(0, 0, off.width, off.height);
  const rgb = hexToRgb(color);
  for (let i = 0; i < data.data.length; i += 4) {
    const ink = data.data[i + 3] > 0;
    data.data[i] = rgb[0];
    data.data[i + 1] = rgb[1];
    data.data[i + 2] = rgb[2];
    data.data[i + 3] = ink ? 255 : 0;
  }
  octx.putImageData(data, 0, 0);
  fontCache.set(key, off);
  return off;
}

function hexToRgb(color) {
  const hex = color.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
function rect(x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function line(x1, y1, x2, y2, c) { ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(Math.round(x1) + 0.5, Math.round(y1) + 0.5); ctx.lineTo(Math.round(x2) + 0.5, Math.round(y2) + 0.5); ctx.stroke(); }
function tri(x1, y1, x2, y2, x3, y3, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.fill(); }
function ellipse(x, y, w, h, c) { ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); ctx.fill(); }

const input = new Input();
const game = new Game();
let last = performance.now();
function loop(now) {
  const dt = Math.min(2, (now - last) / 1000 * 60) / 60;
  last = now;
  input.beginFrame();
  game.update(input, dt);
  game.render();
  input.endFrame();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
