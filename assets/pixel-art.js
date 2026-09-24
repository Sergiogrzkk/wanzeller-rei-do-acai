/* Arte original do jogo. Sprites derivados dos modelos fornecidos pelo usuário.
 * Todas as posições são arredondadas; o Canvas principal é ampliado sem suavização.
 * O atlas possui quatro poses por personagem: parado, corrida A/B e ação.
 */
(() => {
  'use strict';
  const sheet = new Image();
  sheet.src = 'assets/characters-pixel-v2.png';
  const rows = [{ y: 26, h: 359, baseline: 350 }, { y: 390, h: 351, baseline: 347 }, { y: 742, h: 344, baseline: 343 }];
  const colors = {
    desert: { sky: ['#f0c786','#f5d494','#f7dda5'], far: '#cfa77c', mid: '#a88667', dark: '#74694e', leaf: '#798557', light: '#a3a269', soil: '#a5734e', stone: '#c49364', grass: '#778447' },
    forest: { sky: ['#82b6ad','#a6cbb3','#d0dca9'], far: '#7da382', mid: '#517f68', dark: '#274f49', leaf: '#3e7451', light: '#70924e', soil: '#78614b', stone: '#967657', grass: '#72a751' },
    coast: { sky: ['#87b4d0','#afd5de','#d6e9d9'], far: '#84a5ab', mid: '#5c848c', dark: '#486b72', leaf: '#4e826e', light: '#86a284', soil: '#a69b81', stone: '#c7b68e', grass: '#76a08b' }
  };
  const rect = (c,x,y,w,h,color) => { c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),Math.ceil(w),Math.ceil(h)); };
  function poly(c, points, color) { c.fillStyle=color; c.beginPath(); points.forEach(([x,y],i) => i ? c.lineTo(Math.round(x),Math.round(y)) : c.moveTo(Math.round(x),Math.round(y))); c.closePath(); c.fill(); }
  function label(c,text,x,y,size=12,color='#4a4037') { c.font=`bold ${size}px monospace`; c.fillStyle=color; c.textAlign='center'; c.fillText(text,Math.round(x),Math.round(y)); }
  function hash(x,y) { const n=Math.sin(x*127.1+y*311.7)*43758.5453; return n-Math.floor(n); }
  function blob(c,x,y,w,h,color) {
    rect(c,x+w*.18,y,w*.64,h,color); rect(c,x+w*.08,y+h*.13,w*.84,h*.74,color); rect(c,x,y+h*.3,w,h*.4,color);
  }
  function sprite(c,who,frame,cx,feet,height=96,facing=1) {
    if (!sheet.complete || !sheet.naturalWidth) return false;
    const row=rows[who], scale=height/330;
    c.save(); c.imageSmoothingEnabled=false; c.translate(Math.round(cx),Math.round(feet)); c.scale(facing,1);
    c.drawImage(sheet,frame*362,row.y,362,row.h,Math.round(-181*scale),Math.round(-row.baseline*scale),Math.round(362*scale),Math.round(row.h*scale)); c.restore(); return true;
  }
  function portrait(canvas,who) {
    const c=canvas.getContext('2d'); c.imageSmoothingEnabled=false;
    rect(c,0,0,128,128,['#493063','#532e48','#273f65'][who]);
    for(let y=0;y<128;y+=8) for(let x=0;x<128;x+=8) if((x+y)%16===0) rect(c,x,y,8,8,'#ffffff08');
    if (!sheet.complete || !sheet.naturalWidth) return;
    const crops=[[92,42,183,179],[109,404,155,164],[102,750,172,184]];
    c.drawImage(sheet,...crops[who],4,1,120,127);
  }
  function cloud(c,x,y,s=1) {
    c.save();c.translate(Math.floor(x),Math.floor(y));c.scale(s,s);
    rect(c,-55,0,121,15,'#f5edd0');rect(c,-38,-13,70,17,'#f5edd0');rect(c,-16,-25,43,17,'#f5edd0');rect(c,24,-8,30,14,'#f5edd0');
    rect(c,-50,13,104,5,'#dfd9bd');c.restore();
  }
  function cactus(c,x,y,s=1) {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
    rect(c,-10,-94,21,94,'#596d42');rect(c,-7,-100,15,94,'#7e9254');rect(c,-31,-53,31,15,'#657b45');rect(c,-35,-80,13,37,'#657b45');
    rect(c,8,-72,26,13,'#657b45');rect(c,25,-105,12,45,'#6c834a');rect(c,-3,-90,3,79,'#a0ad65');
    rect(c,-30,-73,2,20,'#a0ad65');rect(c,28,-94,3,28,'#a0ad65');rect(c,26,-111,9,6,'#b76c75');c.restore();
  }
  function tree(c,x,y,s=1,p=colors.forest) {
    c.save();c.translate(Math.floor(x),Math.floor(y));c.scale(s,s);
    poly(c,[[-25,0],[-16,-180],[-33,-271],[-16,-276],[5,-200],[37,-294],[47,-287],[19,-171],[25,0]],'#534e3f');
    rect(c,-7,-174,9,170,'#706649');rect(c,9,-132,5,122,'#3e4737');
    [[-122,-307,173,89],[-59,-354,170,109],[39,-302,157,84],[-82,-278,142,60]].forEach(b=>blob(c,...b,p.dark));
    [[-121,-321,143,63],[-47,-359,139,86],[56,-315,124,75],[-91,-285,100,34]].forEach(b=>blob(c,...b,p.leaf));
    for(let i=0;i<33;i++) { const lx=-98+hash(i,7)*253,ly=-342+hash(i,8)*77;rect(c,lx,ly,6+hash(i,5)*12,4,p.light); }
    c.restore();
  }
  function palm(c,x,y,s=1,p=colors.coast) {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(s,s);
    poly(c,[[-8,0],[0,-90],[23,-195],[34,-194],[15,-87],[8,0]],'#877b59');
    for(let i=0;i<8;i++)rect(c,i*2,-i*23,11,4,'#beac7d');
    for(let dir=-1;dir<=1;dir+=2) for(let i=0;i<3;i++) poly(c,[[28,-193],[28+dir*(55+i*19),-220+i*22],[28+dir*(95+i*13),-166+i*26],[28+dir*47,-190+i*18]],i%2?p.leaf:p.dark);
    rect(c,23,-197,12,13,'#705843');c.restore();
  }
  function house(c,x,y,variant=0) {
    rect(c,x,y-122,161,122,variant%2?'#cfa576':'#dab888');
    rect(c,x+6,y-113,147,106,variant%2?'#dbb888':'#e3c39c');
    poly(c,[[x-14,y-120],[x+14,y-157],[x+133,y-157],[x+174,y-120]],'#855d48');
    for(let i=0;i<12;i++)rect(c,x+i*14,y-126-(i%2)*7,11,4,'#b17652');
    rect(c,x+22,y-72,31,72,'#726856');rect(c,x+24,y-68,25,65,'#8c8b6a');rect(c,x+44,y-36,3,4,'#d5bd85');
    for(const wx of [78,119]) {rect(c,x+wx,y-92,25,32,'#726952');rect(c,x+wx+3,y-89,18,25,'#95a58b');rect(c,x+wx+11,y-89,3,25,'#6e7155');}
    rect(c,x+60,y-24,98,17,'#e5d2a0'); label(c,variant%2?'CALDO & PROSA':'AÇAÍ GELADO',x+108,y-11,9);
  }
  function stall(c,x,y) {
    rect(c,x+7,y-93,6,94,'#735443');rect(c,x+127,y-93,6,94,'#735443');
    rect(c,x,y-42,142,42,'#a97c58');rect(c,x+6,y-35,130,5,'#c99c65');
    poly(c,[[x-8,y-90],[x+8,y-118],[x+128,y-118],[x+148,y-90]],'#ede0b3');
    for(let i=0;i<5;i++)poly(c,[[x+i*29-7,y-90],[x+i*25+8,y-118],[x+i*25+20,y-118],[x+i*29+10,y-90]],'#9c548d');
    for(let i=0;i<13;i++) {rect(c,x+8+i*9,y-53,7,9,i%3?'#69416f':'#98704b');}
    label(c,'SEM FIADO',x+69,y-15,11,'#f3dab3');
  }
  function scene(c,biome,width,cam,time,variant='') {
    const p=colors[biome], dusk=variant==='market';
    const sky=dusk?['#b78491','#d6a088','#edbf92']:p.sky;
    sky.forEach((color,i)=>rect(c,0,i*150,width,150,color));rect(c,0,450,width,270,sky[2]);
    blob(c,width*.77,93,94,94,dusk?'#f4cf94':'#f5df9e');blob(c,width*.77+8,101,78,78,dusk?'#ffdf9a':'#fff0b5');
    for(let i=-1;i<7;i++)cloud(c,i*310-(cam*.08+time*2)%310,103+(i%3)*45,.7+(i%2)*.25);
    for(let layer=0;layer<2;layer++) {
      const speed=layer?.18:.08,step=biome==='desert'?390:280;
      for(let i=-1;i<width/step+2;i++) {
        const x=i*step-cam*speed%step,y=layer?452:366;
        if(biome==='desert')poly(c,[[x-120,620],[x-45,y+115],[x+9,y+110],[x+45,y+20],[x+65,y+20],[x+65,y],[x+149,y],[x+160,y+22],[x+183,y+22],[x+236,y+125],[x+270,y+125],[x+359,620]],layer?p.mid:p.far);
        else blob(c,x-75,y-80,330,310,layer?p.mid:p.far);
      }
    }
    if(biome==='forest'||biome==='coast') {
      rect(c,0,490,width,230,biome==='forest'?'#688f7d':'#6babbc');
      for(let i=0;i<46;i++) {const x=(i*87-cam*.24+time*(i%2?3:-3))%(width+180);rect(c,x,503+i%7*22,20+hash(i,3)*42,3,biome==='forest'?'#adc5a0':'#c0dadd');}
    }
    if(biome==='desert') {
      for(let i=-1;i<width/370+2;i++){const x=i*370-cam*.4%370;house(c,x+30,574,i);cactus(c,x+235,601,.7);}
      if(variant==='market')for(let i=-1;i<width/320+2;i++)stall(c,i*320-cam*.65%320+10,604);
    } else if(biome==='forest') {
      for(let i=-1;i<width/370+2;i++)tree(c,i*370-cam*.4%370+65,608,.95+(i%2)*.2,p);
      if(variant==='river')for(let i=-1;i<width/420+1;i++){const x=i*420-cam*.55%420;rect(c,x,548,178,9,'#9d8b64');for(let k=0;k<6;k++)rect(c,x+k*31,555,7,53,'#6b7053');}
      for(let i=0;i<18;i++){const x=(i*117-cam*.5)%width,y=330+hash(i,9)*205;rect(c,x,y,3,3,'#dfdb8a');}
    } else {
      for(let i=-1;i<width/480+2;i++){
        const x=i*480-cam*.38%480;palm(c,x+25,609,.93,p);
        rect(c,x+186,461,72,132,'#d0cebb');rect(c,x+194,470,56,115,'#dfded1');
        rect(c,x+203,412,39,49,'#e2dfcd');rect(c,x+197,404,51,8,'#6e7283');
        poly(c,[[x+192,404],[x+222,380],[x+252,404]],'#806b79');rect(c,x+205,423,35,12,'#9c7484');
        rect(c,x+211,475,22,26,'#73939b');rect(c,x+211,549,22,38,'#82908a');
      }
      if(variant==='boardwalk')for(let i=0;i<width/190+1;i++){const x=i*190-cam*.65%190;rect(c,x,558,67,9,'#8c8270');rect(c,x+7,564,7,34,'#756e61');rect(c,x+51,564,7,34,'#756e61');rect(c,x,538,67,13,'#a5a089');}
    }
    // Vegetação baixa com bordas em degraus e pequenas folhas, sem curvas suaves.
    for(let i=-1;i<width/95+2;i++){const x=i*95-cam*.7%95;blob(c,x,576,123,43,p.dark);for(let j=0;j<7;j++)rect(c,x+j*17,580+hash(i,j)*19,7,4,p.leaf);}
  }
  function platform(c,p,biome) {
    const colorset=colors[biome],x=Math.round(p.x),y=Math.round(p.y),w=Math.round(p.w),h=p.ground?p.h:29;
    rect(c,x,y,w,h,colorset.soil);rect(c,x,y+12,w,5,'#503f3940');
    // Tijolinhos/rochas em padrão determinístico; o recorte evita vazamento nas bordas.
    c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
    for(let ty=20;ty<h;ty+=22)for(let tx=-25;tx<w;tx+=37) {
      const xx=x+tx+(ty%44?16:0),yy=y+ty;
      rect(c,xx,yy,28,14,colorset.stone);rect(c,xx+3,yy+2,17,3,'#ead29a23');rect(c,xx+28,yy+5,6,14,'#4e413522');
      if(hash(tx,ty)>.7)rect(c,xx+12,yy+9,4,3,'#4c483b42');
    }
    rect(c,x,y,w,9,colorset.grass);
    for(let tx=0;tx<w;tx+=14) {rect(c,x+tx,y-3,9,4,colorset.grass);rect(c,x+tx+3,y+7,5,5,colorset.grass);rect(c,x+tx,y,4,2,'#cccb7d');}
    c.restore();
    if(p.move) {rect(c,x+w/2-13,y+13,26,12,'#4c5351');label(c,p.move.axis==='x'?'↔':'↕',x+w/2,y+24,14,'#ecd293');}
  }
  function berry(c,x,y,scale=1,gold=false) {
    c.save();c.translate(Math.round(x),Math.round(y));c.scale(scale,scale);
    const a=gold?'#b97a31':'#41244f',b=gold?'#e1ac48':'#71418d',d=gold?'#ffe795':'#b585c1';
    [[-9,0],[0,0],[-4,-7]].forEach(([bx,by])=>{rect(c,bx-1,by,10,9,a);rect(c,bx+1,by+1,7,5,b);rect(c,bx+2,by+1,3,2,d);});
    rect(c,1,-11,3,5,'#53784b');rect(c,4,-12,7,3,'#81a559');c.restore();
  }
  function enemy(c,e,time) {
    c.save();if(e.hitTimer>0)c.globalAlpha=.55;
    if(e.type==='boss'){sprite(c,2,e.shootTimer<.35?3:1+Math.floor(time*6)%2,e.x+e.w/2,e.y+e.h,112,e.direction);c.restore();
      rect(c,e.x-16,e.y-50,90,21,'#253047');label(c,'O PROFETA',e.x+29,e.y-35,10,'#eee5ce');
      rect(c,e.x-14,e.y-25,86,9,'#263047');rect(c,e.x-12,e.y-23,82*e.hp/(e.maxHp||6),5,'#89b0d4');return;}
    const x=Math.round(e.x),y=Math.round(e.y),stride=Math.floor(time*8)%2*4;
    // Capangas originais: copinhos de açaí mal-humorados e caranguejos de praia.
    if(e.variant==='crab') {
      for(let d=-1;d<=1;d+=2){rect(c,x+21+d*23,y+16,9,12,'#804d50');rect(c,x+21+d*25,y+8,11,11,'#c97b66');rect(c,x+21+d*23,y+5,4,6,'#e6ac80');}
      blob(c,x+1,y+16,40,20,'#8d4f53');blob(c,x+4,y+13,34,19,'#c77764');
    } else {
      poly(c,[[x+2,y+7],[x+40,y+7],[x+34,y+36],[x+9,y+36]],'#362839');
      poly(c,[[x+5,y+10],[x+37,y+10],[x+31,y+33],[x+12,y+33]],'#986392');rect(c,x,y+6,42,6,'#dec894');rect(c,x+6,y+1,30,6,'#4d2c64');
      rect(c,x+12,y+22,20,4,'#d4aeaa');
    }
    rect(c,x+9,y+15,9,7,'#fbebcd');rect(c,x+26,y+15,9,7,'#fbebcd');rect(c,x+13,y+17,4,5,'#342c35');rect(c,x+27,y+17,4,5,'#342c35');
    rect(c,x+7-stride,y+37,12,7,'#3c3340');rect(c,x+25+stride,y+37,12,7,'#3c3340');c.restore();
  }
  window.WanzellerArt={sheet,sprite,portrait,scene,platform,berry,enemy,cactus,palm,cloud};
})();
