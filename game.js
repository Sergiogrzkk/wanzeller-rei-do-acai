/* Wanzeller — O Rei do Açaí
 * JavaScript puro, Canvas 2D e áudio sintetizado. Sem dependências.
 * Coordenadas do mundo em pixels; velocidades em pixels por segundo.
 */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');
  const stage = $('stage');
  const art = window.WanzellerArt;
  const ui = Object.fromEntries(['startScreen', 'hud', 'touchControls', 'modalLayer',
    'modalTitle', 'modalDescription', 'modalIcon', 'modalEyebrow', 'modalPrimary',
    'modalSecondary', 'resultScore', 'levelName', 'levelNumber', 'lives', 'score',
    'bestScore', 'levelToast', 'dialogueLayer', 'dialogueName', 'dialogueText', 'dialogueCount',
    'dialogueNext', 'dialogueSkip', 'dialoguePortrait'].map(id => [id, $(id)]));

  const PHYSICS = { speed: 320, acceleration: 2400, friction: 2100, gravity: 1700,
    jump: 665, maxFall: 950, coyoteTime: 0.11, jumpBuffer: 0.13 };
  const VIEW_HEIGHT = 720;
  const MAX_LIVES = 3;
  const STEP = 1 / 120;
  const palette = {
    desert: { sky: '#f5dfaf', horizon: '#f8ebce', sun: '#f4bb59', far: '#d8ae78',
      near: '#c19262', soil: '#b77d51', edge: '#d3aa65', grass: '#7a9250', water: '#e8c68b' },
    forest: { sky: '#acdacf', horizon: '#dbe8b3', sun: '#f7e8a1', far: '#79ad8c',
      near: '#438769', soil: '#816344', edge: '#a38353', grass: '#69a957', water: '#519b95' },
    coast: { sky: '#b5d8ed', horizon: '#e0f2ef', sun: '#fff3c4', far: '#83afbb',
      near: '#68949c', soil: '#c0b497', edge: '#ecdbac', grass: '#7da694', water: '#75b9d0' }
  };

  // Cada fase é declarativa. Plataformas móveis usam amplitude, eixo e período.
  const LEVELS = [
    { name: 'O coração do sertão', biome: 'desert', width: 3650,
      hint: 'Bem-vindo ao sertão! Pule com Espaço e lance açaí com X.',
      grounds: [[0, 740], [860, 720], [1710, 730], [2570, 1080]],
      platforms: [
        { x: 360, y: 502, w: 165 }, { x: 650, y: 418, w: 145 },
        { x: 1070, y: 501, w: 170 }, { x: 1400, y: 475, w: 135, move: { axis: 'x', range: 90, period: 4 } },
        { x: 1860, y: 493, w: 170 }, { x: 2200, y: 430, w: 150 },
        { x: 2460, y: 490, w: 120, move: { axis: 'y', range: 45, period: 3.6 } },
        { x: 2820, y: 497, w: 160 }, { x: 3110, y: 415, w: 150 }
      ],
      enemies: [{ x: 520, min: 445, max: 685, speed: 60 }, { x: 1130, min: 930, max: 1390, speed: 70 },
        { x: 2020, min: 1820, max: 2300, speed: 75 }, { x: 2950, min: 2730, max: 3200, speed: 85 }],
      items: [{ x: 1200, y: 563, type: 'heart' }, { x: 3160, y: 365, type: 'gold' }],
      checkpoints: [1000, 1850, 2740]
    },
    { name: 'Feira do sol rachado', biome: 'desert', variant: 'market', width: 3820,
      hint: 'A feira está agitada! Copinhos do mal não entram no seu açaí.',
      grounds: [[0, 650], [790, 780], [1720, 620], [2500, 1320]],
      platforms: [
        { x: 300, y: 503, w: 150 }, { x: 570, y: 418, w: 135 },
        { x: 830, y: 492, w: 140, move: { axis: 'x', range: 65, period: 4 } },
        { x: 1160, y: 492, w: 150 }, { x: 1510, y: 490, w: 130, move: { axis: 'y', range: 45, period: 4 } },
        { x: 1900, y: 501, w: 145 }, { x: 2190, y: 423, w: 130 },
        { x: 2390, y: 488, w: 140, move: { axis: 'x', range: 80, period: 3.8 } },
        { x: 2780, y: 495, w: 140 }, { x: 3080, y: 420, w: 130 }, { x: 3390, y: 497, w: 150 }
      ],
      enemies: [{ x: 440, min: 340, max: 560, speed: 75 }, { x: 1020, min: 890, max: 1430, speed: 80 },
        { x: 2020, min: 1820, max: 2240, speed: 90 }, { x: 2830, min: 2640, max: 3030, speed: 95 },
        { x: 3320, min: 3150, max: 3590, speed: 90 }],
      items: [{ x: 1210, y: 561, type: 'heart' }, { x: 3125, y: 367, type: 'gold' }],
      checkpoints: [880, 1810, 2630]
    },
    { name: 'Os caminhos da Amazônia', biome: 'forest', width: 4220,
      hint: 'A floresta se move! Use as plataformas e encontre os frutos dourados.',
      grounds: [[0, 610], [755, 555], [1470, 710], [2350, 540], [3060, 1160]],
      platforms: [
        { x: 330, y: 500, w: 135 }, { x: 620, y: 505, w: 125, move: { axis: 'x', range: 90, period: 3.4 } },
        { x: 900, y: 418, w: 130 }, { x: 1220, y: 480, w: 140, move: { axis: 'y', range: 70, period: 3.8 } },
        { x: 1580, y: 496, w: 140 }, { x: 1880, y: 408, w: 145 },
        { x: 2160, y: 480, w: 140, move: { axis: 'x', range: 115, period: 3.8 } },
        { x: 2570, y: 496, w: 140 }, { x: 2880, y: 480, w: 140, move: { axis: 'y', range: 60, period: 3.4 } },
        { x: 3220, y: 495, w: 140 }, { x: 3500, y: 407, w: 145 }, { x: 3770, y: 490, w: 140 }
      ],
      enemies: [{ x: 415, min: 290, max: 560, speed: 87 }, { x: 970, min: 800, max: 1200, speed: 95 },
        { x: 1750, min: 1540, max: 2070, speed: 100 }, { x: 2570, min: 2400, max: 2820, speed: 110 },
        { x: 3450, min: 3170, max: 3650, speed: 115 }, { x: 3840, min: 3740, max: 4040, speed: 100 }],
      items: [{ x: 945, y: 365, type: 'gold' }, { x: 1670, y: 560, type: 'heart' }, { x: 3545, y: 354, type: 'gold' }],
      checkpoints: [820, 1570, 2420, 3180]
    },
    { name: 'O igarapé dos atalhos', biome: 'forest', variant: 'river', width: 4450,
      hint: 'Siga as plataformas sobre o igarapé. Todo atalho tem uma história!',
      grounds: [[0, 560], [725, 570], [1460, 650], [2280, 590], [3040, 1410]],
      platforms: [
        { x: 310, y: 496, w: 120 }, { x: 540, y: 491, w: 125, move: { axis: 'x', range: 85, period: 3.6 } },
        { x: 870, y: 497, w: 125 }, { x: 1160, y: 480, w: 130, move: { axis: 'y', range: 65, period: 3.4 } },
        { x: 1550, y: 493, w: 130 }, { x: 1820, y: 410, w: 120 },
        { x: 2050, y: 490, w: 135, move: { axis: 'x', range: 100, period: 3.5 } },
        { x: 2480, y: 492, w: 130 }, { x: 2820, y: 485, w: 130, move: { axis: 'y', range: 50, period: 3.3 } },
        { x: 3210, y: 491, w: 130 }, { x: 3480, y: 408, w: 120 }, { x: 3810, y: 493, w: 140 }
      ],
      enemies: [{ x: 380, min: 230, max: 485, speed: 95 }, { x: 960, min: 785, max: 1200, speed: 100 },
        { x: 1710, min: 1520, max: 1970, speed: 110 }, { x: 2530, min: 2340, max: 2770, speed: 115 },
        { x: 3440, min: 3200, max: 3650, speed: 120 }, { x: 3940, min: 3770, max: 4210, speed: 115 }],
      items: [{ x: 1865, y: 358, type: 'gold' }, { x: 2490, y: 560, type: 'heart' }, { x: 3525, y: 356, type: 'gold' }],
      checkpoints: [800, 1540, 2360, 3170]
    },
    { name: 'A orla dos ventos', biome: 'coast', variant: 'boardwalk', width: 4590,
      hint: 'Bem-vindo a Santa Catarina! Os caranguejos não dão passagem.',
      grounds: [[0, 600], [770, 590], [1530, 680], [2390, 610], [3170, 1420]],
      platforms: [
        { x: 320, y: 500, w: 130 }, { x: 585, y: 488, w: 120, move: { axis: 'x', range: 80, period: 3.3 } },
        { x: 900, y: 489, w: 125 }, { x: 1220, y: 480, w: 125, move: { axis: 'y', range: 55, period: 3.2 } },
        { x: 1650, y: 498, w: 130 }, { x: 1910, y: 414, w: 125 },
        { x: 2150, y: 490, w: 130, move: { axis: 'x', range: 100, period: 3.4 } },
        { x: 2550, y: 490, w: 120 }, { x: 2910, y: 484, w: 135, move: { axis: 'x', range: 90, period: 3.1 } },
        { x: 3310, y: 493, w: 135 }, { x: 3590, y: 410, w: 120 }, { x: 3930, y: 496, w: 140 }
      ],
      enemies: [{ x: 390, min: 260, max: 515, speed: 105 }, { x: 1000, min: 840, max: 1250, speed: 115 },
        { x: 1770, min: 1600, max: 2090, speed: 120 }, { x: 2690, min: 2470, max: 2880, speed: 125 },
        { x: 3480, min: 3290, max: 3710, speed: 130 }, { x: 4030, min: 3870, max: 4350, speed: 130 }],
      items: [{ x: 1955, y: 362, type: 'gold' }, { x: 2690, y: 560, type: 'heart' }, { x: 3635, y: 358, type: 'gold' }],
      checkpoints: [840, 1620, 2460, 3280]
    },
    { name: 'O último pôr do sol', biome: 'coast', width: 4840,
      hint: 'Thaís está perto! Acerte o Profeta com açaí ou pule sobre ele.',
      grounds: [[0, 580], [750, 530], [1450, 620], [2250, 620], [3050, 1790]],
      platforms: [
        { x: 310, y: 496, w: 120 }, { x: 565, y: 480, w: 125, move: { axis: 'x', range: 95, period: 3.2 } },
        { x: 890, y: 480, w: 120, move: { axis: 'y', range: 58, period: 3 } },
        { x: 1240, y: 490, w: 115, move: { axis: 'x', range: 90, period: 3.2 } },
        { x: 1580, y: 494, w: 115 }, { x: 1840, y: 412, w: 120 },
        { x: 2040, y: 495, w: 135, move: { axis: 'x', range: 110, period: 3.2 } },
        { x: 2440, y: 486, w: 120, move: { axis: 'y', range: 62, period: 3.1 } },
        { x: 2820, y: 490, w: 130, move: { axis: 'x', range: 110, period: 3.4 } },
        { x: 3200, y: 492, w: 125 }, { x: 3490, y: 406, w: 130 }, { x: 3830, y: 495, w: 145 }
      ],
      enemies: [{ x: 360, min: 250, max: 510, speed: 100 }, { x: 920, min: 810, max: 1200, speed: 120 },
        { x: 1660, min: 1530, max: 1980, speed: 120 }, { x: 2470, min: 2320, max: 2790, speed: 130 },
        { x: 3280, min: 3150, max: 3540, speed: 140 }, { x: 3790, min: 3630, max: 3990, speed: 125 },
        { x: 4310, min: 4130, max: 4510, speed: 105, type: 'boss', hp: 6 }],
      items: [{ x: 1890, y: 359, type: 'gold' }, { x: 3210, y: 560, type: 'heart' },
        { x: 3540, y: 355, type: 'gold' }, { x: 4020, y: 565, type: 'heart' }],
      checkpoints: [810, 1530, 2330, 3150, 4050]
    }
  ];

  // Roteiros originais. Cada fala é [personagem, texto]. A física pausa nas conversas.
  const STORIES = [
    { intro: [['wanzeller','Sequestrar a Thaís? O Profeta arrumou problema com a realeza.'], ['thais','Wanzeller, tá me ouvindo pelo rádio? Ele está indo em direção à floresta!'], ['wanzeller','Tô indo! Coroa na cabeça, açaí na mão... protetor solar eu esqueci.']],
      middle: [['wanzeller','Esse sol tá tão forte que meu superpoder já virou vitamina.'], ['thais','Então anda logo, majestade. E bebe água também.']] },
    { intro: [['wanzeller','Cheguei na feira. Será que alguém vende um atalho?'], ['profeta','Meus capangas fecharam todas as saídas!'], ['wanzeller','E o povo da feira deixou? Tu vai ouvir da dona da barraca.']],
      middle: [['thais','Vi uma placa: Amazônia, siga em frente!'], ['wanzeller','Boa! A outra dizia SEM FIADO. Essa doeu mais.']] },
    { intro: [['wanzeller','Amazônia! Agora sim: a casa do meu superpoder.'], ['thais','Cuidado com as plataformas. Algumas estão se mexendo.'], ['wanzeller','Até a ponte tá fazendo exercício. Só eu que queria um descanso.']],
      middle: [['thais','Você tá seguindo as pistas que eu deixei?'], ['wanzeller','Tô seguindo os açaís. Mas gostei da sua versão.']] },
    { intro: [['thais','O rádio tá falhando. Pega o caminho do igarapé!'], ['wanzeller','Esse é o atalho? Tem mais buraco que caminho.'], ['thais','É o atalho com emoção. Confia!']],
      middle: [['wanzeller','Passei! Minha capa agora tem cheiro de aventura.'], ['thais','Isso se chama umidade, Wanzeller.']] },
    { intro: [['wanzeller','Santa Catarina! Sol, mar e... um vento levando minha coroa!'], ['thais','Estamos perto de um farol. Eu consigo ouvir as ondas.'], ['wanzeller','Aguenta firme. Só vou negociar com esses caranguejos.']],
      middle: [['wanzeller','Ofereci açaí. O caranguejo respondeu com uma pinçada.'], ['thais','Negociação encerrada. Vai pulando!']] },
    { intro: [['thais','Eu tô aqui, perto do farol! Ele montou uma barreira.'], ['wanzeller','Já atravessei o Brasil. Uma barreira não vai estragar nosso encontro.'], ['profeta','Vocês ainda não entenderam meu grande plano!']],
      middle: [['wanzeller','Thaís, já tô vendo o farol.'], ['thais','E eu já tô vendo quem vai pagar o açaí depois disso tudo.']] }
  ];
  const BOSS_LINES = [['profeta','Tudo faz parte de um plano maior!'], ['wanzeller','Maior que um copo de um litro? Duvido.'], ['thais','Menos discurso, mais açaí. Acerta ele, Wanzeller!']];
  const END_LINES = [['thais','Você veio mesmo por mim... até o fim do Brasil.'], ['wanzeller','Por você eu ia até onde o mapa acabasse.'], ['thais','Fofo. Agora vamos comer um açaí antes que derreta.'], ['wanzeller','Combinado. Hoje a cobertura é por minha conta!']];
  const SPEAKERS = { wanzeller: { name: 'Wanzeller', row: 0 }, thais: { name: 'Thaís · no rádio', row: 1 }, profeta: { name: 'O Profeta', row: 2 } };

  let width = 1280, state = 'menu', levelIndex = 0, level, player;
  let score = 0, lives = MAX_LIVES, best = 0, camera = 0;
  let clock = 0, elapsed = 0, accumulator = 0, lastFrame = 0, toastTime = 0;
  let checkpoint = 100, jumpBuffer = 0, jumpReleased = false, fireQueued = false;
  let particles = [], shots = [], enemyShots = [], floatingTexts = [];
  let audioContext = null, soundEnabled = true, modalAction = null;
  let platforms = [], enemies = [], items = [];
  let dialogue = null, middleSeen = false, bossSeen = false;
  const pressed = new Set();
  const touch = new Map();
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { best = Number(localStorage.getItem('wanzeller-best')) || 0; } catch { /* Armazenamento privado: jogo segue normalmente. */ }
  ui.bestScore.textContent = formatScore(best);

  function formatScore(value) { return String(value).padStart(4, '0'); }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
  function approach(value, target, amount) { return value < target ? Math.min(value + amount, target) : Math.max(value - amount, target); }
  function overlaps(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function visible(element, show) { element.classList.toggle('hidden', !show); }
  function held(action) {
    const mapping = { left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'], jump: ['Space', 'ArrowUp', 'KeyW'], power: ['KeyX', 'KeyK'] };
    return mapping[action].some(key => pressed.has(key)) || [...touch.values()].includes(action);
  }
  function clearInput() { pressed.clear(); touch.clear(); jumpBuffer = 0; fireQueued = false; jumpReleased = false; }
  function saveBest() {
    if (score <= best) return;
    best = score;
    ui.bestScore.textContent = formatScore(best);
    try { localStorage.setItem('wanzeller-best', String(best)); } catch { /* O recorde ainda vale nesta sessão. */ }
  }

  // Web Audio só é iniciado por uma interação do usuário, inclusive no celular.
  function unlockAudio() {
    if (!soundEnabled) return;
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    } catch { soundEnabled = false; updateSoundButton(); }
  }
  function tone(frequency, duration = 0.1, type = 'sine', delay = 0, endFrequency) {
    if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
    const start = audioContext.currentTime + delay;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (endFrequency) oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.065, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.start(start); oscillator.stop(start + duration + 0.02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function sound(kind) {
    if (kind === 'jump') tone(270, 0.14, 'sine', 0, 590);
    if (kind === 'coin') { tone(720, 0.09); tone(1080, 0.13, 'sine', 0.06); }
    if (kind === 'power') tone(640, 0.17, 'triangle', 0, 200);
    if (kind === 'hit') tone(150, 0.2, 'triangle', 0, 70);
    if (kind === 'enemy') tone(330, 0.16, 'triangle', 0, 110);
    if (kind === 'win') [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.24, 'sine', i * 0.12));
    if (kind === 'lose') [330, 247, 165].forEach((f, i) => tone(f, 0.25, 'triangle', i * 0.17));
  }
  function updateSoundButton() {
    $('soundButton').textContent = soundEnabled ? '♫' : '♪';
    $('soundButton').style.opacity = soundEnabled ? '1' : '.45';
    $('soundButton').setAttribute('aria-label', soundEnabled ? 'Desativar som' : 'Ativar som');
    $('soundButton').setAttribute('aria-pressed', String(soundEnabled));
  }

  function resize() {
    const rect = stage.getBoundingClientRect();
    width = clamp(VIEW_HEIGHT * rect.width / rect.height, 410, 1800);
    // Resolução interna de 360 linhas, ampliada por vizinho mais próximo no CSS.
    canvas.width = Math.round(width / 2);
    canvas.height = VIEW_HEIGHT / 2;
    ctx.imageSmoothingEnabled = false;
  }
  new ResizeObserver(resize).observe(stage);

  function loadLevel(index) {
    levelIndex = index; level = LEVELS[index]; elapsed = 0; camera = 0; checkpoint = 100;
    dialogue = null; middleSeen = false; bossSeen = false; visible(ui.dialogueLayer, false);
    player = { x: 100, y: 530, w: 36, h: 64, vx: 0, vy: 0, facing: 1, onGround: false,
      support: null, coyote: 0, invulnerable: 1.3, cooldown: 0 };
    platforms = level.grounds.map(([x, w]) => ({ x, y: 610, w, h: 160, ground: true, dx: 0, dy: 0 }));
    for (const p of level.platforms) platforms.push({ ...p, originX: p.x, originY: p.y, h: 24, dx: 0, dy: 0 });
    enemies = level.enemies.map((e, i) => ({ ...e, y: e.type === 'boss' ? 530 : 566,
      w: e.type === 'boss' ? 58 : 42, h: e.type === 'boss' ? 80 : 44,
      direction: i % 2 ? -1 : 1, hp: e.hp || 1, maxHp: e.hp || 1, variant: level.biome === 'coast' ? 'crab' : 'cup', hitTimer: 0, shootTimer: 2.5, dead: false }));
    items = level.items.map(item => ({ ...item, w: 26, h: 26, collected: false }));
    // Trilhas de açaí mostram caminhos no solo e nas plataformas.
    for (const [x, w] of level.grounds) {
      for (let px = x + 160; px < x + w - 70; px += 175) items.push({ x: px, y: 550, w: 24, h: 24, type: 'berry', collected: false });
    }
    platforms.filter(p => !p.ground).forEach(p => {
      for (let i = 0; i < 3; i++) items.push({ x: p.x + 22 + i * 32, y: p.y - 48,
        w: 24, h: 24, type: 'berry', platform: p, offset: 22 + i * 32, collected: false });
    });
    particles = []; shots = []; enemyShots = []; floatingTexts = []; clearInput();
    state = 'playing';
    visible(ui.startScreen, false); visible(ui.modalLayer, false); visible(ui.hud, true); visible(ui.touchControls, true);
    ui.levelName.textContent = level.name;
    ui.levelNumber.textContent = `FASE ${String(index + 1).padStart(2, '0')} / ${String(LEVELS.length).padStart(2, '0')}`;
    for (let i = 0; i < LEVELS.length; i++) $(`chapter${i}`)?.classList.toggle('active', i === index);
    const touchHint = index === 0 && matchMedia('(pointer:coarse),(max-width:700px)').matches;
    showToast(touchHint ? 'Use ◀ ▶ para andar, ↑ para pular e ✦ para lançar açaí.' : level.hint, 5);
    updateHUD(); canvas.focus({ preventScroll: true });
    beginDialogue(STORIES[index]?.intro || [], () => { state = 'playing'; showToast(touchHint ? '◀ ▶ andar · ↑ pular · ✦ lançar açaí' : level.hint, 5); });
  }
  function startGame() { unlockAudio(); score = 0; lives = MAX_LIVES; loadLevel(0); }
  function updateHUD() {
    ui.score.textContent = formatScore(score);
    ui.lives.textContent = '♥ '.repeat(lives) + '♡ '.repeat(MAX_LIVES - lives);
    ui.lives.setAttribute('aria-label', `${lives} ${lives === 1 ? 'vida' : 'vidas'}`);
  }
  function showToast(message, duration = 3) { ui.levelToast.textContent = message; toastTime = duration; visible(ui.levelToast, true); }
  function beginDialogue(lines, after = () => { state = 'playing'; }) {
    if (!lines.length) { after(); return; }
    dialogue = { lines, index: 0, after }; state = 'dialogue'; clearInput();
    visible(ui.dialogueLayer, true); visible(ui.touchControls, false); visible(ui.levelToast, false);
    showDialogueLine(); ui.dialogueNext.focus({ preventScroll: true });
  }
  function showDialogueLine() {
    const [who, message] = dialogue.lines[dialogue.index], speaker = SPEAKERS[who];
    ui.dialogueName.textContent = who === 'thais' && dialogue.lines === END_LINES ? 'Thaís' : speaker.name;
    ui.dialogueText.textContent = message;
    ui.dialogueCount.textContent = `${dialogue.index + 1} / ${dialogue.lines.length}`;
    ui.dialogueNext.textContent = dialogue.index === dialogue.lines.length - 1 ? 'Vamos lá! →' : 'Continuar →';
    art?.portrait(ui.dialoguePortrait, speaker.row);
    tone(who === 'thais' ? 620 : who === 'profeta' ? 210 : 380, .06, 'square');
  }
  function advanceDialogue() {
    if (state !== 'dialogue' || !dialogue) return;
    if (++dialogue.index >= dialogue.lines.length) finishDialogue(); else showDialogueLine();
  }
  function finishDialogue() {
    if (!dialogue) return;
    const after = dialogue.after; dialogue = null; clearInput(); visible(ui.dialogueLayer, false);
    after(); visible(ui.touchControls, state === 'playing');
    if (state === 'playing') canvas.focus({ preventScroll: true });
  }
  function showModal({ title, description, eyebrow, icon, button, action, result = false }) {
    clearInput(); visible(ui.modalLayer, true); visible(ui.touchControls, false); visible(ui.levelToast, false);
    ui.modalTitle.textContent = title; ui.modalDescription.textContent = description;
    ui.modalEyebrow.textContent = eyebrow; ui.modalIcon.textContent = icon;
    ui.modalPrimary.textContent = button; modalAction = action;
    visible(ui.resultScore, result);
    ui.resultScore.textContent = `${formatScore(score)} pontos · Recorde ${formatScore(best)}`;
    ui.modalPrimary.focus({ preventScroll: true });
  }
  function pauseGame() {
    if (state !== 'playing') return;
    state = 'paused';
    showModal({ title: 'Pausa para o açaí', description: 'Recarregue as energias. Thaís e a aventura esperam por você.',
      eyebrow: 'TODO HERÓI MERECE UM RESPIRO', icon: '☕', button: 'Continuar aventura →', action: resumeGame });
  }
  function resumeGame() { if (state !== 'paused') return; state = 'playing'; clearInput(); visible(ui.modalLayer, false); visible(ui.touchControls, true); canvas.focus({ preventScroll: true }); }
  function returnToMenu() {
    dialogue = null; visible(ui.dialogueLayer, false);
    saveBest(); state = 'menu'; clearInput(); visible(ui.startScreen, true); visible(ui.modalLayer, false);
    visible(ui.hud, false); visible(ui.touchControls, false); visible(ui.levelToast, false);
    $('playButton').focus({ preventScroll: true });
  }
  function winLevel() {
    score += levelIndex === LEVELS.length - 1 ? 1000 : 500; updateHUD(); saveBest(); sound('win');
    const final = levelIndex === LEVELS.length - 1;
    const showResult = () => {
      state = final ? 'complete' : 'won';
      showModal({ title: final ? 'Um reencontro à beira-mar!' : 'Mais perto de Thaís!',
      description: final ? 'O Profeta foi derrotado. Wanzeller e Thaís seguem juntos, livres para escolher o próprio caminho.' :
        `Próxima parada: ${LEVELS[levelIndex + 1].name}. Suas vidas serão renovadas. A aventura continua!`,
      eyebrow: final ? 'MISSÃO CUMPRIDA · THAÍS ESTÁ A SALVO' : `CAPÍTULO 0${levelIndex + 1} CONCLUÍDO`, icon: final ? '♛' : '✦',
      button: final ? 'Jogar novamente →' : 'Próxima fase →', result: true,
      action: final ? startGame : () => { lives = MAX_LIVES; loadLevel(levelIndex + 1); } });
    };
    if (final) beginDialogue(END_LINES, showResult); else showResult();
  }
  function loseGame() {
    state = 'lost'; saveBest(); sound('lose');
    showModal({ title: 'A coragem não acaba.', description: 'Até o Rei do Açaí precisa tentar de novo. Volte ao sertão e escreva um novo final para esta aventura.',
      eyebrow: 'FIM DE JOGO · UM NOVO COMEÇO ESPERA', icon: '♡', button: 'Tentar novamente →', action: startGame, result: true });
  }

  function burst(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) particles.push({ x, y, vx: (Math.random() - .5) * 230,
      vy: -Math.random() * 240 - 30, life: .45 + Math.random() * .3, color, size: 3 + Math.random() * 4 });
  }
  function addPoints(points, x, y, label) {
    score += points; updateHUD(); floatingTexts.push({ x, y, text: label || `+${points}`, life: .85 });
  }
  function damage(fromX, fell = false) {
    if (player.invulnerable > 0 && !fell) return;
    lives--; sound('hit'); updateHUD(); burst(player.x + 18, player.y + 25, '#bb6483', 14);
    if (lives <= 0) { loseGame(); return; }
    player.invulnerable = 1.8;
    if (fell) {
      player.x = checkpoint; player.y = 525; player.vx = 0; player.vy = 0;
      camera = clamp(player.x - width * .34, 0, Math.max(0, level.width - width));
      enemyShots = []; showToast('Vamos de novo! Você voltou ao último ponto de retorno.', 2.5);
    } else { player.vx = player.x < fromX ? -300 : 300; player.vy = -370; }
    player.onGround = false; player.support = null;
  }
  function hitEnemy(enemy) {
    if (enemy.dead || enemy.hitTimer > 0) return;
    enemy.hp--; enemy.hitTimer = .32; burst(enemy.x + enemy.w / 2, enemy.y + 20, '#a975d0');
    if (enemy.hp <= 0) {
      enemy.dead = true; addPoints(enemy.type === 'boss' ? 600 : 100, enemy.x, enemy.y); sound('enemy');
      if (enemy.type === 'boss') showToast('O Profeta foi vencido! Vá até Thaís.', 5);
    } else sound('hit');
  }
  function fire() {
    if (player.cooldown > 0) return;
    player.cooldown = .32;
    shots.push({ x: player.x + (player.facing > 0 ? player.w : -16), y: player.y + 22,
      w: 18, h: 18, vx: player.facing * 640, life: .9 });
    sound('power');
  }

  // Passo fixo: física consistente em monitores de 30, 60 ou 144 Hz.
  function update(dt) {
    if (state !== 'playing') return;
    elapsed += dt;
    if (toastTime > 0) { toastTime -= dt; if (toastTime <= 0) visible(ui.levelToast, false); }
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    player.cooldown = Math.max(0, player.cooldown - dt);
    jumpBuffer = Math.max(0, jumpBuffer - dt);

    for (const p of platforms) {
      const oldX = p.x, oldY = p.y;
      if (p.move) p[p.move.axis] = (p.move.axis === 'x' ? p.originX : p.originY) + Math.sin(elapsed * Math.PI * 2 / p.move.period) * p.move.range;
      p.dx = p.x - oldX; p.dy = p.y - oldY;
    }
    // Carrega o jogador com a plataforma em que está apoiado.
    if (player.support && player.onGround) { player.x += player.support.dx; player.y += player.support.dy; }
    const horizontal = Number(held('right')) - Number(held('left'));
    player.vx = approach(player.vx, horizontal * PHYSICS.speed, dt * (horizontal ? PHYSICS.acceleration : PHYSICS.friction));
    if (horizontal) player.facing = horizontal;
    if (player.onGround) player.coyote = PHYSICS.coyoteTime;
    else player.coyote = Math.max(0, player.coyote - dt);
    if (jumpBuffer > 0 && player.coyote > 0) {
      player.vy = -PHYSICS.jump; player.onGround = false; player.support = null; player.coyote = 0; jumpBuffer = 0;
      burst(player.x + 18, player.y + player.h, '#e5d5a7', 5); sound('jump');
    }
    // Soltar cedo produz um pulo curto. Segurar permite atingir a altura máxima.
    if (jumpReleased && player.vy < -230) player.vy *= .5;
    jumpReleased = false;
    if (held('power') || fireQueued) fire(); fireQueued = false;

    player.x += player.vx * dt;
    player.x = clamp(player.x, 0, level.width - player.w);
    // Plataformas elevadas são unidirecionais; paredes de terra são sólidas.
    for (const p of platforms) if (p.ground && overlaps(player, p)) {
      if (player.vx > 0) player.x = p.x - player.w;
      else if (player.vx < 0) player.x = p.x + p.w;
      player.vx = 0;
    }
    const previousBottom = player.y + player.h;
    player.vy = Math.min(PHYSICS.maxFall, player.vy + PHYSICS.gravity * dt);
    player.y += player.vy * dt;
    player.onGround = false; player.support = null;
    for (const p of platforms) {
      const oldTop = p.y - p.dy;
      if (player.vy >= 0 && player.x + player.w > p.x + 2 && player.x < p.x + p.w - 2 &&
          previousBottom <= oldTop + 5 && player.y + player.h >= p.y) {
        player.y = p.y - player.h; player.vy = 0; player.onGround = true; player.support = p;
      }
    }
    if (player.y > VIEW_HEIGHT + 130) { damage(0, true); if (state !== 'playing') return; }
    for (const x of level.checkpoints) if (player.x >= x && x > checkpoint && player.onGround && player.support?.ground) {
      checkpoint = x; showToast('Ponto de retorno alcançado ✦', 2); sound('coin');
      if (!middleSeen && STORIES[levelIndex]?.middle) { middleSeen = true; beginDialogue(STORIES[levelIndex].middle); return; }
    }
    if (!bossSeen && enemies.some(e => e.type === 'boss' && !e.dead && Math.abs(player.x - e.x) < 400) && player.onGround) {
      bossSeen = true; beginDialogue(BOSS_LINES); return;
    }

    for (const item of items) {
      if (item.collected) continue;
      if (item.platform) { item.x = item.platform.x + item.offset; item.y = item.platform.y - 48; }
      if (overlaps(player, item)) {
        item.collected = true;
        if (item.type === 'heart') { lives = Math.min(MAX_LIVES, lives + 1); addPoints(25, item.x, item.y, '+ vida'); }
        else addPoints(item.type === 'gold' ? 100 : 25, item.x, item.y);
        burst(item.x + 12, item.y + 12, item.type === 'gold' ? '#e4b94e' : '#a071c0', 7); sound('coin');
      }
    }
    for (const enemy of enemies) {
      if (enemy.dead) continue;
      enemy.hitTimer = Math.max(0, enemy.hitTimer - dt);
      enemy.x += enemy.direction * enemy.speed * dt;
      if (enemy.x < enemy.min || enemy.x > enemy.max) { enemy.x = clamp(enemy.x, enemy.min, enemy.max); enemy.direction *= -1; }
      if (enemy.type === 'boss' && Math.abs(player.x - enemy.x) < 780) {
        enemy.shootTimer -= dt;
        if (enemy.shootTimer <= 0) {
          enemy.shootTimer = 1.8;
          enemyShots.push({ x: enemy.x + 20, y: enemy.y + 40, w: 22, h: 22, vx: player.x < enemy.x ? -240 : 240, life: 4 });
        }
      }
      if (overlaps(player, enemy)) {
        if (player.vy > 80 && previousBottom <= enemy.y + 18) {
          hitEnemy(enemy); player.y = enemy.y - player.h; player.vy = -480; player.onGround = false; player.support = null;
        } else damage(enemy.x + enemy.w / 2);
        if (state !== 'playing') return;
      }
    }
    for (const shot of shots) {
      shot.x += shot.vx * dt; shot.life -= dt;
      for (const enemy of enemies) if (!enemy.dead && shot.life > 0 && overlaps(shot, enemy)) { hitEnemy(enemy); shot.life = 0; }
      if (platforms.some(p => p.ground && overlaps(shot, p))) shot.life = 0;
    }
    for (const shot of enemyShots) {
      shot.x += shot.vx * dt; shot.life -= dt;
      if (overlaps(shot, player)) { shot.life = 0; damage(shot.x); if (state !== 'playing') return; }
    }
    shots = shots.filter(s => s.life > 0); enemyShots = enemyShots.filter(s => s.life > 0);
    for (const particle of particles) { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.vy += 500 * dt; particle.life -= dt; }
    particles = particles.filter(p => p.life > 0);
    for (const text of floatingTexts) { text.y -= dt * 45; text.life -= dt; }
    floatingTexts = floatingTexts.filter(t => t.life > 0);
    const targetCamera = clamp(player.x - width * .35, 0, Math.max(0, level.width - width));
    camera += (targetCamera - camera) * (1 - Math.exp(-7 * dt));
    if (player.x > level.width - 170 && player.onGround) {
      if (levelIndex < LEVELS.length - 1 || enemies.every(e => e.type !== 'boss' || e.dead)) winLevel();
      else if (toastTime <= 0) showToast('Derrote o Profeta para encontrar Thaís!', 3);
    }
  }

  // Primitivas vetoriais: todos os cenários e personagens são desenhados aqui.
  function roundRect(x, y, w, h, r, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
  function ellipse(x, y, rx, ry, color) { ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); ctx.fill(); }
  function polygon(points, color) { ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fill(); }
  function line(points, color, thickness = 2) { ctx.strokeStyle = color; ctx.lineWidth = thickness; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); }
  function textLabel(text, x, y, size, color, align = 'left', weight = 700) { ctx.font = `${weight} ${size}px "Segoe UI", sans-serif`; ctx.fillStyle = color; ctx.textAlign = align; ctx.fillText(text, x, y); }

  function cloud(x, y, scale = 1, alpha = .6) {
    if (art) { art.cloud(ctx, x, y, scale); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.globalAlpha = alpha;
    ellipse(0, 0, 50, 13, '#fffae8'); ellipse(-15, -10, 24, 19, '#fffae8'); ellipse(15, -15, 28, 23, '#fffae8'); ellipse(43, -3, 24, 12, '#fffae8'); ctx.restore();
  }
  function cactus(x, groundY, scale = 1, color = '#6e8756') {
    if (art) { art.cactus(ctx, x, groundY, scale); return; }
    ctx.save(); ctx.translate(x, groundY); ctx.scale(scale, scale);
    line([[0, 0], [0, -107]], color, 20);
    line([[-2, -39], [-32, -39], [-32, -76]], color, 15);
    line([[4, -57], [30, -57], [30, -96]], color, 14);
    line([[-3, -9], [-3, -97]], '#b1b576', 2);
    line([[-29, -44], [-29, -70]], '#9eab6b', 2);
    ellipse(0, 2, 24, 5, '#53674030'); ctx.restore();
  }
  function palm(x, y, scale = 1, forest = false) {
    if (art) { art.palm(ctx, x, y, scale); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    line([[0, 0], [8, -55], [5, -125], [22, -205]], forest ? '#516e48' : '#a5976b', 15);
    for (let i = 0; i < 7; i++) line([[1 + i * 2, -20 - i * 25], [12 + i * 2, -22 - i * 25]], '#e1cda05a', 3);
    const leafColor = forest ? '#306e54' : '#69998b';
    for (let i = 0; i < 7; i++) {
      ctx.save(); ctx.translate(22, -205); ctx.rotate(-2.65 + i * .6);
      ctx.fillStyle = leafColor; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(45, -30, 105, 28); ctx.quadraticCurveTo(45, 2, 0, 0); ctx.fill(); ctx.restore();
    }
    ellipse(21, -200, 11, 12, '#876d4d'); ctx.restore();
  }
  function scenery(biome, cam = 0, menu = false) {
    if (art) { art.scene(ctx, biome, width, cam, reducedMotion ? 0 : clock, menu ? 'village' : level.variant); return; }
    const p = palette[biome];
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT); sky.addColorStop(0, p.sky); sky.addColorStop(1, p.horizon);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, width, VIEW_HEIGHT);
    const sunX = menu ? width * .72 : width * .8;
    ellipse(sunX, menu ? 160 : 128, 89, 89, `${p.sun}30`); ellipse(sunX, menu ? 160 : 128, 64, 64, `${p.sun}70`); ellipse(sunX, menu ? 160 : 128, 44, 44, p.sun);
    const drift = reducedMotion ? 0 : clock * 4;
    for (let i = -1; i < 6; i++) cloud(i * 360 - ((cam * .09 + drift) % 360), 108 + (i % 3) * 39, .8 + (i % 2) * .2, .44);
    // Camadas de paralaxe: relevo distante, montanhas e vegetação.
    for (let layer = 0; layer < 2; layer++) {
      const spacing = layer ? 430 : 600, offset = cam * (layer ? .22 : .1);
      for (let i = -1; i < Math.ceil(width / spacing) + 2; i++) {
        const x = i * spacing - offset % spacing;
        if (biome === 'desert') {
          polygon([[x - 160, 590], [x + 30, 343 + layer * 95], [x + 75, 318 + layer * 95], [x + 152, 318 + layer * 95], [x + 205, 430 + layer * 60], [x + 290, 437 + layer * 65], [x + 450, 630]], layer ? p.near : p.far);
          line([[x + 80, 350 + layer * 95], [x + 138, 350 + layer * 95]], '#f4d5a533', 4);
        } else {
          ctx.fillStyle = layer ? p.near : p.far; ctx.beginPath(); ctx.moveTo(x - 190, 620);
          ctx.bezierCurveTo(x - 60, 250 + layer * 130, x + 70, 220 + layer * 160, x + 210, 520);
          ctx.bezierCurveTo(x + 280, 400, x + 380, 360, x + 520, 620); ctx.closePath(); ctx.fill();
        }
      }
    }
    if (biome === 'coast') {
      ctx.fillStyle = p.water; ctx.fillRect(0, 476, width, 244);
      for (let i = 0; i < 18; i++) { const x = (i * 139 - cam * .3 + Math.sin(clock + i) * 10) % (width + 200); line([[x, 510 + i % 5 * 27], [x + 46, 510 + i % 5 * 27]], '#dcf5ec66', 3); }
      const lx = width * .72 - cam * .05 % 140;
      polygon([[lx, 483], [lx + 5, 351], [lx + 36, 351], [lx + 45, 483]], '#eff0df');
      polygon([[lx + 3, 385], [lx + 39, 385], [lx + 40, 409], [lx + 2, 409]], '#ae7a81');
      roundRect(lx, 333, 40, 24, 3, '#627e8a'); polygon([[lx - 5, 333], [lx + 20, 312], [lx + 46, 333]], '#957483');
      roundRect(lx + 9, 336, 22, 16, 2, '#f7eab3');
    }
    for (let i = -1; i < Math.ceil(width / 300) + 2; i++) {
      const x = i * 300 - cam * .4 % 300;
      if (biome === 'desert') cactus(x + 75, 595, .8 + (i % 3) * .16, '#8b9b6890');
      else palm(x + 70, 601, .85 + (i % 3) * .14, biome === 'forest');
    }
    // Pequenos pássaros desenhados em V.
    for (let i = 0; i < 4; i++) { const x = width * .55 + i * 44 - cam * .03; const y = 216 + Math.sin(i * 2) * 28;
      line([[x - 6, y], [x, y + 4], [x + 7, y]], biome === 'desert' ? '#a88355' : '#648b89', 1.7); }
  }
  function drawPlatform(p, biome) {
    if (art) { art.platform(ctx, p, biome); return; }
    const colors = palette[biome];
    if (p.ground) {
      roundRect(p.x, p.y, p.w, p.h, [5, 5, 0, 0], colors.soil);
      ctx.save(); ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
      for (let i = 0; i < p.w / 70; i++) polygon([[p.x + i * 70, p.y + 23], [p.x + 26 + i * 70, p.y + 104], [p.x + 61 + i * 70, p.y + 28]], '#ffffff0c');
      for (let i = 0; i < p.w / 44; i++) ellipse(p.x + i * 44 + 16, p.y + 40 + i % 3 * 23, 5, 2.5, '#67442d22');
      ctx.restore();
      roundRect(p.x, p.y, p.w, 17, 5, colors.edge); roundRect(p.x, p.y - 5, p.w, 10, 4, colors.grass);
      for (let i = 20; i < p.w; i += 57) line([[p.x + i, p.y], [p.x + i - 4, p.y - 10], [p.x + i + 2, p.y - 4], [p.x + i + 6, p.y - 13]], colors.grass, 2);
    } else {
      ellipse(p.x + p.w / 2, p.y + 34, p.w * .4, 7, '#33482a13');
      polygon([[p.x, p.y + 5], [p.x + p.w, p.y + 5], [p.x + p.w - 16, p.y + 31], [p.x + 18, p.y + 34]], colors.soil);
      roundRect(p.x, p.y, p.w, 11, 5, colors.edge); roundRect(p.x - 3, p.y - 5, p.w + 6, 8, 4, colors.grass);
      if (p.move) { const center = p.x + p.w / 2; textLabel(p.move.axis === 'x' ? '↔' : '↕', center, p.y + 25, 16, '#ffedb9', 'center'); }
      for (let i = 15; i < p.w - 10; i += 29) line([[p.x + i, p.y - 3], [p.x + i + 3, p.y - 9]], colors.grass, 2);
    }
  }

  function drawHero(x, y, scale = 1, facing = 1, walking = false, pose = false) {
    const frame = pose || (state !== 'menu' && player?.cooldown > .16) ? 3 : walking ? 1 + Math.floor(clock * 9) % 2 : 0;
    if (art?.sprite(ctx, 0, frame, x + 18 * scale, y + 64 * scale, 96 * scale, facing)) return;
    ctx.save(); ctx.translate(x + 18 * scale, y + 32 * scale); ctx.scale(scale * facing, scale); ctx.translate(-18, -32);
    const stride = walking ? Math.sin(clock * 15) * 5 : 0;
    // Capa, botas, roupa, braços, rosto e coroa.
    ctx.fillStyle = '#8542af'; ctx.beginPath(); ctx.moveTo(8, 24); ctx.quadraticCurveTo(-4, 42, -15 - Math.sin(clock * 5) * 3, 52); ctx.quadraticCurveTo(4, 58, 13, 45); ctx.closePath(); ctx.fill();
    line([[12, 46], [10 - stride, 59]], '#3d4541', 10); line([[26, 46], [28 + stride, 59]], '#3d4541', 10);
    roundRect(4 - stride, 56, 14, 8, 4, '#55423d'); roundRect(23 + stride, 56, 15, 8, 4, '#55423d');
    roundRect(5, 24, 30, 28, 9, '#eee9e2');
    roundRect(10, 25, 20, 23, 5, '#f8f5f1');
    roundRect(5, 46, 30, 5, 2, '#e5b54d'); ellipse(21, 48, 4, 4, '#f6cf68');
    line([[7, 30], [0, 42 + stride / 2]], '#a96943', 9);
    line([[32, 30], [40, pose ? 30 : 42 - stride / 2]], '#b97c50', 9);
    ellipse(0, 43 + stride / 2, 5, 5, '#be8258'); ellipse(40, pose ? 30 : 43 - stride / 2, 5, 5, '#ce9161');
    roundRect(4, 1, 30, 28, 11, '#ba7c50'); ellipse(4, 15, 4, 5, '#b67a50'); ellipse(34, 15, 4, 5, '#c68b5a');
    ctx.fillStyle = '#503c35'; ctx.beginPath(); ctx.moveTo(7, 17); ctx.quadraticCurveTo(18, 32, 32, 17); ctx.lineTo(30, 27); ctx.quadraticCurveTo(18, 34, 9, 25); ctx.closePath(); ctx.fill();
    roundRect(5, 0, 29, 7, 3, '#503c35');
    ellipse(15, 13, 2, 2.8, '#382f2d'); ellipse(28, 13, 2, 2.8, '#382f2d');
    ellipse(15.5, 12, .6, .7, '#fff7df'); ellipse(28.5, 12, .6, .7, '#fff7df');
    line([[12, 8], [17, 8]], '#594135', 1.8); line([[25, 8], [30, 9]], '#594135', 1.8);
    line([[19, 22], [24, 22]], '#f4d8b1', 2);
    polygon([[5, 3], [2, -12], [11, -7], [18, -19], [25, -7], [35, -12], [32, 3]], '#edbd51');
    roundRect(5, 0, 28, 5, 2, '#f6d16a'); ellipse(19, -5, 3, 4, '#9b58b2');
    polygon([[16, 33], [21, 30], [26, 34], [21, 41]], '#e9be66'); ellipse(21, 35, 2, 2, '#8850a9');
    if (pose) drawBerry(42, 21, 1.1, false);
    ctx.restore();
  }
  function drawBerry(x, y, scale = 1, gold = false) {
    if (art) { art.berry(ctx, x, y, scale, gold); return; }
    ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale);
    ellipse(0, 0, 17, 17, gold ? '#f3d47522' : '#bb8cdc17');
    const dark = gold ? '#d49a32' : '#6c3d96', light = gold ? '#e6b94c' : '#8150ac';
    ellipse(-5, 3, 6, 7, dark); ellipse(5, 3, 6, 7, light); ellipse(0, -3, 6.5, 6.5, light);
    ellipse(-2, -6, 2, 1.7, gold ? '#fff0ae' : '#c9a1e3');
    line([[1, -9], [4, -15]], '#66884e', 2); ellipse(7, -12, 5, 2.5, '#779b59'); ctx.restore();
  }
  function drawEnemy(enemy) {
    if (art && art.sheet.complete && art.sheet.naturalWidth) { art.enemy(ctx, enemy, clock); return; }
    const boss = enemy.type === 'boss';
    if (boss) {
      ctx.save(); ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h); ctx.scale(enemy.direction, 1);
      if (enemy.hitTimer > 0) ctx.globalAlpha = .5;
      ellipse(0, 1, 31, 6, '#1b25452a');
      polygon([[-22, -56], [-30, -4], [0, 0], [30, -4], [22, -56]], '#244c91');
      polygon([[-16, -53], [-19, -6], [0, -3], [19, -6], [16, -53]], '#f1e9e2');
      line([[-12, -48], [-24, -28]], '#ece7e8', 10); line([[12, -48], [24, -28]], '#ece7e8', 10);
      ellipse(-24, -27, 5, 5, '#ae795b'); ellipse(24, -27, 5, 5, '#ae795b');
      for (let i = -2; i <= 2; i++) ellipse(i * 7, -66 + (i % 2) * 3, 8, 22, '#443030');
      ellipse(0, -70, 15, 18, '#b47c60');
      line([[-12, -72], [-2, -69], [2, -71], [13, -70]], '#211e28', 4);
      ellipse(-7, -69, 2, 2, '#211e28'); ellipse(8, -69, 2, 2, '#211e28');
      roundRect(-18, -89, 36, 7, 3, '#f6f1e8');
      textLabel('✡', 0, -26, 20, '#dcb34a', 'center');
      ctx.restore();
      textLabel('O PROFETA', enemy.x + enemy.w / 2, enemy.y - 32, 10, '#244c91', 'center');
      roundRect(enemy.x - 8, enemy.y - 23, 74, 7, 3, '#fff8e0');
      roundRect(enemy.x - 7, enemy.y - 22, 72 * enemy.hp / 6, 5, 3, '#5479bd');
      return;
    }
    ctx.save(); ctx.translate(enemy.x + enemy.w / 2, enemy.y + enemy.h); ctx.scale(enemy.direction, 1);
    if (enemy.hitTimer > 0) ctx.globalAlpha = .5;
    const s = boss ? 1.6 : 1; ctx.scale(s, s);
    ellipse(0, 1, 23, 5, '#37453820');
    const stride = Math.sin(clock * 11) * 3;
    roundRect(-17 + stride, -8, 13, 8, 3, '#4d5354'); roundRect(5 - stride, -8, 13, 8, 3, '#4d5354');
    roundRect(-20, -40, 40, 33, 10, boss ? '#575263' : '#a77458');
    roundRect(-17, -35, 34, 17, 6, boss ? '#b0b8b2' : '#d4af7e');
    roundRect(-14, -32, 28, 11, 4, '#4a5050');
    ellipse(-6, -27, 3, 3, '#f8d975'); ellipse(8, -27, 3, 3, '#f8d975');
    line([[-10, -32], [-3, -29]], '#474249', 3); line([[4, -29], [12, -32]], '#474249', 3);
    if (boss) { roundRect(-16, -55, 32, 17, 3, '#424657'); roundRect(-24, -43, 48, 5, 2, '#424657'); roundRect(-16, -46, 32, 4, 1, '#aa729a'); }
    else { line([[0, -42], [0, -49]], '#697568', 2); ellipse(0, -49, 4, 4, '#b984a5'); }
    roundRect(-10, -16, 20, 5, 2, '#6c6757'); ctx.restore();
    if (boss) {
      textLabel('O PROFETA', enemy.x + enemy.w / 2, enemy.y - 32, 10, '#505265', 'center');
      roundRect(enemy.x - 8, enemy.y - 23, 74, 7, 3, '#fff8e0');
      roundRect(enemy.x - 7, enemy.y - 22, 72 * enemy.hp / 6, 5, 3, '#a96a99');
    }
  }
  function drawThais(x, y, freed) {
    if (art?.sprite(ctx, 1, freed ? 3 : 0, x + 20, y + 65, 96)) {
      if (!freed) {
        // Uma barreira de energia mantém a personagem visível por trás do efeito.
        ctx.strokeStyle = '#81a4c9'; ctx.lineWidth = 3;
        ctx.strokeRect(x - 22, y - 39, 86, 105);
        for (let i = 0; i < 3; i++) line([[x - 12 + i * 31, y - 33], [x - 12 + i * 31, y + 62]], '#88badb70', 2);
      }
      textLabel('THAÍS', x + 20, y - 55, 12, '#403752', 'center'); return;
    }
    ellipse(x + 20, y + 65, 32, 7, '#405e6125');
    roundRect(x + 1, y - 4, 39, 50, 16, '#271b27');
    line([[x + 12, y + 48], [x + 10, y + 62]], '#986a51', 8); line([[x + 28, y + 48], [x + 30, y + 62]], '#986a51', 8);
    polygon([[x + 10, y + 24], [x + 30, y + 24], [x + 39, y + 50], [x + 2, y + 50]], '#211a28');
    ellipse(x + 20, y + 12, 14, 17, '#c5946a');
    polygon([[x + 5, y + 3], [x + 12, y - 5], [x + 30, y - 2], [x + 36, y + 10], [x + 19, y + 4]], '#271b27');
    ellipse(x + 15, y + 12, 1.7, 2, '#463934'); ellipse(x + 26, y + 12, 1.7, 2, '#463934');
    line([[x + 17, y + 22], [x + 23, y + 22]], '#fff2d1', 2);
    ellipse(x + 34, y + 2, 6, 6, '#a87bbe'); ellipse(x + 34, y + 2, 2, 2, '#f0d083');
    line([[x + 6, y + 29], [x - 7, y + (freed ? 10 : 41)]], '#c5946a', 7);
    line([[x + 33, y + 29], [x + 46, y + (freed ? 10 : 41)]], '#c5946a', 7);
    if (!freed) {
      roundRect(x - 22, y - 37, 85, 104, 22, '#c9e3e431');
      ctx.strokeStyle = '#859fa9'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(x - 22, y - 37, 85, 104, 22); ctx.stroke();
      for (let i = 0; i < 3; i++) line([[x - 7 + i * 27, y - 30], [x - 7 + i * 27, y + 65]], '#b2c6cbaa', 3);
      roundRect(x + 10, y + 35, 21, 22, 5, '#c5a15e'); ellipse(x + 20, y + 44, 3, 4, '#7f755f');
    }
    textLabel('THAÍS', x + 20, y - 52, 12, '#527780', 'center');
  }
  function drawGoal() {
    const x = level.width - 125;
    if (levelIndex === LEVELS.length - 1) {
      const freed = enemies.every(e => e.type !== 'boss' || e.dead);
      drawThais(x - 20, 545, freed);
      if (freed) { textLabel('VEM, WANZELLER! ♡', x, 462, 13, '#746294', 'center'); }
    } else {
      line([[x, 610], [x, 425]], '#78674b', 6);
      ctx.fillStyle = '#9155b5'; ctx.beginPath(); ctx.moveTo(x + 3, 430); ctx.quadraticCurveTo(x + 37, 416, x + 80, 437); ctx.lineTo(x + 70, 483); ctx.quadraticCurveTo(x + 32, 464, x + 3, 477); ctx.fill();
      textLabel('♛', x + 38, 462, 27, '#f8dda1', 'center');
      roundRect(x - 69, 373, 139, 30, 2, '#fff9e2'); textLabel(`PRÓXIMA FASE: 0${levelIndex + 2} →`, x, 393, 9, '#77745f', 'center');
    }
  }
  function drawMenu() {
    scenery('desert', 0, true);
    const mobile = width < 750;
    const heroX = mobile ? width * .53 : width * .72;
    const groundY = mobile ? 618 : 562;
    drawPlatform({ x: 0, y: 665, w: width, h: 70, ground: true }, 'desert');
    drawPlatform({ x: heroX - 109, y: groundY, w: mobile ? 226 : 266, h: 220, ground: true }, 'desert');
    if (!mobile) {
      drawPlatform({ x: width * .92, y: 471, w: 155, h: 25 }, 'desert');
      drawBerry(width * .935, 431 + Math.sin(clock * 2) * 5, 1.2);
      drawBerry(width * .977, 422 + Math.sin(clock * 2 + 1) * 5, 1.2);
      cactus(width * .51, 665, 1.18, '#708a56');
      cactus(width * .90, 665, .62, '#738957');
    } else cactus(width * .13, 665, .68, '#78905c');
    const scale = mobile ? 1.65 : 2.45;
    ellipse(heroX + 16, groundY + 2, 55, 9, '#42443126');
    drawHero(heroX - 18 * scale, groundY - 64 * scale - Math.sin(clock * 2) * 1.8, scale, 1, false, true);
    for (let i = 0; i < 5; i++) {
      const x = heroX - 68 + Math.sin(i * 2 + clock * .4) * 50, y = groundY - 130 - i * 26;
      textLabel('✦', x, y, i % 2 ? 10 : 15, '#fff3b7');
    }
    const signX = mobile ? width * .8 : width * .52;
    line([[signX, 662], [signX, 596]], '#a7895c', 7);
    polygon([[signX - 32, 591], [signX + 24, 591], [signX + 39, 608], [signX + 24, 624], [signX - 32, 624]], '#dac08a');
    textLabel('SERTÃO', signX + 1, 612, 10, '#8c744d', 'center');
    // Rochas e pequenas flores dão acabamento às bordas do terreno.
    for (let i = 0; i < 12; i++) {
      const x = i * width / 11 + 10;
      ellipse(x, 663, 8 + i % 3 * 3, 4 + i % 2 * 3, '#bb9864');
      if (i % 3 === 0) { line([[x + 16, 665], [x + 16, 650]], '#7c9150', 2); ellipse(x + 16, 648, 4, 4, '#ead074'); }
    }
  }
  function render() {
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(canvas.width / width, 0, 0, canvas.height / VIEW_HEIGHT, 0, 0);
    ctx.clearRect(0, 0, width, VIEW_HEIGHT);
    if (state === 'menu') { drawMenu(); return; }
    scenery(level.biome, camera);
    ctx.save(); ctx.translate(-Math.round(camera), 0);
    for (const p of platforms) if (p.x + p.w > camera - 100 && p.x < camera + width + 100) drawPlatform(p, level.biome);
    for (const x of level.checkpoints) if (x > camera - 50 && x < camera + width + 50) {
      line([[x - 8, 610], [x - 8, 553]], '#7a7960', 3);
      polygon([[x - 6, 553], [x + 17, 559], [x - 6, 572]], checkpoint >= x ? '#a477c4' : '#ddd2a5');
    }
    drawGoal();
    for (const item of items) {
      if (item.collected || item.x < camera - 40 || item.x > camera + width + 40) continue;
      const bob = reducedMotion ? 0 : Math.sin(clock * 3 + item.x * .015) * 4;
      if (item.type === 'heart') { textLabel('♥', item.x + 12, item.y + 24 + bob, 29, '#c96880', 'center'); }
      else drawBerry(item.x + 12, item.y + 12 + bob, 1, item.type === 'gold');
    }
    for (const enemy of enemies) if (!enemy.dead && enemy.x > camera - 100 && enemy.x < camera + width + 100) drawEnemy(enemy);
    for (const shot of shots) {
      ellipse(shot.x + 9 - Math.sign(shot.vx) * 10, shot.y + 9, 18, 7, '#b88bda66'); drawBerry(shot.x + 9, shot.y + 9, .85);
    }
    for (const shot of enemyShots) {
      polygon([[shot.x + 11, shot.y - 3], [shot.x + 25, shot.y + 11], [shot.x + 11, shot.y + 25], [shot.x - 3, shot.y + 11]], '#7d78b6');
      polygon([[shot.x + 11, shot.y + 3], [shot.x + 19, shot.y + 11], [shot.x + 11, shot.y + 19], [shot.x + 3, shot.y + 11]], '#edd393');
    }
    if (player.invulnerable <= 0 || Math.floor(clock * 12) % 2 === 0) {
      ellipse(player.x + 18, player.y + 66, 20, 4, '#33433520');
      drawHero(player.x, player.y, 1, player.facing, player.onGround && Math.abs(player.vx) > 30);
    }
    for (const particle of particles) { ctx.globalAlpha = Math.min(1, particle.life * 2); ellipse(particle.x, particle.y, particle.size, particle.size, particle.color); }
    ctx.globalAlpha = 1;
    for (const t of floatingTexts) { ctx.globalAlpha = Math.min(1, t.life * 3); textLabel(t.text, t.x, t.y, 16, '#764298', 'center', 800); }
    ctx.globalAlpha = 1;
    ctx.restore();
    // Indicador compacto de progresso da travessia, abaixo do cenário.
    roundRect(width * .32, VIEW_HEIGHT - 15, width * .36, 4, 2, '#fff9df66');
    roundRect(width * .32, VIEW_HEIGHT - 15, width * .36 * clamp(player.x / (level.width - 170), 0, 1), 4, 2, '#9160b5');
  }
  function frame(timestamp) {
    const dt = lastFrame ? Math.min((timestamp - lastFrame) / 1000, .05) : 0;
    lastFrame = timestamp;
    if (state === 'playing' || state === 'menu') clock += dt;
    if (state === 'playing') {
      accumulator += dt;
      while (accumulator >= STEP && state === 'playing') { update(STEP); accumulator -= STEP; }
    } else accumulator = 0;
    render(); requestAnimationFrame(frame);
  }

  // Teclado, ponteiros e foco compartilham as mesmas ações.
  const gameKeys = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyX', 'KeyK']);
  document.addEventListener('keydown', event => {
    if (state === 'dialogue') {
      if (['Space', 'Enter', 'KeyE', 'Escape'].includes(event.code)) {
        event.preventDefault();
        if (!event.repeat) { unlockAudio(); event.code === 'Escape' ? finishDialogue() : advanceDialogue(); }
      } else if (event.code === 'Tab') {
        event.preventDefault(); (document.activeElement === ui.dialogueNext ? ui.dialogueSkip : ui.dialogueNext).focus();
      }
      return;
    }
    if (event.code === 'Tab' && !ui.modalLayer.classList.contains('hidden')) {
      const first = ui.modalPrimary, last = ui.modalSecondary;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') {
      if (!event.repeat) { if (state === 'playing') pauseGame(); else if (state === 'paused') resumeGame(); }
      return;
    }
    if (state !== 'playing' || !gameKeys.has(event.code)) return;
    event.preventDefault(); unlockAudio();
    if (!event.repeat && ['Space', 'ArrowUp', 'KeyW'].includes(event.code)) jumpBuffer = PHYSICS.jumpBuffer;
    if (!event.repeat && ['KeyX', 'KeyK'].includes(event.code)) fireQueued = true;
    pressed.add(event.code);
  });
  document.addEventListener('keyup', event => {
    pressed.delete(event.code);
    if (['Space', 'ArrowUp', 'KeyW'].includes(event.code) && !held('jump')) jumpReleased = true;
  });
  document.querySelectorAll('[data-control]').forEach(button => {
    button.addEventListener('pointerdown', event => {
      event.preventDefault(); if (state !== 'playing') return;
      unlockAudio(); button.setPointerCapture(event.pointerId);
      const action = button.dataset.control; touch.set(event.pointerId, action);
      if (action === 'jump') jumpBuffer = PHYSICS.jumpBuffer;
      if (action === 'power') fireQueued = true;
    });
    function release(event) {
      const action = touch.get(event.pointerId); touch.delete(event.pointerId);
      if (action === 'jump' && !held('jump')) jumpReleased = true;
    }
    button.addEventListener('pointerup', release); button.addEventListener('pointercancel', release); button.addEventListener('lostpointercapture', release);
    button.addEventListener('contextmenu', event => event.preventDefault());
  });
  window.addEventListener('blur', () => { clearInput(); pauseGame(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { clearInput(); pauseGame(); } });
  $('playButton').addEventListener('click', startGame);
  ui.dialogueNext.addEventListener('click', () => { unlockAudio(); advanceDialogue(); });
  ui.dialogueSkip.addEventListener('click', finishDialogue);
  $('pauseButton').addEventListener('click', pauseGame);
  ui.modalPrimary.addEventListener('click', () => { unlockAudio(); modalAction?.(); });
  ui.modalSecondary.addEventListener('click', returnToMenu);
  $('soundButton').addEventListener('click', () => { soundEnabled = !soundEnabled; updateSoundButton(); if (soundEnabled) { unlockAudio(); tone(660, .12); } });
  $('fullscreenButton').addEventListener('click', async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (stage.requestFullscreen) await stage.requestFullscreen();
      else { $('fullscreenButton').title = 'Tela cheia indisponível neste navegador'; if (state === 'playing') showToast('Use o modo paisagem para uma tela maior.', 3); }
    } catch { if (state === 'playing') showToast('Não foi possível abrir tela cheia neste navegador.', 3); }
  });
  document.addEventListener('fullscreenchange', () => {
    $('fullscreenButton').setAttribute('aria-label', document.fullscreenElement ? 'Sair da tela cheia' : 'Abrir tela cheia'); resize();
  });
  function paintCharacterPreviews() {
    if (!art) return;
    for (let i = 0; i < 3; i++) {
      const preview = $(`characterPreview${i}`); if (!preview) continue;
      const pc = preview.getContext('2d'); pc.imageSmoothingEnabled = false;
      pc.fillStyle = ['#e9dbcb', '#e5d6df', '#d6e0e6'][i]; pc.fillRect(0, 0, 200, 150);
      for(let y=0;y<150;y+=10)for(let x=0;x<200;x+=10)if((x+y)%20===0){pc.fillStyle='#ffffff18';pc.fillRect(x,y,10,10);}
      art.sprite(pc, i, 0, 100, 143, 132);
    }
    if (dialogue) showDialogueLine();
  }
  if (art) { art.sheet.addEventListener('load', paintCharacterPreviews); if (art.sheet.complete) paintCharacterPreviews(); }
  updateSoundButton(); resize(); requestAnimationFrame(frame);
})();
