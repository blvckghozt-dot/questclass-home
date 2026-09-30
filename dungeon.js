// Home dungeon (student side). Depends on globals QC (core.js) and RealArt (realart-core.js).
const $c = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
const save = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v)); } catch (e) { } };
const load = (k) => { try { const v = localStorage.getItem(k); return v == null ? null : v; } catch (e) { return null; } };
const loadJ = (k, d) => { try { return JSON.parse(load(k)) ?? d; } catch (e) { return d; } };
const DIFF_TH = { easy: 'ง่าย', medium: 'กลาง', hard: 'ยาก' };
const MODE_TH = {};

async function spriteCanvas(cv, id, animate) {
  let sh;
  try { sh = await RealArt.sheet('npc', null, 'mon-' + id, animate ? 'full' : 'still'); } catch (e) { return () => { }; }
  const C = sh.cell, d = sh.canvas.getContext('2d').getImageData(0, 0, C, C).data;
  let x0 = C, x1 = 0, y0 = C, y1 = 0;
  for (let y = 0; y < C; y++) for (let x = 0; x < C; x++) if (d[(y * C + x) * 4 + 3] > 60) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 <= x0) return () => { };
  const S = Math.min(C, Math.max(x1 - x0, y1 - y0) + 12), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const sx = Math.max(0, Math.min(C - S, Math.round(cx - S / 2))), sy = Math.max(0, Math.min(C - S, Math.round(cy - S / 2)));
  cv.width = S; cv.height = S; const ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
  if (!animate) { ctx.drawImage(sh.canvas, sx, sy, S, S, 0, 0, S, S); return () => { }; }
  const A = RealArt.ANIMS.idle; let last = -1;
  return RealArt.tick((t) => { const f = Math.floor(t / 180) % A[1]; if (f === last) return; last = f; ctx.clearRect(0, 0, S, S); ctx.drawImage(sh.canvas, (A[0] + f) * C + sx, sy, S, S, 0, 0, S, S); });
}

