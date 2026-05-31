type Btn = "up" | "down" | "left" | "right" | "a" | "b" | "start" | "select";

interface Input {
  up: boolean; down: boolean; left: boolean; right: boolean;
  a: boolean; b: boolean; start: boolean; select: boolean;
  pressed(btn: Btn): boolean;
}

interface Gfx {
  drawTile(tileId: string, x: number, y: number, opts?: { flipX?: boolean; flipY?: boolean; palette?: number }): void;
  drawSprite(spriteId: string, x: number, y: number, opts?: { flipX?: boolean; flipY?: boolean; palette?: number; rotate?: 0 | 90 | 180 | 270; alpha?: number }): void;
  setLayer(z: number): void;
  setScroll(z: number, sx: number, sy: number): void;
  setPalette(name: string): void;
  clear(colorIndex: number): void;
}

interface NeofamiContext {
  sfx?: {
    playBgm(trackId: string, opts?: { loop?: boolean }): void;
    playSe(seId: string): void;
  };
}

type Unit = {
  id: string;
  cls: string;
  sprite: string;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  atk: number;
  timer: number;
  alive: boolean;
};

const COMMANDS = ["FIGHT", "MAGIC", "WAIT", "RETREAT"] as const;
const COMMAND_LABELS = ["戦う", "魔法", "待機", "退却"] as const;
const JP_FONT_CHARS = "時刻資金部隊混沌味方敵戦魔法待機退却詠唱回復行動接触指揮勝利敗北撤前衛後白黒剣士騎道う失敗防御選択攻撃";

export class SkyfrontBattleScene {
  private command = 0;
  private mode: "map" | "battle" | "result" = "map";
  private message = "接触 指揮";
  private chaos = 62;
  private funds = 2840;
  private time = 0;
  private cast = 0.42;
  private healCast = 0;
  private cursorBlink = 0;
  private selectedNode = 1;
  private allies: Unit[] = [];
  private enemies: Unit[] = [];
  private sfx: NeofamiContext["sfx"];

  init(ctx: NeofamiContext): void {
    this.sfx = ctx.sfx;
    this.sfx?.playBgm("battle_march", { loop: true });
    this.resetBattle();
  }

