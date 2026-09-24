# Wanzeller — O Rei do Açaí

Um jogo de plataforma 2D em HTML, CSS e JavaScript puro. Atravesse o sertão, a Amazônia e o litoral de Santa Catarina com os poderes do açaí, resgate Thaís e derrote O Profeta. Agora são **seis fases em pixel art**, personagens animados baseados nos modelos fornecidos e conversas com retratos. O tom continua leve, com efeitos sonoros sintetizados e controles de teclado e toque.

O visual e a apresentação das conversas usam como referência o jogo brasileiro [Zueirama, da Memes Games](https://store.steampowered.com/app/952290/Zueirama/?l=brazilian). Os cenários, diálogos e elementos deste projeto são próprios; os sprites derivam dos modelos de Wanzeller, Thaís e O Profeta enviados pelo usuário. Thaís tem cabelo até os ombros e franja, conforme o ajuste solicitado.

| Fase | Região | Cenário |
| --- | --- | --- |
| 01 | Sertão | O coração do sertão: vila e primeiros desafios |
| 02 | Sertão | Feira do sol rachado: barracas e plataformas móveis |
| 03 | Amazônia | Os caminhos da Amazônia: floresta e açaís dourados |
| 04 | Amazônia | O igarapé dos atalhos: passarelas sobre o rio |
| 05 | Santa Catarina | A orla dos ventos: calçadão e caranguejos |
| 06 | Santa Catarina | O último pôr do sol: farol, chefe e resgate |

## Executar localmente

### Abrir em outra máquina

Na página deste repositório no GitHub, clique em **Code → Download ZIP**. Extraia a pasta inteira e abra `index.html` no navegador. Não abra o HTML diretamente de dentro do ZIP: ele precisa encontrar os arquivos da pasta `assets/`.

Se preferir Git, copie o endereço HTTPS em **Code**, execute `git clone ENDERECO-COPIADO` e abra `index.html` na pasta baixada. Não é necessário instalar Node.js para jogar; ele é usado somente pelo servidor opcional e pelos testes.

### Nesta máquina

**Sem instalar nada:** abra `index.html` com dois cliques em um navegador moderno, como Chrome, Edge, Firefox ou Safari. Clique em **Jogar**. Mantenha `style.css`, `game.js` e `assets/` juntos na mesma pasta. Não há dependências, downloads de fontes, bibliotecas externas ou etapa de compilação.

**Com servidor local opcional:** se tiver Node.js instalado, abra um terminal nesta pasta e execute:

```sh
node server.mjs
```

Abra **http://localhost:8080**. Para encerrar, pressione `Ctrl+C`. O servidor utiliza somente módulos nativos do Node.js e serve apenas os arquivos públicos do jogo.

**No celular:** com o computador e o celular conectados à mesma rede Wi-Fi, execute:

```sh
node server.mjs --lan
```

No Windows, consulte o endereço IPv4 do computador usando `ipconfig`. No navegador do celular, abra `http://IP-DO-COMPUTADOR:8080`, substituindo pelo IPv4 encontrado. Se o sistema pedir acesso à rede, permita na sua rede privada. O modo `--lan` disponibiliza o jogo à rede local enquanto o servidor estiver aberto. O modo paisagem oferece uma visão maior do caminho.

## Controles

| Ação | Teclado | Celular |
| --- | --- | --- |
| Andar | Setas esquerda/direita ou A/D | ◀ / ▶ |
| Pular | Espaço (também W ou seta para cima) | ↑ |
| Lançar açaí | X (também K) | ✦ |
| Pausar/continuar | P ou Esc | Botão Ⅱ e Continuar |
| Avançar diálogo | Espaço, Enter ou E | Continuar / Vamos lá |
| Pular conversa | Esc | Pular conversa |
| Som | Botão de nota musical no cabeçalho | Mesmo botão |
| Tela cheia | Botão ⛶ | Quando suportado pelo navegador |

Segure o pulo para saltar mais alto; solte antes para fazer um salto curto. É possível andar, pular e lançar açaí simultaneamente. Os controles de toque aparecem em aparelhos com ponteiro de toque ou telas de até 700 pixels de largura. O som é iniciado após uma interação e pode ser desativado. Sair da aba ou perder o foco pausa a aventura automaticamente.

## Regras e progressão

- Você começa com **3 vidas**. Contatos laterais com inimigos, projéteis do chefe e quedas custam uma vida. Depois do dano, existe um curto período de proteção.
- Pule sobre inimigos ou use X para derrotá-los. O poder de açaí tem munição ilimitada e um pequeno intervalo entre disparos.
- Açaí comum vale **25 pontos**; dourado, **100**; coração recupera uma vida, até o máximo de 3, e vale **25**.
- Inimigos comuns valem **100 pontos**. O chefe final tem 6 pontos de energia e vale **600 pontos**.
- Bandeirinhas pequenas marcam pontos de retorno. Depois de cair, você reaparece no último alcançado. Itens coletados e inimigos derrotados continuam assim nesta tentativa.
- Alcance a bandeira grande no fim das cinco primeiras fases. Cada uma concede **500 pontos** e permite seguir para a próxima, com as vidas renovadas.
- Na última fase, derrote O Profeta e alcance Thaís para concluir a aventura e receber **1.000 pontos**.
- Perder todas as vidas abre a tela de derrota; tentar novamente reinicia a aventura no sertão e zera a pontuação da partida.
- O recorde é armazenado no navegador quando você conclui uma fase, perde ou volta ao início. Ele não é um salvamento da fase em andamento. Em modo privado ou com armazenamento bloqueado, o jogo continua funcionando, mas o recorde pode não persistir.
- As conversas pausam personagens, plataformas e inimigos. Há falas na abertura de cada fase, no primeiro ponto de retorno, antes do chefe e no resgate. É possível pular qualquer conversa sem perder progresso. As falas são escritas, com sinais sonoros; não há dublagem.

## Organização

```text
index.html             Estrutura, menus, placar e controles
style.css              Layout, paleta e adaptação a telas menores
game.js                Fases, física, combate, desenho, áudio e entradas
assets/
  crown.svg            Ícone/coroa da identidade visual
  grain.svg            Textura leve do cenário
  *-reference.png      Modelos originais do elenco, preservados
  characters-pixel.png Primeira versão do atlas, preservada
  characters-pixel-v2.png Atlas usado no jogo, com cabelo de Thaís mais curto
  pixel-art.js         Desenho pixelado, animações e recortes do atlas
  ART-DIRECTION.md     Referências, geração dos sprites e prompts usados
server.mjs             Servidor local opcional, sem dependências
tests/game.test.cjs     Testes de física e regras com Node.js
README.md              Este guia
```

`assets/pixel-art.js` desenha os cenários em pixels e usa `characters-pixel-v2.png` como atlas de animações: cada linha representa um personagem e cada coluna, uma pose. As poses são parado, corrida A, corrida B e ação. O Canvas principal possui 360 linhas internas e é ampliado sem suavização, mantendo as bordas pixeladas. A física continua nas mesmas coordenadas lógicas da versão anterior. Os sons são criados pela Web Audio API, sem arquivos de áudio externos. O jogo continua jogável com desenhos de reserva se o atlas falhar ao carregar.

## Como o código funciona

`LEVELS` contém os dados das fases. `loadLevel()` cria uma cópia jogável dos objetos sem alterar a configuração original. `update()` aplica física e regras em passos de **1/120 de segundo**; `requestAnimationFrame()` desenha a cena. As coordenadas pertencem ao mundo: a câmera transforma somente o desenho, sem alterar as colisões.

`player` guarda posição, velocidade, apoio, intervalo do disparo e proteção após dano. `platforms`, `enemies`, `items`, `shots` e `enemyShots` armazenam os objetos ativos. `overlaps()` realiza colisões retangulares. Plataformas suspensas permitem atravessar por baixo e pousar por cima; os blocos de solo têm laterais sólidas. Plataformas móveis carregam o jogador apoiado nelas.

Os estados são `menu`, `playing`, `dialogue`, `paused`, `won`, `lost` e `complete`. Só `playing` avança a física. `beginDialogue()` congela a partida e guarda o callback de continuação; `advanceDialogue()` avança as falas; `finishDialogue()` encerra a conversa e executa o callback uma vez. As rotinas de áudio são opcionais: falhas de reprodução não impedem a partida.

## Adicionar uma fase

1. Localize `LEVELS` em `game.js` e copie um objeto de fase. Use `biome: 'desert'`, `'forest'` ou `'coast'` para reutilizar as paletas existentes.
2. Defina `width`, `grounds`, `platforms`, `enemies`, `items` e `checkpoints`. O chão está em `y: 610`; números menores de `y` ficam mais altos. Um trecho de chão é `[xInicial, largura]`.
3. Garanta solo sob o início, checkpoints e chegada. A posição inicial é `x: 100`; a chegada é perto de `width - 125`. Evite inimigos sobre checkpoints.
4. Acrescente as falas em `STORIES`, na mesma posição da nova fase, conforme a seção abaixo. Sem roteiro, a fase inicia diretamente.
5. Atualize os cards e a contagem na tela inicial em `index.html`. Os cards usam IDs `chapter0`, `chapter1` etc. A numeração do placar, o destino da bandeira, a progressão e o reconhecimento do último capítulo são automáticos a partir de `LEVELS.length`. Mantenha o chefe e o resgate no último objeto.

Exemplo de configuração, para adaptar a um capítulo existente ou inserir antes do final:

```js
{
  name: 'Um novo caminho',
  biome: 'forest',
  width: 2200,
  hint: 'Explore este novo trecho!',
  grounds: [[0, 800], [950, 1250]],
  platforms: [
    { x: 350, y: 500, w: 150 },
    { x: 750, y: 490, w: 140,
      move: { axis: 'x', range: 80, period: 4 } }
  ],
  enemies: [{ x: 1250, min: 1100, max: 1500, speed: 80 }],
  items: [{ x: 1450, y: 560, type: 'heart' }],
  checkpoints: [1030]
}
```

`range` é a amplitude em pixels e `period`, o tempo em segundos de um ciclo completo. Use `axis: 'y'` para elevadores. O motor cria automaticamente trilhas de açaí no solo e sobre plataformas; os frutos acompanham suas plataformas móveis.

Com a física padrão, um salto completo sobe aproximadamente **127 pixels** e percorre **247 pixels** à velocidade máxima antes de voltar à altura inicial. Prefira desníveis de até 110 pixels e lacunas de até 180 pixels para manter margem de segurança. Obstáculos, aceleração e o momento de soltar o botão afetam a travessia. Teste cada fase no teclado e no toque.

Para criar outro bioma, adicione a paleta em `colors` e os elementos em `scene()` e `platform()` de `assets/pixel-art.js`. Atualize também `palette` em `game.js` para manter os desenhos de reserva. `variant: 'market'`, `'river'` e `'boardwalk'` adicionam, respectivamente, feira, passarelas e calçadão aos biomas existentes.

## Adicionar diálogos

Em `STORIES`, cada fase tem `intro` e `middle`. Use os identificadores `wanzeller`, `thais` ou `profeta`:

```js
{
  intro: [
    ['wanzeller', 'Cheguei! Onde fica o próximo desafio?'],
    ['thais', 'Segue a trilha de açaí. E olha onde pisa!']
  ],
  middle: [['wanzeller', 'Metade do caminho. Ainda tem açaí no tanque!']]
}
```

`middle` aparece uma vez, no primeiro checkpoint da fase. `BOSS_LINES` guarda o confronto e `END_LINES`, o reencontro. Falas mais curtas funcionam melhor no celular. Para incluir outro personagem, adicione seus dados em `SPEAKERS` e um sprite/retrato em `assets/pixel-art.js`.

## Adicionar inimigos

Acrescente um objeto ao array `enemies` da fase:

```js
{ x: 1350, min: 1150, max: 1550, speed: 100 }
```

O inimigo patrulha entre `min` e `max`. Esses limites se referem à borda esquerda; reserve também seus **42 pixels de largura** sobre um mesmo trecho de chão. Quanto maior `speed`, mais rápido ele se move. A direção inicial alterna automaticamente.

Para o chefe, use `type: 'boss', hp: 6`. Ele tem 58 pixels de largura, dispara quando o jogador se aproxima e precisa ser derrotado para liberar o final. A barra pixelada usa `maxHp`, copiado da configuração ao iniciar a fase. O visual de inimigos comuns é um copinho de açaí nos dois primeiros biomas e um caranguejo no litoral.

Para um comportamento novo, como um inimigo voador, estenda a inicialização em `loadLevel()`, o bloco de inimigos em `update()` e o desenho em `drawEnemy()`. O exemplo básico patrulha o chão; não segue plataformas automaticamente.

## Adicionar itens

Inclua posições e tipos em `items`:

```js
{ x: 900, y: 550, type: 'berry' }, // +25 pontos
{ x: 1100, y: 390, type: 'gold' }, // +100 pontos
{ x: 1400, y: 560, type: 'heart' } // vida e +25 pontos
```

`x` e `y` são o canto superior esquerdo da área de coleta. Para criar um novo tipo, implemente seu efeito no laço de coleta de `update()` e sua aparência no laço de itens de `render()`. Frutos animam suavemente, sem modificar a área de colisão.

## Verificação

```sh
node --check game.js
node tests/game.test.cjs
```

Os 19 testes verificam movimento, limites, pulo variável, tolerância nas bordas, pulo antecipado, plataformas móveis, itens, projéteis, dano, checkpoints, derrota, pausa, travessia das lacunas das seis fases, progressão, chefe, congelamento durante diálogos e conclusão sem pontuação duplicada. Rodam a lógica real em um ambiente de teste em memória, sem expor ferramentas de depuração no jogo. Não substituem a conferência visual, de som e de toque em um aparelho real.