export function initDungeon(host, ctx) {
  // ctx: { code, doc, demo, getDb: async () => ({db, fs}) }
  host.textContent = '';
  const doc = ctx.doc, code = ctx.code, week = QC.homeWeekOf(Date.now());
  const rewards = doc.dr || null;
  const wk = doc.wk && doc.wk.key === week ? doc.wk : null;
  const won = new Set(wk && wk.won ? wk.won : []);
  const hist = loadJ('qc.dgh.' + code, []);
  const pendingWins = new Set(hist.filter((h) => h.win && h.week === week).map((h) => h.m));
  const stops = [];

  const head = $c('div', 'dg-head');
  const fx = (n) => (Math.round((+n || 0) * 10) / 10).toString();
  const cap = wk ? fx(wk.used) + ' / ' + fx(wk.cap) : '0 / ' + ((doc.wk && doc.wk.cap) || 15);
  head.append($c('div', 'small', 'EXP จากดันเจี้ยนที่บ้านสัปดาห์นี้: ' + cap), $c('div', 'tiny muted', 'ตอบถูกครบ 10 ข้อ ข้อละไม่เกิน ' + QC.HOME_SECONDS + ' วินาที จึงชนะ • ชนะแต่ละตัวได้ EXP 1 ครั้ง/สัปดาห์ • แพ้ลองใหม่ได้ ข้อสอบชุดใหม่ทุกครั้ง • EXP เข้าเมื่อครูตรวจ'));
  host.append(head);

  const log = doc.log || [];
  if (log.length) {
    const box = $c('div', 'dg-log');
    for (const l of log.slice(-4).reverse()) box.append($c('div', 'tiny ' + (l.w ? 'ok' : 'muted'), (l.w ? '✔ ชนะ ' : '✘ ไม่ผ่าน ') + (QC.homeMonsterById[l.m] ? QC.homeMonsterById[l.m].th : l.m) + (l.w ? (l.e ? ' +' + fx(l.e) + ' EXP' : ' (ไม่ได้ EXP: ชนะแล้ว/เต็มเพดาน)') : ' ' + (l.r | 0) + '/10')));
    host.append(box);
  }

  const grid = $c('div', 'dg-grid'); host.append(grid);
  const io = 'IntersectionObserver' in window ? new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { io.unobserve(e.target); e.target.__load && e.target.__load(); } }, { rootMargin: '200px' }) : null;
  for (const m of QC.HOME_MONSTERS) {
    const card = $c('button', 'dg-card'); card.type = 'button';
    const cv = $c('canvas', 'dg-sp'); cv.width = 48; cv.height = 48;
    const status = won.has(m.id) ? 'won' : pendingWins.has(m.id) ? 'wait' : '';
    const exp = QC.homeReward(rewards, m.id);
    card.append(cv, $c('b', '', m.th), $c('span', 'tiny muted', DIFF_TH[m.diff] + ' • ' + fx(exp) + ' EXP'), $c('span', 'tiny st ' + status, status === 'won' ? 'ชนะแล้ว ✔' : status === 'wait' ? 'รอครูตรวจ' : 'ท้าสู้'));
    if (status === 'won') card.disabled = true;
    card.onclick = () => start(m.id);
    card.__load = () => spriteCanvas(cv, m.id, false);
    io ? io.observe(card) : card.__load();
    grid.append(card);
  }

  // ---------- round ----------
  let ov = null, stopAnim = null, keyH = null;
  function close() { if (stopAnim) { stopAnim(); stopAnim = null; } if (keyH) { document.removeEventListener('keydown', keyH); keyH = null; } if (ov) { ov.remove(); ov = null; } document.body.style.overflow = ''; }
  function overlay() { close(); ov = $c('div', 'dg-ov'); document.body.append(ov); document.body.style.overflow = 'hidden'; return ov; }
  const skey = (m) => 'qc.dgs.' + code + '.' + m;

  async function nextAttempt(m) {
    let n = Math.max(1, +load('qc.dgn.' + code + '.' + m) || 1);
    if (ctx.demo) return n;
    const { db, fs } = await ctx.getDb();
    for (; n < 999; n++) { const s = await fs.getDoc(fs.doc(db, 'homes', code, 'runs', m + '-' + n)); if (!s.exists()) return n; }
    throw new Error('เล่นครบจำนวนรอบสูงสุดแล้ว แจ้งครู');
  }
  async function start(m) {
    const o = overlay(); o.append($c('p', 'muted', 'กำลังเตรียมห้องดันเจี้ยน…'));
    try {
      let st = loadJ(skey(m), null);
      if (!st || st.week !== week) {
        const n = await nextAttempt(m);
        st = { m, n, week, seed: QC.homeSeed(code, m, week, n), idx: 0, ans: [], ms: [] };
        save(skey(m), st);
      }
      play(st);
    } catch (e) { o.textContent = ''; o.append($c('p', 'err', 'เริ่มไม่ได้: ' + (e.message || e.code)), btn('กลับ', close)); }
  }
  function btn(t, f, cls) { const b = $c('button', 'btn ' + (cls || ''), t); b.type = 'button'; b.onclick = f; return b; }

  function play(st) {
    const qs = QC.homeQuestions(st.m, st.seed), mon = QC.homeMonsterById[st.m], LIM = QC.HOME_SECONDS * 1000;
    const o = overlay();
    const top = $c('div', 'dg-top'); top.append($c('b', '', mon.th), btn('ออก', close, 'sm'));
    const cv = $c('canvas', 'dg-hero'); cv.width = 64; cv.height = 64;
    spriteCanvas(cv, st.m, true).then((s) => { if (ov === o) stopAnim = s; else s(); });
    if (!st.began) {
      // intro: nothing about the questions is visible until the player presses start
      o.append(top, cv, $c('h2', '', 'พร้อมสู้กับ ' + mon.th + ' ไหม?'));
      const rules = $c('ul', 'dg-rules');
      for (const t of ['10 ข้อ ข้อละ ' + QC.HOME_SECONDS + ' วินาที หมดเวลาถือว่าผิด', 'ต้องถูกครบทุกข้อจึงชนะ', 'ห้ามออกจากหน้านี้ระหว่างเล่น (สลับแอป/เปิดเครื่องคิดเลข) ข้อนั้นจะถือว่าหมดเวลา', 'ใช้คิดในใจหรือกระดาษ เพื่อให้เก่งขึ้นจริง']) rules.append($c('li', 'small', t));
      o.append(rules, btn('เริ่มเลย!', () => { st.began = true; st.tq = Date.now(); save(skey(st.m), st); play(st); }, 'gold'));
      return;
    }
    const bar = $c('div', 'dg-timer'), fill = $c('i'); bar.append(fill); const secs = $c('div', 'dg-secs num');
    const prog = $c('div', 'dg-prog'); const q = $c('div', 'dg-q'); const inp = $c('div', 'dg-ans num');
    o.append(top, cv, prog, bar, secs, q, inp);
    let cur = '', done = false, iv = null;
    const pad = $c('div', 'dg-pad');
    const stopTimer = () => { if (iv) { clearInterval(iv); iv = null; } document.removeEventListener('visibilitychange', onVis); };
    // record an answer ('' = timed out / left the page) and move on
    const record = (ans, ms) => {
      if (done) return; st.ans.push(ans); st.ms.push(Math.max(0, Math.min(LIM, Math.round(ms)))); st.idx++; cur = ''; st.tq = Date.now(); save(skey(st.m), st);
      if (st.idx >= 10) { done = true; stopTimer(); return finish(st, qs); }
      show();
    };
    const expire = () => record('', LIM);
    const onVis = () => { if (document.hidden) { st.hid = Date.now(); save(skey(st.m), st); } else if (st.hid) { st.hid = 0; expire(); } };
    const show = () => {
      prog.textContent = 'ข้อ ' + (st.idx + 1) + ' / 10'; q.textContent = qs[st.idx].text; inp.textContent = cur || '…';
    };
    const tickT = () => {
      const left = LIM - (Date.now() - st.tq);
      if (left <= 0) return expire();
      fill.style.width = (left / LIM * 100).toFixed(1) + '%'; secs.textContent = Math.ceil(left / 1000); bar.classList.toggle('low', left <= 3000); secs.classList.toggle('low', left <= 3000);
    };
    const press = (k) => {
      if (done) return;
      if (k === 'DEL') cur = cur.slice(0, -1);
      else if (k === 'OK') return submit();
      else if (k === '-') cur = cur.startsWith('-') ? cur.slice(1) : '-' + cur;
      else if (k === '.') { if (!cur.includes('.')) cur += cur === '' || cur === '-' ? '0.' : '.'; }
      else if (/\d/.test(k) && cur.replace('-', '').length < 8) cur += k;
      show();
    };
    for (const k of ['7', '8', '9', '4', '5', '6', '1', '2', '3', '-', '0', '.', 'DEL', 'OK']) {
      const b = $c('button', 'key' + (k === 'OK' ? ' okk' : ''), k === 'DEL' ? '⌫' : k === 'OK' ? 'ตกลง' : k === '-' ? '−' : k); b.type = 'button'; b.onclick = () => press(k); pad.append(b);
    }
    o.append(pad);
    keyH = (e) => { if (/^[0-9.]$/.test(e.key) || e.key === '-') press(e.key); else if (e.key === 'Backspace') press('DEL'); else if (e.key === 'Enter') press('OK'); else if (e.key === ',') press('.'); };
    document.addEventListener('keydown', keyH);
    document.addEventListener('visibilitychange', onVis);
    function submit() {
      if (!cur || cur === '-') return;
      const el = Date.now() - st.tq; if (el > LIM) return expire();
      record(cur.endsWith('.') ? cur.slice(0, -1) : cur, el);
    }
    // came back after closing/reloading mid-question: that question is lost
    if (st.hid || Date.now() - st.tq > LIM) { st.hid = 0; show(); expire(); if (done) return; }
    show(); tickT(); iv = setInterval(tickT, 100);
    const oldClose = close; // leaving via the "ออก" button also stops the timer loop
    top.querySelector('button').onclick = () => { stopTimer(); close(); };
  }

  async function finish(st, qs) {
    const res = QC.homeCheck(qs, st.ans);
    const o = overlay(); o.append($c('p', 'muted', 'กำลังส่งผลให้ครู…'));
    const send = async () => {
      o.textContent = ''; o.append($c('p', 'muted', 'กำลังส่งผลให้ครู…'));
      try {
        if (!ctx.demo) {
          const { db, fs } = await ctx.getDb();
          await fs.setDoc(fs.doc(db, 'homes', code, 'runs', st.m + '-' + st.n), { monster: st.m, attempt: st.n, seed: st.seed, answers: st.ans, ms: st.ms.map((x) => Math.max(0, Math.round(x))), claimPass: res.win, at: fs.serverTimestamp() });
        }
        save('qc.dgn.' + code + '.' + st.m, String(st.n + 1)); save(skey(st.m), null);
        const h = loadJ('qc.dgh.' + code, []); h.push({ m: st.m, n: st.n, right: res.right, win: res.win, week: st.week, at: Date.now() }); save('qc.dgh.' + code, h.slice(-40));
        result(st, qs, res);
      } catch (e) {
        o.textContent = '';
        const denied = e && e.code === 'permission-denied';
        o.append($c('p', 'err', denied ? 'ส่งไม่สำเร็จ (รอบนี้อาจถูกส่งไปแล้ว) กด “เริ่มรอบใหม่” เพื่อรับข้อสอบชุดใหม่' : 'ส่งผลไม่สำเร็จ ตรวจอินเทอร์เน็ตแล้วกดส่งใหม่ คำตอบของคุณยังอยู่'));
        o.append(denied ? btn('เริ่มรอบใหม่', () => { save(skey(st.m), null); save('qc.dgn.' + code + '.' + st.m, String(st.n + 1)); start(st.m); }, 'gold') : btn('ส่งใหม่', send, 'gold'), btn('ออก', close));
      }
    };
    send();
  }

  function result(st, qs, res) {
    const o = overlay(); const mon = QC.homeMonsterById[st.m];
    o.append($c('h2', '', res.win ? 'ชนะ! ' + mon.th + ' ล้มลงแล้ว' : 'ยังไม่ผ่าน'), $c('div', 'dg-score num', res.right + ' / 10'));
    o.append($c('p', 'small ' + (res.win ? 'ok' : ''), res.win ? 'ส่งผลให้ครูแล้ว รอครูตรวจและนำ EXP เข้า (ครูซิงค์เป็นรอบ ๆ)' : 'ต้องถูกครบ 10 ข้อ ลองอีกครั้ง ข้อสอบจะเป็นชุดใหม่'));
    const bad = $c('ul', 'dg-rev');
    res.ok.forEach((g, i) => { if (!g) { const li = $c('li'); li.append($c('span', '', qs[i].text), $c('span', 'tiny muted', 'ตอบ ' + (st.ans[i] || '-') + ' • เฉลย ' + qs[i].answer)); bad.append(li); } });
    if (bad.childNodes.length) o.append($c('h3', 'small', 'ข้อที่ยังไม่ถูก'), bad);
    const bt = $c('div', 'dg-btns'); bt.append(btn(res.win ? 'กลับ' : 'ลองใหม่', () => { if (res.win) { close(); refreshList(); } else start(st.m); }, 'gold'));
    if (!res.win) bt.append(btn('กลับ', () => { close(); refreshList(); }));
    o.append(bt);
  }
  function refreshList() { initDungeon(host, Object.assign({}, ctx, { doc: Object.assign({}, doc) })); }
}