  update(input: Input, dt: number): void {
    this.time += dt;
    this.cursorBlink += dt;
    if (this.mode === "map") {
      this.updateMap(input);
      return;
    }
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

  render(gfx: Gfx): void {
    gfx.setPalette("nes");
    gfx.clear(1);
    if (this.mode === "map") {
      this.renderRouteMap(gfx);
    } else {
      this.renderBattlefield(gfx);
    }
    this.renderHud(gfx);
    this.renderStatus(gfx);
  }

  private updateMap(input: Input): void {
    if (input.pressed("left") || input.pressed("up")) this.selectedNode = Math.max(0, this.selectedNode - 1);
    if (input.pressed("right") || input.pressed("down")) this.selectedNode = Math.min(2, this.selectedNode + 1);
    if (input.pressed("a")) {
      this.mode = "battle";
      this.message = "接触 指揮";
      this.sfx?.playSe("command_tick");
    }
  }

  private updateBattle(input: Input, dt: number): void {
    const speed = input.down || input.up ? 0.55 : 1;
    if (input.pressed("up")) this.command = (this.command + COMMANDS.length - 1) % COMMANDS.length;
    if (input.pressed("down")) this.command = (this.command + 1) % COMMANDS.length;
    if (input.pressed("a")) {
      this.message = this.applyCommand(COMMANDS[this.command]);
      this.sfx?.playSe("command_tick");
    }

    const livingEnemies = this.enemies.filter((u) => u.alive);
    const livingAllies = this.allies.filter((u) => u.alive);
    if (livingEnemies.length === 0 || livingAllies.length === 0) {
      this.finish(livingEnemies.length === 0 ? "VICTORY" : "DEFEAT");
      return;
    }

    for (const ally of livingAllies) {
      ally.timer += dt * speed * (COMMANDS[this.command] === "WAIT" ? 0.6 : 1);
      if (ally.timer >= 1) {
        ally.timer = 0;
        if (ally.id === "white") {
          this.healCast = Math.min(1, this.healCast + 0.34);
          if (this.healCast >= 1) this.resolveHeal();
        } else {
          const target = livingEnemies[0];
          target.hp -= ally.atk + (COMMANDS[this.command] === "FIGHT" ? 4 : 0);
          if (target.hp <= 0) {
            target.hp = 0;
            target.alive = false;
            this.message = `${target.cls} DOWN`;
          }
        }
      }
    }

    for (const enemy of livingEnemies) {
      enemy.timer += dt * speed;
      if (enemy.id === "mage") {
        this.cast += dt * 0.09 * speed;
        if (this.cast >= 1) this.resolveEnemyMagic();
      } else if (enemy.timer >= 1.1) {
        enemy.timer = 0;
        this.damageFrontline(enemy.atk);
      }
    }
  }

  private applyCommand(command: string): string {
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

  private resolveHeal(): void {
    this.healCast = 0;
    const target = this.allies.filter((u) => u.alive).sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0];
    if (!target) return;
    target.hp = Math.min(target.maxHp, target.hp + 34);
    this.message = "回復";
    this.sfx?.playSe("heal_cast");
  }

  private resolveEnemyMagic(): void {
    this.cast = 0;
    for (const ally of this.allies.filter((u) => u.alive)) {
      ally.hp -= ally.id === "knight" ? 12 : 18;
      if (ally.hp <= 0) {
        ally.hp = 0;
        ally.alive = false;
      }
    }
    this.message = "敵魔法";
  }

  private damageFrontline(amount: number): void {
    const knight = this.allies.find((u) => u.id === "knight" && u.alive);
    const candidates = this.allies.filter((u) => u.alive && u.id !== "white");
    const target = knight && this.time % 2 > 0.75 ? knight : candidates[0] ?? this.allies.find((u) => u.alive);
    if (!target) return;
    const guarded = target.id === "knight" || COMMANDS[this.command] === "WAIT";
    target.hp -= guarded ? Math.ceil(amount * 0.55) : amount;
    if (target.hp <= 0) {
      target.hp = 0;
      target.alive = false;
    }
  }

  private finish(kind: "VICTORY" | "DEFEAT" | "RETREATED"): void {
    this.mode = "result";
    if (kind === "VICTORY") {
      this.funds += 180;
      this.chaos += 1;
    }
    if (kind === "DEFEAT") this.chaos -= 5;
    this.message = kind === "VICTORY" ? "勝利" : kind === "DEFEAT" ? "敗北" : "退却";
  }

  private resetBattle(): void {
    this.cast = 0.42;
    this.healCast = 0;
    this.allies = [
      { id: "warrior", cls: "戦士", sprite: "ally_warrior", x: 62, y: 91, hp: 148, maxHp: 180, atk: 16, timer: 0.25, alive: true },
      { id: "knight", cls: "騎士", sprite: "ally_knight", x: 86, y: 96, hp: 136, maxHp: 160, atk: 12, timer: 0, alive: true },
      { id: "white", cls: "白魔道士", sprite: "ally_white_mage", x: 38, y: 72, hp: 110, maxHp: 120, atk: 3, timer: 0.5, alive: true }
    ];
    this.enemies = [
      { id: "goblin1", cls: "GOBLIN", sprite: "enemy_goblin", x: 164, y: 82, hp: 76, maxHp: 76, atk: 13, timer: 0.2, alive: true },
      { id: "goblin2", cls: "GOBLIN", sprite: "enemy_goblin", x: 181, y: 102, hp: 76, maxHp: 76, atk: 13, timer: 0.6, alive: true },
      { id: "mage", cls: "MAGICIAN", sprite: "enemy_magician", x: 209, y: 84, hp: 90, maxHp: 90, atk: 0, timer: 0, alive: true }
    ];
  }

  private renderHud(gfx: Gfx): void {
    gfx.setLayer(8);
    gfx.drawTile("hud_bar", 0, 0);
    this.drawText(gfx, `時刻12:${String(40 + Math.floor(this.time) % 20).padStart(2, "0")}`, 5, 4);
    this.drawText(gfx, `資金${this.funds}`, 65, 4);
    this.drawText(gfx, "部隊03/12", 132, 4);
    this.drawText(gfx, `混沌${this.chaos}`, 197, 4);
  }

  private renderRouteMap(gfx: Gfx): void {
    gfx.setLayer(0);
    gfx.drawTile("bg_route_sky", 0, 14);
    gfx.setLayer(2);
    gfx.drawTile("route_island", 12, 32);
    gfx.drawTile("route_path", 42, 84);
    gfx.drawSprite("map_allied_squad", 96 + this.selectedNode * 18, 88);
    gfx.drawSprite("map_enemy_flag", 176, 70);
    gfx.drawSprite("map_enemy_flag", 202, 103);
    if (Math.floor(this.cursorBlink * 4) % 2 === 0) gfx.drawSprite("cursor_box", 92 + this.selectedNode * 18, 84);
  }

  private renderBattlefield(gfx: Gfx): void {
    gfx.setLayer(0);
    gfx.drawTile("bg_battle_skyroad", 0, 14);
    gfx.setLayer(1);
    gfx.setScroll(1, this.time * 4, 0);
    gfx.drawTile("cloud_layer_far", 0, 22);
    gfx.drawTile("cloud_layer_far", 128, 22);
    gfx.setLayer(2);
    gfx.setScroll(2, this.time * 9, 0);
    gfx.drawTile("cloud_layer_near", 0, 42);
    gfx.drawTile("cloud_layer_near", 128, 42);
    gfx.setLayer(2);
    gfx.setScroll(2, 0, 0);
    gfx.drawTile("fork_sign", 116, 49);
    for (const ally of this.allies) if (ally.alive) gfx.drawSprite(ally.sprite, ally.x, ally.y);
    for (const enemy of this.enemies) if (enemy.alive) gfx.drawSprite(enemy.sprite, enemy.x, enemy.y);
    gfx.drawSprite("heal_particles", 34, 63, { alpha: 0.5 + 0.5 * (this.healCast || 0.2) });
    gfx.drawSprite("enemy_spell_orb", 204, 76, { alpha: 0.65 + this.cast * 0.35 });
  }

  private renderStatus(gfx: Gfx): void {
    gfx.setLayer(9);
    gfx.drawTile("ui_lower_frame", 0, 137);
    this.drawText(gfx, this.message, 94, 222);
    this.drawText(gfx, "味方部隊", 11, 144);
    this.allies.forEach((u, i) => {
      gfx.drawSprite(u.sprite, 12, 157 + i * 18);
      this.drawText(gfx, `${i + 1} ${u.cls}`, 30, 157 + i * 18);
      this.drawBar(gfx, 86, 166 + i * 18, u.hp / u.maxHp, "cyan");
    });
    COMMANDS.forEach((cmd, i) => {
      this.drawText(gfx, `${i === this.command ? ">" : " "} ${COMMAND_LABELS[i]}`, 104, 151 + i * 16);
    });
    this.drawText(gfx, "敵部隊", 173, 144);
    this.enemies.forEach((u, i) => {
      gfx.drawSprite(u.sprite, 172 + i * 23, 158);
      this.drawBar(gfx, 171 + i * 23, 176, u.hp / u.maxHp, "red");
    });
    this.drawBar(gfx, 174, 193, this.cast, "purple");
    this.drawText(gfx, "詠唱", 174, 185);
    this.drawBar(gfx, 174, 211, this.healCast, "cyan");
    this.drawText(gfx, "回復", 174, 203);
  }

  private drawText(gfx: Gfx, text: string, x: number, y: number): void {
    let dx = 0;
    [...text.toUpperCase()].forEach((ch) => {
      const jpIndex = JP_FONT_CHARS.indexOf(ch);
      if (jpIndex >= 0) {
        gfx.drawTile(`fontjp_${jpIndex}`, x + dx, y);
        dx += 8;
        return;
      }
      const tile = ch === " " ? "font_space" : `font_${ch.replace(":", "colon").replace("/", "slash").replace(">", "cursor")}`;
      gfx.drawTile(tile, x + dx, y);
      dx += 4;
    });
  }

  private drawBar(gfx: Gfx, x: number, y: number, pct: number, color: "cyan" | "red" | "purple"): void {
    const filled = Math.max(0, Math.min(4, Math.round(pct * 4)));
    for (let i = 0; i < 4; i++) {
      gfx.drawTile(i < filled ? `bar_${color}` : "bar_empty", x + i * 8, y);
    }
  }
}
