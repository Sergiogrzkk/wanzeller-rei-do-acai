# Direção de arte e origem dos sprites

Atualização: pixel art com base nos modelos fornecidos pelo usuário. A composição da página, a física e os controles foram preservados. Referência de apresentação e humor: [Zueirama — Memes Games](https://store.steampowered.com/app/952290/Zueirama/?l=brazilian). Nenhum sprite, diálogo ou trilha do jogo de referência foi utilizado.

## Arquivos

- `wanzeller-reference.png`, `thais-reference.png`, `profeta-reference.png`: referências do usuário, preservadas.
- `characters-pixel.png`: primeira versão gerada, preservada.
- `characters-pixel-v2.png`: versão efetivamente usada pelo jogo; Thaís com cabelo até os ombros e franja.
- `pixel-art.js`: recortes do atlas, animações, retratos e cenários feitos em Canvas.

Os dois atlas foram produzidos pela ferramenta integrada ImageGen. Não foi utilizado CLI/API externo. A edição final do cabelo foi conferida visualmente. O PNG final possui 1448 × 1086 pixels e transparência real. Quatro colunas de poses; linhas na ordem Wanzeller, Thaís, O Profeta. Os recortes são definidos em `rows` no módulo de arte. As imagens originais permanecem intactas.

## Prompt inicial

Create a production-ready TRANSPARENT PNG pixel-art character spritesheet for a Brazilian side-scrolling platform game. Use the three attached images as CHARACTER DESIGN REFERENCES, not images to copy whole. Image 1 Wanzeller hero: young adult man with short dense dark curly hair, tiny goatee, medium tan skin, gold crown with purple gems, white T-shirt with small purple crown emblem, black baggy trousers, white/purple sneakers, long purple royal cape with white fur trim. Image 2 Thais: young adult woman, pale/light warm skin, dark burgundy long hair and bangs, black gothic sleeveless top, black shorts/skirt and patterned tights, chunky black lace-up boots, black choker. Image 3 O Profeta: adult man with long brown curly hair, rectangular black glasses, white robe with blue panels and gold trim, blue/white small cap, matching medallion. Preserve their faces, silhouettes, clothes and colors recognizably from references. Style: deliberate chunky clean 16-bit pixel art, expressive cartoon proportions, approx 48x64 logical pixels per character, dark 1px outline, tiny color palette, no anti-aliasing, no gradients, no text. Layout EXACTLY FOUR COLUMNS BY THREE ROWS evenly spaced grid. Canvas 1536x1152 (4:3). Every cell is 384x384. Each row has one character only, all full-body sprites facing RIGHT three-quarter side view, identical scale and baseline. Row 1 Wanzeller, Row 2 Thais, Row 3 Profeta. Columns for each row: 1 idle standing, 2 running with left foot forward, 3 running right foot forward, 4 action pose (Wanzeller extending hand to shoot acai, Thais waving one hand confidently, Profeta extending arm casting). Put each character centered horizontally in its cell, feet on a consistent baseline 340px down into each cell, crown/head near 55px down, keep 35px transparent gap around every sprite. No spell effects outside the body; Wanzeller may have a small purple fruit in extended palm. IMPORTANT actual transparent alpha background, no labels, no text, no grids, no dividers, no shadows, no scenery. 12 sprites total. Usable directly as uniform atlas.

## Ajuste solicitado: cabelo da Thaís

Edit this transparent pixel-art spritesheet. Change ONLY the hair length of Thais, the woman in the MIDDLE ROW, in all four poses. Her dark burgundy hair must be a little shorter, ending around the shoulders, retaining the same bangs, face, black gothic outfit, boots and proportions. In running poses, shorten the flowing locks so the hair does not reach her waist or upper back. Keep all twelve sprites, their exact poses, sizes, pixel style, layout, cell positions, transparent alpha background, and the other two character rows completely unchanged. Do not add text or dividers. Preserve the same 1448x1086 canvas if possible. This is a tightly scoped haircut edit only.
