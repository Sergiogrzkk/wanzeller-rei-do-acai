/* Testes de física e regras sem navegador ou dependências.
 * O gancho existe apenas nesta cópia em memória, nunca no jogo publicado.
 * Execute: node tests/game.test.cjs
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createGame() {
  const elements = new Map();
  const noop = () => {};
  const context2d = new Proxy({}, { get: (_, name) => name === 'createLinearGradient' ? () => ({ addColorStop: noop }) : noop, set: () => true });
  function element(id) {
    if (!elements.has(id)) elements.set(id, { textContent: '', style: {}, handlers: {}, dataset: {},
      classList: { toggle: noop, contains: () => false }, setAttribute: noop, focus: noop,
      getBoundingClientRect: () => ({ width: 1280, height: 720 }), getContext: () => context2d,
      addEventListener(name, handler) { this.handlers[name] = handler; } });
    return elements.get(id);
  }
  const document = { getElementById: element, querySelectorAll: () => [], addEventListener: noop };
  const sandbox = { document, window: { addEventListener: noop }, devicePixelRatio: 1,
    matchMedia: () => ({ matches: false }), ResizeObserver: class { observe() {} },
    localStorage: { getItem: () => null, setItem: noop }, requestAnimationFrame: noop, console };
  const hook = `
    globalThis.testGame = {
      startGame, loadLevel, update, render, pauseGame, resumeGame, returnToMenu, damage,
      hitEnemy, fire, held, PHYSICS, LEVELS, pressed, touch, beginDialogue, advanceDialogue,
      skipDialogue: finishDialogue,
      jump() { jumpBuffer = PHYSICS.jumpBuffer; },
      releaseJump() { jumpReleased = true; },
      get data() { return { state, player, platforms, enemies, items, shots, enemyShots,
        score, lives, camera, checkpoint, levelIndex, level, elapsed, dialogue, middleSeen, bossSeen }; }
    };
  `;
  const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');
  vm.runInNewContext(source.replace(/\}\)\(\);\s*$/, hook + '\n})();'), sandbox);
  return sandbox.testGame;
}

let passed = 0;
function test(name, run) { try { run(); passed++; console.log('OK  ' + name); } catch (error) { console.error('FALHOU  ' + name); throw error; } }
function step(game, seconds) {
  if (game.data.state === 'dialogue') game.skipDialogue();
  for (let i = 0; i < seconds * 120 && game.data.state === 'playing'; i++) {
    game.update(1 / 120);
    if (game.data.state === 'dialogue') game.skipDialogue();
  }
}
function start() { const game = createGame(); game.startGame(); step(game, .3); return game; }

test('Inicialização e aterrissagem no solo', () => {
  const g = start(); assert.equal(g.data.state, 'playing'); assert.equal(g.data.player.y, 546);
  assert.equal(g.data.player.onGround, true); assert.equal(g.data.lives, 3); g.render();
});
test('Movimento em ambos os sentidos, frenagem e limites do mundo', () => {
  const g = start(); g.pressed.add('KeyD'); step(g, .3); assert(g.data.player.x > 160);
  g.pressed.clear(); step(g, .3); assert.equal(g.data.player.vx, 0);
  g.pressed.add('ArrowLeft'); step(g, 1.4); assert.equal(g.data.player.x, 0);
});
test('Pulo completo, pulo curto e ausência de pulo infinito', () => {
  const g = start(); g.jump(); step(g, .3); const highY = g.data.player.y; assert(highY < 435);
  const oldVelocity = g.data.player.vy; g.jump(); step(g, 1 / 120); assert(g.data.player.vy > oldVelocity);
  step(g, .7); assert.equal(g.data.player.y, 546);
  g.jump(); step(g, .04); g.releaseJump(); step(g, .15); assert(g.data.player.y > highY + 40);
});
test('Pulo tolerante depois de sair de uma borda', () => {
  const g = start(); const p = g.data.player; p.x = 745; p.onGround = false; p.support = null; p.coyote = .08;
  g.jump(); step(g, .01); assert(p.vy < -600);
});
test('Pulo antecipado pouco antes de aterrissar', () => {
  const g = start(); const p = g.data.player; p.y = 540; p.vy = 300; p.onGround = false; p.coyote = 0; p.support = null;
  g.jump(); step(g, .06); assert(p.vy < -500);
});
test('Plataforma móvel transporta o personagem', () => {
  const g = start(); const platform = g.data.platforms.find(p => p.move?.axis === 'x');
  const p = g.data.player; p.x = platform.x + 45; p.y = platform.y - p.h; p.onGround = true; p.support = platform;
  const offset = p.x - platform.x; step(g, .15); assert(Math.abs(p.x - platform.x - offset) < .1); assert.equal(p.support, platform);
});
test('Coleta de fruto, fruto dourado e recuperação de vida', () => {
  const g = start(); const p = g.data.player;
  for (const type of ['berry', 'gold']) {
    const item = g.data.items.find(i => i.type === type && !i.platform); const before = g.data.score;
    p.x = item.x; p.y = item.y; p.vy = 0; p.support = null; step(g, 1 / 120);
    assert(item.collected); assert(g.data.score >= before + (type === 'gold' ? 100 : 25));
  }
  p.invulnerable = 0; g.damage(p.x + 100); assert.equal(g.data.lives, 2);
  const heart = g.data.items.find(i => i.type === 'heart'); p.x = heart.x; p.y = 546; p.vx = 0; p.vy = 0; p.support = null; step(g, .03); assert.equal(g.data.lives, 3);
});
test('Projétil de açaí elimina inimigo e respeita intervalo de disparo', () => {
  const g = start(); const e = g.data.enemies[0]; e.speed = 0;
  Object.assign(g.data.player, { x: e.x - 130, y: 546, facing: 1 });
  g.fire(); g.fire(); assert.equal(g.data.shots.length, 1); step(g, .25); assert(e.dead); assert(g.data.score >= 100);
});
test('Pulo sobre inimigo rebate o herói sem tirar vida', () => {
  const g = start(); const e = g.data.enemies[0]; e.speed = 0;
  Object.assign(g.data.player, { x: e.x, y: e.y - 66, vy: 320, onGround: false, support: null });
  step(g, .02); assert(e.dead); assert(g.data.player.vy < 0); assert.equal(g.data.lives, 3);
});
test('Contato lateral causa dano e invulnerabilidade temporária', () => {
  const g = start(); const e = g.data.enemies[0]; e.speed = 0;
  Object.assign(g.data.player, { x: e.x - 15, y: 546, invulnerable: 0 }); step(g, .02); assert.equal(g.data.lives, 2);
  g.damage(e.x); assert.equal(g.data.lives, 2);
});
test('Queda retorna ao checkpoint; três quedas encerram a partida', () => {
  const g = start(); const p = g.data.player; p.x = 1010; step(g, .02); assert.equal(g.data.checkpoint, 1000);
  p.y = 900; step(g, .01); assert.equal(g.data.lives, 2); assert.equal(p.x, 1000);
  g.damage(0, true); g.damage(0, true); assert.equal(g.data.state, 'lost');
  g.startGame(); g.skipDialogue(); assert.equal(g.data.state, 'playing'); assert.equal(g.data.lives, 3); assert.equal(g.data.score, 0);
});
test('Pausa limpa teclado e toque; retorno ao menu preserva funcionamento', () => {
  const g = start(); g.pressed.add('KeyD'); g.touch.set(1, 'jump'); g.pauseGame();
  assert.equal(g.data.state, 'paused'); assert.equal(g.held('right'), false); assert.equal(g.held('jump'), false);
  g.resumeGame(); assert.equal(g.data.state, 'playing'); g.returnToMenu(); assert.equal(g.data.state, 'menu'); g.render();
});
test('Todas as lacunas do solo são atravessáveis com um pulo', () => {
  for (let i = 0; i < createGame().LEVELS.length; i++) {
    const layout = createGame().LEVELS[i];
    for (let j = 0; j < layout.grounds.length - 1; j++) {
      const g = start(); g.loadLevel(i); g.skipDialogue(); g.data.enemies.forEach(e => { e.dead = true; });
      const [x, w] = layout.grounds[j]; const nextX = layout.grounds[j + 1][0];
      Object.assign(g.data.player, { x: x + w - 45, y: 546, vx: 320, vy: 0, onGround: true, support: g.data.platforms[j] });
      g.pressed.add('KeyD'); g.jump(); step(g, .85);
      assert.equal(g.data.lives, 3, `Queda na fase ${i + 1}, lacuna ${j + 1}`);
      assert(g.data.player.x >= nextX, `Salto insuficiente na fase ${i + 1}`);
      assert(g.data.player.y < 620, `Aterrissagem inválida na fase ${i + 1}`);
    }
  }
});
test('Conclusão das fases e bloqueio do resgate enquanto o chefe vive', () => {
  const g = start();
  for (let i = 0; i < g.LEVELS.length - 1; i++) {
    g.loadLevel(i); g.data.player.x = g.data.level.width - 130; g.data.player.y = 546;
    step(g, .02); assert.equal(g.data.state, 'won'); g.render();
  }
  g.loadLevel(g.LEVELS.length - 1); g.data.player.x = g.data.level.width - 130; g.data.player.y = 546;
  step(g, .02); assert.equal(g.data.state, 'playing');
  const boss = g.data.enemies.find(e => e.type === 'boss');
  for (let i = 0; i < 6; i++) { boss.hitTimer = 0; g.hitEnemy(boss); }
  assert(boss.dead); step(g, .02); assert.equal(g.data.state, 'complete'); g.render();
});
test('O chefe lança projéteis que causam dano', () => {
  const g = start(); g.loadLevel(g.LEVELS.length - 1); const boss = g.data.enemies.find(e => e.type === 'boss');
  boss.speed = 0; boss.shootTimer = .01;
  Object.assign(g.data.player, { x: boss.x - 150, y: 546, invulnerable: 0 });
  step(g, .85); assert.equal(g.data.lives, 2);
});

test('Seis fases preservam a ordem sertão, Amazônia e litoral', () => {
  const g = createGame(); assert.equal(g.LEVELS.length, 6);
  assert.equal(g.LEVELS.map(l => l.biome).join(','), 'desert,desert,forest,forest,coast,coast');
  for(let i=0;i<g.LEVELS.length;i++) {
    const l=g.LEVELS[i]; assert(l.checkpoints.every(x=>l.grounds.some(([start,w])=>x>=start&&x+36<start+w)));
    assert(l.enemies.every(e=>l.grounds.some(([start,w])=>e.min>=start&&e.max+(e.type==='boss'?58:42)<=start+w)));
  }
});
test('Conversas pausam a física e limpam entradas ao terminar', () => {
  const g = createGame(); g.startGame(); assert.equal(g.data.state, 'dialogue');
  const x=g.data.player.x, y=g.data.player.y;
  g.pressed.add('KeyD'); g.update(2); assert.equal(g.data.player.x,x); assert.equal(g.data.player.y,y);
  g.advanceDialogue(); assert.equal(g.data.dialogue.index,1);
  g.skipDialogue(); assert.equal(g.data.state,'playing'); assert.equal(g.held('right'),false);
  assert.equal(g.data.dialogue,null);
});
test('Conversa de checkpoint acontece uma vez por fase', () => {
  const g=start(); g.data.player.x=1010; g.update(1/120); assert.equal(g.data.state,'dialogue');
  assert.equal(g.data.middleSeen,true); g.skipDialogue(); g.update(1/120); assert.equal(g.data.state,'playing');
  g.loadLevel(1); assert.equal(g.data.middleSeen,false);
});
test('Diálogo final antecede a vitória, sem premiar duas vezes', () => {
  const g=start(); g.loadLevel(g.LEVELS.length-1); g.skipDialogue();
  g.data.enemies.forEach(e=>{e.dead=true;});
  Object.assign(g.data.player,{x:g.data.level.width-130,y:546,onGround:true});
  g.update(1/120); if(g.data.middleSeen)g.skipDialogue();
  g.update(1/120); assert.equal(g.data.state,'dialogue');
  const awarded=g.data.score; assert(awarded>=1000); g.update(1); assert.equal(g.data.score,awarded);
  g.skipDialogue(); assert.equal(g.data.state,'complete'); assert.equal(g.data.score,awarded);
});

console.log(`\n${passed} testes passaram.`);
