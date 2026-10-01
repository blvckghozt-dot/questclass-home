/* Real character art (PixelLab sprite sheets) with runtime element recolouring and frame animation.
   Sheet layout per race/stage: one row of square cells —
   [still, idle×4, attack×8, hurt×4, victory×6, defeat×6]. Magenta-pink "key" pixels are
   repainted in the element colour at load time, so one sheet serves all 8 elements. */
var RealArt = (function () {
  'use strict';
  var BASE = 'sprites/';
  var ANIMS = { still: [0, 1], idle: [1, 4], attack: [5, 8], hurt: [13, 4], victory: [17, 6], defeat: [23, 6], walk: [29, 6] }; // walk is optional (sheets wider than 29 cells)
  var MANIFEST = {};
  ['human', 'dwarf', 'machina', 'demon', 'high_elf', 'beastkin', 'celestial', 'fairy'].forEach(function (r) { MANIFEST[r] = { cell: 192, stages: [1, 10, 20, 35, 50, 65, 80, 99] }; });
  // recolour base per element (earth uses a lighter brown so the ramp reads on a scarf)
  var ELEM_BASE = { earth: '#8a5a3c', water: '#94e7f5', wind: '#48d58b', fire: '#ef4f3f', ice: '#2c46c8', lightning: '#ffb61c', light: '#fffdf6', dark: '#120b1a' };
  var raw = {}, masks = {}, sheets = {}, portraits = {}, listeners = [];

  function has(race, stage) { var m = MANIFEST[race]; return !!(m && m.stages.indexOf(stage) >= 0); }
  function notify() { listeners.forEach(function (f) { try { f(); } catch (e) { } }); }
  function onReady(f) { listeners.push(f); return function () { listeners = listeners.filter(function (x) { return x !== f; }); }; }

  function loadRaw(race, stage) {
    var k = race === 'npc' ? stage : race + '-' + stage; // npc sheets: teacher, mon-<id> (never recoloured)
    if (raw[k]) return raw[k];
    raw[k] = new Promise(function (res, rej) {
      var img = new Image();
      img.onload = function () { res(img); };
      img.onerror = function () { rej(new Error('sprite not found: ' + k)); };
      img.src = BASE + k + '.png';
    });
    raw[k].catch(function () { });
    return raw[k];
  }

  function hex(h) { h = h.replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function hls(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn, h = 0, s = 0;
    if (d > 1e-6) {
      s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, l, s];
  }
  // which pixels carry the element colour: saturated magenta-pink areas (>=10 px),
  // grown by 2 px into violet-tinted glow fringe and dark outlines that hug them
  function buildMask(data, W, H, minComp, wide) {
    minComp = minComp || 10;
    var n = W * H, key = new Uint8Array(n), loose = new Uint8Array(n), i;
    for (i = 0; i < n; i++) {
      var a = data[i * 4 + 3]; if (a <= 100) continue;
      var c = hls(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]), h = c[0], l = c[1], s = c[2];
      if (wide ? (h >= 258 && h <= 348 && s >= 0.35 && l >= 0.09) : (h >= 268 && h <= 345 && s >= 0.55 && l >= 0.22)) key[i] = 1;
      if (h >= 250 && h <= 348 && s >= (wide ? 0.25 : 0.3)) loose[i] = 1;
    }
    var mask = new Uint8Array(n), seen = new Uint8Array(n), stack = new Int32Array(n), comp = new Int32Array(n);
    for (i = 0; i < n; i++) {
      if (!key[i] || seen[i]) continue;
      var sp = 0, cn = 0; stack[sp++] = i; seen[i] = 1;
      while (sp) {
        var p = stack[--sp]; comp[cn++] = p;
        var x = p % W, y = (p / W) | 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          var q = yy * W + xx; if (key[q] && !seen[q]) { seen[q] = 1; stack[sp++] = q; }
        }
      }
      if (cn >= minComp) for (var k = 0; k < cn; k++) mask[comp[k]] = 1;
    }
    for (var it = 0; it < 2; it++) {
      var add = [];
      for (i = 0; i < n; i++) {
        if (!mask[i]) continue;
        var x2 = i % W, y2 = (i / W) | 0;
        for (var ey = -1; ey <= 1; ey++) for (var ex = -1; ex <= 1; ex++) {
          var x3 = x2 + ex, y3 = y2 + ey; if (x3 < 0 || y3 < 0 || x3 >= W || y3 >= H) continue;
          var q2 = y3 * W + x3; if (!mask[q2] && loose[q2]) add.push(q2);
        }
      }
      for (var z = 0; z < add.length; z++) mask[add[z]] = 1;
    }
    return mask;
  }
  // work queue so recolouring many sheets never blocks the page for long
  var q = Promise.resolve();
  function enqueue(fn) { var p = q.then(function () { return new Promise(function (r) { setTimeout(r, 0); }); }).then(fn); q = p.catch(function () { }); return p; }
  // Second recolour layer: gold / red trims of outfits and weapons are tinted toward the element colour
  // (keeping their own light and shade). Races with blonde hair or orange fur skip the gold band.
  var ACCENT = { human: 'gold+red', dwarf: 'fairy-none', machina: 'gold+red', demon: 'gold+red', fairy: 'gold+red', high_elf: 'red', celestial: 'red', beastkin: 'red' };
  function buildAccent(data, W, H, C, mode, keyMask) {
    var n = W * H, m = new Uint8Array(n), gold = mode.indexOf('gold') >= 0, warm = mode === 'warm' || mode === 'demon', demonAll = mode === 'demon', human = mode.indexOf('human') === 0, navy = mode.indexOf('human-navy') === 0, navyLo = mode === 'human-navy80', elf = mode.indexOf('elf-') === 0, fairy = mode.indexOf('fairy-') === 0 && mode !== 'fairy-all', i;
    var cells = Math.round(W / C);
    for (var c = 0; c < cells; c++) {
      var top = -1, bot = -1, x0 = c * C;
      for (var y = 0; y < H && top < 0; y++) for (var x = x0; x < x0 + C; x++) if (data[(y * W + x) * 4 + 3] > 100) { top = y; break; }
      for (var y2 = H - 1; y2 >= 0 && bot < 0; y2--) for (var x2 = x0; x2 < x0 + C; x2++) if (data[(y2 * W + x2) * 4 + 3] > 100) { bot = y2; break; }
      if (top < 0) continue;
      var hx = -1, hy = -1;
      if (human || elf || fairy) { // locate the head: body centre from the lower half, then the first opaque row near that centre
        var sx = 0, sc = 0;
        for (var ly = bot - 50; ly <= bot; ly++) for (var lx = x0; lx < x0 + C; lx++) if (data[(ly * W + lx) * 4 + 3] > 100) { sx += lx; sc++; }
        hx = sc ? Math.round(sx / sc) : x0 + C / 2;
        for (var hy2 = top; hy2 <= bot && hy < 0; hy2++) for (var hx2 = hx - 8; hx2 <= hx + 8; hx2++) if (data[(hy2 * W + hx2) * 4 + 3] > 100) { hy = hy2; break; }
      }
      var ht = -1;
      if (fairy) { // hairTop: first green, fairly saturated, not-pale row near the body centre
        for (var fy = top; fy <= bot && ht < 0; fy++) for (var fx = hx - 20; fx <= hx + 20; fx++) { var fi = fy * W + fx; if (data[fi * 4 + 3] > 100) { var fq = hls(data[fi * 4], data[fi * 4 + 1], data[fi * 4 + 2]); if (fq[0] >= 80 && fq[0] <= 165 && fq[2] >= 0.4 && fq[1] >= 0.15 && fq[1] <= 0.62) { ht = fy; break; } } }
        if (ht < 0) ht = top;
      }
      var yMin = warm || human || elf || fairy || mode === 'fairy-all' || mode === 'celestial-gold' || mode.indexOf('beast') === 0 ? top : Math.floor(top + (bot - top) * 0.26); // skip the head (hair); 'warm' armour includes the helmet
      for (var yy = yMin; yy <= bot; yy++) for (var xx = x0; xx < x0 + C; xx++) {
        i = yy * W + xx; if (keyMask[i] || data[i * 4 + 3] <= 100) continue;
        var q = hls(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]), h = q[0], l = q[1], s = q[2];
        if ((human || elf) && yy < hy + 46 && Math.abs(xx - hx) < 28) continue; // skin and hair
        if (mode.indexOf('beast') === 0) { // beastkin: white parts (ear insides, tail tips, hair tie; whole Lv99 outfit) + red trims/armour (Lv50–80); orange fur/hair and the rest stay original
          var bw99 = mode === 'beast-99';
          if (l >= 0.78 || (l >= 0.6 && s <= 0.3) || (h >= 36 && h <= 64 && l >= 0.6 && s >= 0.45) || (bw99 && h >= 165 && h <= 220 && s >= 0.3 && l >= 0.3)) m[i] = 1; // every white / pale-cream part (tail tips, inner ears, shirt) takes a soft element tone // Lv99 also: yellow-cream tail tips and the icy-blue gauntlets // cream-white has a high HLS saturation, so lightness alone decides
          else if (mode !== 'beast-w' && !bw99 && (h >= 348 || h <= 7) && s >= 0.55 && l >= 0.15 && l <= 0.8 && yy > top + (bot - top) * 0.3) m[i] = 1;
          continue; }
        if (mode === 'celestial-gold') { if (((h >= 35 && h <= 66 && s >= 0.35) || (h >= 22 && h < 35 && s >= 0.68 && l <= 0.55) || ((h >= 348 || h <= 7) && s >= 0.55)) && l >= 0.2 && l <= 0.93) m[i] = 1; continue; } // Lv50+: blonde hair and every yellow/gold part (weapon, trim, armour, halo); wings and white robes keep their colour
        if (mode === 'fairy-all') { if (h >= 75 && h <= 165 && s >= 0.28 && l >= 0.1 && l <= 0.9) m[i] = 1; continue; } // Lv50–99: every green area (hair, dress, wings, weapon)
        if (mode === 'fairy-hair' || mode === 'fairy-green2' || mode === 'fairy-red' || mode === 'fairy-none') { // fairy Lv20–80: hair (+ dress for 35/80 green, 50/65 red/pink); Lv20 keeps its gold armour
          if (mode === 'fairy-none') continue;
          if (yy < ht + 30) { if (mode !== 'fairy-green2' && Math.abs(xx - hx) <= 30 && h >= 80 && h <= 165 && s >= 0.25 && l >= 0.12 && l <= 0.8) m[i] = 1; continue; }
          if (mode === 'fairy-hair' || yy < ht + 30) continue;
          if (mode === 'fairy-green2' ? (Math.abs(xx - hx) <= 34 && h >= 80 && h <= 165 && s >= 0.3 && l >= 0.1 && l <= 0.55)
            : (Math.abs(xx - hx) <= 46 && ((h >= 330 || h <= 12) && s >= 0.45 && l >= 0.15 && l <= 0.75))) m[i] = 1;
          continue; }
        if (fairy) { // fairy Lv99: green hair and dress follow the element; wings, skin and book keep their own colours
          if (Math.abs(xx - hx) <= 56 && yy >= hy && h >= 80 && h <= 165 && s >= 0.25 && l >= 0.12 && l <= 0.85) m[i] = 1;
          continue; }
        if (elf) { // high elf outfits per stage: blue robe (10), green dress (20–35), white robe (50/65/99), silver armour (80)
          if (h >= 5 && h <= 30 && s > 0.35 && l > 0.45) continue; // skin
          if (mode === 'elf-blue' ? (h >= 185 && h <= 220 && s >= 0.3 && l >= 0.18 && l <= 0.92)
            : mode === 'elf-green' ? (h >= 65 && h <= 150 && s >= 0.18 && l >= 0.1 && l <= 0.85)
            : mode === 'elf-white' ? ((l >= 0.66 && s <= 0.5) || l >= 0.93)
            : (l >= 0.28 && ((s <= 0.35 && h >= 180 && h <= 260) || s < 0.08))) m[i] = 1;
          continue; }
        if (human) { // human: red-orange capes/skirts at any stage, navy under-armour cloth on Lv20–80; gold trims stay original
          if (l >= 0.1 && l <= 0.85 && (((h >= 348 || h <= 18) && s >= 0.5) || (h > 18 && h <= 30 && s >= 0.7 && l >= 0.45))) m[i] = 1;
          else if (navy && h >= 195 && h <= (navyLo ? 275 : 255) && s >= (navyLo ? 0.07 : 0.14) && l >= 0.04 && l <= 0.5) m[i] = 1;
          continue; }
        if (demonAll) { if (l >= 0.08 && l <= 0.93 && s >= 0.2 && !(h >= 8 && h <= 42 && l > 0.5) && !(yy > bot - (bot - top) * 0.12 && h >= 3 && h <= 42)) m[i] = 1; continue; } // every colour that is not black/grey, except warm skin
        if (warm) { if (l >= 0.07 && l <= 0.94 && ((h >= 10 && h <= 62 && s >= 0.26) || ((h >= 348 || h < 10) && s >= 0.5))) m[i] = 1; continue; }
        if (l < 0.2 || l > 0.85) continue;
        if ((gold && h >= 36 && h <= 58 && s >= 0.45) || ((h >= 348 || h <= 7) && s >= 0.55)) m[i] = 1;
      }
    }
    // drop specks smaller than 6 px
    var seen = new Uint8Array(n), stack = new Int32Array(n), comp = new Int32Array(n);
    for (i = 0; i < n; i++) {
      if (!m[i] || seen[i]) continue;
      var sp = 0, cn = 0; stack[sp++] = i; seen[i] = 1;
      while (sp) { var p = stack[--sp]; comp[cn++] = p; var px = p % W, py = (p / W) | 0;
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) { var xq = px + dx, yq = py + dy; if (xq < 0 || yq < 0 || xq >= W || yq >= H) continue; var qq = yq * W + xq; if (m[qq] && !seen[qq]) { seen[qq] = 1; stack[sp++] = qq; } } }
      if (cn < (warm || mode === 'fairy-all' ? 2 : mode === 'celestial-gold' ? 3 : mode.indexOf('beast') === 0 ? 5 : 6)) for (var k = 0; k < cn; k++) m[comp[k]] = 0;
    }
    return m;
  }
  function hsl2rgb(h, s, l) {
    var f = function (n) { var k = (n + h / 30) % 12, a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
    return [f(0), f(8), f(4)];
  }
  function tintAccent(d, m, base, k, lw) {
    k = k || 0.85; lw = lw || 0.12; // lw: how far lightness is pulled toward the element colour (pale robes need more)
    var b = hls(base[0], base[1], base[2]), bh = b[0], bl = b[1], bs = b[2];
    for (var i = 0; i < m.length; i++) {
      if (!m[i]) continue;
      var o = i * 4, q = hls(d[o], d[o + 1], d[o + 2]);
      var w = lw === 'auto' ? (q[1] > 0.6 ? 0.55 : 0.12) : lw;
      if (bl > 0.9) w = Math.max(w, 0.5); // light element: lift gold / yellow parts toward near-white // 'auto': pale (white) pixels take the element lightness more strongly so they read as coloured
      var nl = Math.min(0.92, Math.max(0.06, q[1] * (w > 0.12 ? 1 - w : 0.9) + bl * w)), ns = bl < 0.15 ? 0.08 : bl > 0.9 ? 0.12 : Math.min(1, Math.max(q[2] * 0.85, bs * 0.9, 0.35));
      var c = hsl2rgb(bh, ns, nl);
      for (var ch = 0; ch < 3; ch++) d[o + ch] = c[ch] * k + d[o + ch] * (1 - k);
    }
  }
  // part: 'still' (first cell only, cheap) or 'full' (all animation frames)
  function sheet(race, elem, stage, part) {
    part = part || 'full';
    var k = race + '-' + stage + '-' + elem + '-' + part;
    if (sheets[k]) return sheets[k];
    sheets[k] = loadRaw(race, stage).then(function (img) {
      return enqueue(function () {
        var H = img.naturalHeight, W = part === 'still' ? H : img.naturalWidth;
        var c = document.createElement('canvas'); c.width = W; c.height = H;
        var ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(img, 0, 0, W, H, 0, 0, W, H);
        var id = ctx.getImageData(0, 0, W, H), d = id.data;
        if (race === 'npc') return { canvas: c, cell: H, part: part };
        var mk = race + '-' + stage + '-' + part;
        if (!masks[mk]) masks[mk] = buildMask(d, W, H, race === 'machina' && stage >= 99 ? 3 : race === 'dwarf' ? 3 : 10, race === 'dwarf'); // Lv99 drones are tiny pink specks
        var mask = masks[mk], base = hex(ELEM_BASE[elem] || ELEM_BASE.fire);
        if (!masks['a' + mk]) masks['a' + mk] = buildAccent(d, W, H, H, race === 'machina' && stage >= 50 ? 'warm' : race === 'demon' ? 'demon' : race === 'beastkin' ? (stage === 99 ? 'beast-99' : stage >= 50 ? 'beast-wr' : 'beast-w') : race === 'celestial' && (stage === 50 || stage === 65) ? 'fairy-none' : race === 'celestial' && stage >= 50 ? 'celestial-gold' : race === 'fairy' && stage === 20 ? 'fairy-none' : race === 'fairy' && stage === 35 ? 'fairy-green2' : race === 'fairy' && stage >= 50 ? 'fairy-all' : race === 'high_elf' && stage >= 10 ? (stage === 10 ? 'elf-blue' : stage <= 35 ? 'elf-green' : stage === 80 ? 'elf-armor' : 'elf-white') : race === 'human' ? (stage === 80 ? 'human-navy80' : stage >= 20 && stage <= 80 ? 'human-navy' : 'human-red') : ACCENT[race] || 'gold+red', mask);
        tintAccent(d, masks['a' + mk], base, (race === 'machina' && stage >= 50) || race === 'demon' || race === 'human' || (race === 'high_elf' && stage >= 10) || (race === 'fairy' && stage >= 20) || (race === 'celestial' && stage >= 50) || race === 'beastkin' ? 1 : 0.85, race === 'beastkin' ? 'auto' : race === 'celestial' && stage >= 50 ? 0.12 : (race === 'high_elf' && stage >= 50 && stage !== 80) ? 0.3 : race === 'high_elf' && stage === 80 ? 0.22 : 0.12);
        var dark = base.map(function (v) { return v * 0.28; }), light = base.map(function (v) { return v + (255 - v) * 0.75; });
        for (var i = 0; i < mask.length; i++) {
          if (!mask[i]) continue;
          var o = i * 4, mx = Math.max(d[o], d[o + 1], d[o + 2]), mn = Math.min(d[o], d[o + 1], d[o + 2]);
          var t = Math.max(0, Math.min(1, ((mx + mn) / 510 - 0.12) / 0.8));
          for (var ch = 0; ch < 3; ch++) d[o + ch] = t < 0.5 ? dark[ch] + (base[ch] - dark[ch]) * (t / 0.5) : base[ch] + (light[ch] - base[ch]) * ((t - 0.5) / 0.5);
        }
        ctx.putImageData(id, 0, 0);
        return { canvas: c, cell: H, part: part };
      });
    });
    sheets[k].then(notify, function () { });
    return sheets[k];
  }
  function portrait(race, elem, stage) {
    var k = race + '-' + stage + '-' + elem;
    if (portraits[k]) return portraits[k];
    portraits[k] = sheet(race, elem, stage, 'still').then(function (s) {
      var C = s.cell, c = document.createElement('canvas'); c.width = C; c.height = C;
      var ctx = c.getContext('2d', { willReadFrequently: true }); ctx.drawImage(s.canvas, 0, 0, C, C, 0, 0, C, C);
      var d = ctx.getImageData(0, 0, C, C).data, top = C, sumX = 0, cnt = 0, xs = [];
      var lo = C, hi = 0, bx = 0, bc = 0, wide = race === 'celestial' || race === 'fairy'; // wings/halo can reach higher than the head: search only near the body centre
      if (wide) {
        for (var yy0 = 0; yy0 < C; yy0++) for (var xx0 = 0; xx0 < C; xx0++) if (d[(yy0 * C + xx0) * 4 + 3] > 80) { if (yy0 < lo) lo = yy0; if (yy0 > hi) hi = yy0; }
        for (var yy1 = Math.max(lo, hi - 50); yy1 <= hi; yy1++) for (var xx1 = 0; xx1 < C; xx1++) if (d[(yy1 * C + xx1) * 4 + 3] > 80) { bx += xx1; bc++; }
      }
      var bcx = bc ? bx / bc : C / 2, cel = race === 'celestial';
      if (cel) { // white wings tower over the head: use the first row with a few coloured (hair/halo) pixels instead
        var wideCnt = function (yy) { var n = 0; for (var xq = 0; xq < C; xq++) { var iq = (yy * C + xq) * 4; if (d[iq + 3] > 80) { var mx = Math.max(d[iq], d[iq + 1], d[iq + 2]), mn = Math.min(d[iq], d[iq + 1], d[iq + 2]); if (mx - mn > 50 && Math.abs(xq - bcx) < 34) n++; } } return n; };
        for (var ty = 0; ty < C; ty++) if (wideCnt(ty) >= 5) { top = ty; break; }
      }
      for (var y = 0; y < C && top === C; y++) for (var x = wide ? Math.max(0, Math.round(bcx - 16)) : 0; x < (wide ? Math.min(C, Math.round(bcx + 16)) : C); x++) if (d[(y * C + x) * 4 + 3] > 80) { top = y; break; }
      for (var y2 = top; y2 < Math.min(C, top + 34); y2++) for (var x2 = wide ? Math.max(0, Math.round(bcx - 30)) : 0; x2 < (wide ? Math.min(C, Math.round(bcx + 30)) : C); x2++) if (d[(y2 * C + x2) * 4 + 3] > 80 && (!cel || (d[(y2 * C + x2) * 4 + 1] - d[(y2 * C + x2) * 4 + 2] > 30 && d[(y2 * C + x2) * 4] - d[(y2 * C + x2) * 4 + 1] < 70))) { sumX += x2; cnt++; xs.push(x2); }
      xs.sort(function (a, b) { return a - b; });
      var cx = cnt ? (race === 'celestial' ? xs[xs.length >> 1] : sumX / cnt) : C / 2, S = 60, sx = Math.round(Math.max(0, Math.min(C - S, cx - S / 2))), sy = Math.max(0, top - 4);
      var out = document.createElement('canvas'); out.width = S; out.height = S;
      var o = out.getContext('2d'); o.imageSmoothingEnabled = false; o.drawImage(c, sx, sy, S, S, 0, 0, S, S);
      return out.toDataURL('image/png');
    });
    portraits[k].then(notify, function () { });
    return portraits[k];
  }
  // synchronous peeks for render code
  var ready = {};
  function peek(map, k) { return ready[map + k]; }
  function track(p, key) { p.then(function (v) { ready[key] = v; }, function () { ready[key] = null; }); }
  function sheetNow(race, elem, stage, part) { part = part || 'full'; var k = 's' + race + '-' + stage + '-' + elem + '-' + part; if (!(k in ready)) { ready[k] = undefined; track(sheet(race, elem, stage, part), k); } return ready[k]; }
  function portraitNow(race, elem, stage) { var k = 'p' + race + '-' + stage + '-' + elem; if (!(k in ready)) { ready[k] = undefined; track(portrait(race, elem, stage), k); } return ready[k]; }

  // one shared animation clock for every sprite on screen
  var subs = new Set(), running = false;
  function loop(t) { subs.forEach(function (f) { f(t); }); if (subs.size) requestAnimationFrame(loop); else running = false; }
  function tick(f) { subs.add(f); if (!running) { running = true; requestAnimationFrame(loop); } return function () { subs.delete(f); }; }

  return { has: has, ANIMS: ANIMS, MANIFEST: MANIFEST, sheet: sheet, portrait: portrait, sheetNow: sheetNow, portraitNow: portraitNow, onReady: onReady, tick: tick, ELEM_BASE: ELEM_BASE };
})();
