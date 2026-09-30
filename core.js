/* QuestClass RPG — core rules (pure functions, no DOM). Loadable in browser and Node. */
var QC = (function () {
  'use strict';

  // ---------- Races / elements / stages ----------
  var STAGES = [1, 10, 20, 35, 50, 65, 80, 99];

  var ELEMENTS = [
    { id: 'earth', th: 'ดิน', en: 'Earth', color: '#624033', glow: '#b07a4c', suffix: 'ปฐพี', enSuffix: 'of Earth' },
    { id: 'water', th: 'น้ำ', en: 'Water', color: '#94e7f5', glow: '#c8f6ff', suffix: 'วารี', enSuffix: 'of Water' },
    { id: 'wind', th: 'ลม', en: 'Wind', color: '#48d58b', glow: '#9cf5c4', suffix: 'วายุ', enSuffix: 'of Wind' },
    { id: 'fire', th: 'ไฟ', en: 'Fire', color: '#ef4f3f', glow: '#ffb36b', suffix: 'อัคคี', enSuffix: 'of Fire' },
    { id: 'ice', th: 'น้ำแข็ง', en: 'Ice', color: '#2c46c8', glow: '#7f95ff', suffix: 'เหมันต์', enSuffix: 'of Frost' },
    { id: 'lightning', th: 'สายฟ้า', en: 'Lightning', color: '#ffb61c', glow: '#ffd76b', suffix: 'อัสนี', enSuffix: 'of Thunder' },
    { id: 'light', th: 'แสง', en: 'Light', color: '#fff9dc', glow: '#ffffff', suffix: 'แห่งแสง', enSuffix: 'of Light' },
    { id: 'dark', th: 'มืด', en: 'Dark', color: '#120b1a', glow: '#6a4a85', suffix: 'รัตติกาล', enSuffix: 'of Night' }
  ];

  var RACES = [
    {
      id: 'human', th: 'มนุษย์', en: 'Human', gender: 'm',
      stems: ['ทหารดาบมนุษย์', 'อัศวินดาบคู่', 'ขุนพลดาบคู่', 'จอมทัพดาบโล่', 'แม่ทัพโล่ศักดิ์สิทธิ์', 'ราชันหอกสังหารเทพ', 'มหาราชาดาบศักดิ์สิทธิ์'],
      enStems: ['Human Swordsman', 'Twin-Blade Knight', 'Twin-Blade Captain', 'Shield Commander', 'Holy Shield General', 'God-Slayer Spear King', 'Sacred Sword High King'],
      weapons: ['ดาบเหล็กเก่า', 'ดาบเหล็กกล้ามาตรฐาน', 'ดาบคู่ (Dual Steel Swords)', 'ดาบคู่มนตรา (Enchanted Twin Swords)', 'ดาบมือเดียวและโล่ (Knight King Shield & Rapier)', 'โล่ปีกศักดิ์สิทธิ์และดาบ (Winged Holy Shield & Sword)', 'หอกยาว (Gungnir Spear)', 'ดาบใหญ่สองมือ (Ragnarok Zweihander)'],
      armor: ['เสื้อกั๊กหนังเก่า + กางเกงผ้าใบ', 'เกราะเหล็กแผ่นทับเสื้อหนัง (Squire Armor)', 'เกราะอัศวินเงินสลักตราอาณาจักร (Silver Knight Plate)', 'เกราะครึ่งตัวเงินน้ำเงิน ผ้าคาดอก (Blade-Captain Half-Plate)', 'เกราะอัศวินทองคำขาว ผ้าคลุมแดง (Paladin Commander Gear)', 'เกราะราชองครักษ์ทอง ไหล่หัวสิงห์ ผ้าคลุมแดง (Royal Guard Plate)', 'เกราะเกล็ดมังกรทอง ออร่าฟ้า (Dragon Slayer Armor)', 'เกราะมหาอัศวิน “เซเลสเชียลพรีเมียร์” ปีกแสง 4 แฉก'],
      weaponKind: ['sword', 'sword', 'dualsword', 'dualsword', 'swordshield', 'swordshield', 'spear', 'greatsword']
    },
    {
      id: 'dwarf', th: 'คนแคระ', en: 'Dwarf', gender: 'm',
      stems: ['ทหารช่างเหล็ก', 'นักรบขวานคู่มิธริล', 'ขุนศึกขวานคู่รูน', 'จอมทัพขวานยักษ์รูน', 'แม่ทัพค้อนหินแร่', 'ราชันค้อนไททาเนียม', 'มหาเทพโล่ปราการ'],
      enStems: ['Forge Soldier', 'Mithril Twin-Axe Warrior', 'Rune Twin-Axe Warlord', 'Rune Greataxe Commander', 'Ore Sledge General', 'Titanium Hammer King', 'Fortress Shield Deity'],
      weapons: ['ประแจเก่า', 'ค้อนช่างเหล็กกล้ามาตรฐาน', 'ขวานคู่ (Dual Mithril Axes)', 'ขวานคู่สลักรูน (Runed Mithril Axes)', 'ขวานยักษ์สองคมรูน (Rune Greataxe)', 'ค้อนหินแร่ยักษ์ (Ore Sledgehammer)', 'ค้อนศึกไททาเนียม (Titanium Warhammer)', 'โล่เหล็กปราการ + ค้อนหินแร่ (Aegis Shield & Ore Maul)'],
      armor: ['เอี๊ยมช่างเหล็กเปื้อนเขม่า ถุงมือหนัง', 'เกราะเหล็กหลอมหนา เข็มขัดเครื่องมือ (Forge Guard)', 'เกราะสติลเมทัล หนามไหล่ ปลอกแขนไทเทเนียม', 'เกราะเหล็กกล้าสลักรูน หนามไหล่คู่', 'เกราะเหล็กกล้าหนัก หนามไหล่ใหญ่ ผ้าคลุมสั้น (Mountain Lord Plate)', 'เกราะเต็มตัว ผลึกแร่งอกไหล่ ผ้าคลุม', 'เกราะไททาเนียมหนัก หนามไหล่ซ้อนชั้น ผ้าคลุมใหญ่ ลายรูนวิ่งบนเกราะ', 'มหาเกราะเทพภูเขา “กอร์กอน-สแมช” ไหล่หัวสิงโตเหล็ก ผ้าคลุมใหญ่'],
      weaponKind: ['wrench', 'hammer', 'dualaxe', 'dualaxe', 'greataxe', 'sledge', 'warhammer', 'maul']
    },
    {
      id: 'machina', th: 'จักรกล', en: 'Machina', gender: 'm',
      stems: ['พลเหล็กจักรกล', 'นักรบค้อนไฮดรอลิก', 'นักรบค้อนเทอร์โบ', 'จอมทัพขวานพลาสมา', 'จอมพลขวานพลาสมาคู่', 'ผู้พิฆาตปืนใหญ่โฟตอน', 'มหาเทวจักรกลบัญชาโดรน'],
      enStems: ['Iron Unit', 'Hydraulic Hammer Unit', 'Turbo Hammer Unit', 'Plasma Axe Commander', 'Twin Plasma Axe Marshal', 'Photon Cannon Destroyer', 'Drone Overlord Machine'],
      weapons: ['ประแจซ่อมเก่า', 'ค้อนเครื่องมือเหล็กกล้ามาตรฐาน', 'ค้อนไฮดรอลิก (Steam Piston Hammer)', 'ค้อนไฮดรอลิกเทอร์โบ (Turbo Piston Hammer)', 'ขวานพลาสม่า (Laser Thermal Axe)', 'ขวานพลาสม่าคู่ (Twin Plasma Axes)', 'ปืนใหญ่ติดแขน (Gatling Photon Cannon)', 'โดรนจู่โจม (Hyper Omega Drones)'],
      armor: ['โครงเหล็กขึ้นสนิม สายไฟร่วง', 'ตัวถังเหล็กเทา ตา LED แดง (Standard Android)', 'โครงเกราะเงาวับ คอร์พลังงานกลางอก (Prototype Unit)', 'โครงเกราะเงา คอร์คู่ ไอน้ำ', 'บอดี้อัลลอยด์ดำทอง ไอพ่นหลัง (Vanguard Mecha)', 'บอดี้อัลลอยด์ดำทอง ไอพ่นคู่', 'คาร์บอนไฟเบอร์ทอง นีออน วงแหวนบาเรียไหล่', 'ร่าง “โอดิน-ZERO” ปีกไอพ่น 6 แขน ปีกพลาสมา'],
      weaponKind: ['wrench', 'hammer', 'piston', 'piston', 'plasmaaxe', 'plasmaaxe', 'armcannon', 'drones']
    },
    {
      id: 'demon', th: 'ปีศาจ', en: 'Demon', gender: 'm',
      stems: ['นักรบเงาปีศาจ', 'อสูรมีดคู่ล่าเงา', 'นักฆ่ามีดคู่อเวจี', 'จอมมารแส้เงา', 'เจ้าอเวจีแส้สายฟ้า', 'ราชันลูกตุ้มสังหารเทพ', 'มหาจอมมารเคียววิญญาณ'],
      enStems: ['Shadow Demon Fighter', 'Twin-Dagger Shade Hunter', 'Abyss Twin-Dagger Assassin', 'Shadow Whip Overlord', 'Thunder-Whip Abyss Lord', 'God-Slayer Flail King', 'Soul Scythe Archfiend'],
      weapons: ['มีดเก่า', 'มีดเหล็กกล้ามาตรฐาน', 'มีดสั้นคู่ (Dual Shadow Daggers)', 'มีดคู่อเวจี (Abyssal Twin Daggers)', 'แส้เงา (Demon Whip)', 'แส้สายฟ้าปีศาจ (Thunder Demon Whip)', 'ลูกตุ้มหนามปีศาจ (Hellfire Flail)', 'เคียววิญญาณ (Grim Reaper’s Scythe)'],
      armor: ['ผ้าคลุมขาดวิ่น ผ้าพันแผล', 'เกราะหนังดำ หนามไหล่ (Shadow Rogue)', 'เกราะเหล็กดำ อักขระปีศาจม่วง (Abyssal Knight)', 'เกราะหนังดำ ผ้าคลุมเงาขาด', 'โค้ทขนนกอีกา เกราะหนามเงา (Overlord Coat)', 'โค้ทขนอีกา เกราะหนามคู่ ประกายสายฟ้า', 'เกราะจอมมาร ไหล่หัวกะโหลกไฟม่วง', 'จอมมาร “ลูซิเฟอร์-แอสโมเดีย” ปีกควันเงา เขาแดง'],
      weaponKind: ['dagger', 'dagger', 'dualdagger', 'dualdagger', 'whip', 'whip', 'flail', 'scythe']
    },
    {
      id: 'high_elf', th: 'ไฮเอลฟ์', en: 'High Elf', gender: 'f',
      stems: ['ผู้ฝึกมนตราไฮเอลฟ์', 'อัศวินเรเปียร์ไฮเอลฟ์', 'นักดาบเวทเรเปียร์', 'จอมขมังธนูพฤกษา', 'จอมเวทธนูจันทรา', 'ราชินีลูกแก้วมหามนตรา', 'มหาเทวีคทาพฤกษานิรันดร์'],
      enStems: ['High Elf Mage Adept', 'High Elf Rapier Knight', 'Spell-Rapier Duelist', 'Sylvan Bow Master', 'Moonbow Archmage', 'Grand Orb Queen', 'Eternal Grove Staff Empress'],
      weapons: ['คทากิ่งไม้', 'คทาฝึกหัวโลหะมาตรฐาน', 'ดาบเรเปียร์ (Silver Needle Rapier)', 'เรเปียร์มนตรา (Enchanted Rapier)', 'ธนูยาว (Windrunner Longbow)', 'ธนูยาวจันทรา (Moonlit Longbow)', 'ลูกแก้วเวท (Orb of Elementa)', 'คทายาวเวท (World Tree Grand Staff)'],
      armor: ['กระโปรงผ้าเขียวอ่อนเดินป่า', 'ชุดนักเวทผ้าไหมฟ้า ลูกแก้วจิ๋ว (Apprentice Robe)', 'ชุดรบผ้าเวทปักดิ้นทอง (High Elven Dress)', 'ชุดรบผ้าเวทเขียวเงิน เกราะไหล่เบา', 'ชุดคลุมจอมเวทขาวทอง ผ้าซีทรูชั้นนอก', 'ชุดคลุมขาวทอง ผ้าซีทรูสองชั้น', 'เกราะเบามิธริล มงกุฎคริสตัลลอย', 'อาภรณ์ “เอเทอร์นัล-เซเลสเชียล” วงแหวนดอกไม้เรืองแสง'],
      weaponKind: ['twigstaff', 'staff', 'rapier', 'rapier', 'longbow', 'longbow', 'orb', 'greatstaff']
    },
    {
      id: 'beastkin', th: 'มนุษย์สัตว์', en: 'Beastkin', gender: 'f',
      stems: ['นักล่ามนุษย์สัตว์', 'พรานธนูพริบตา', 'นายพรานธนูเงาจันทร์', 'จอมยุทธ์สนับมือมนตรา', 'จอมยุทธ์สนับมือโลกันตร์', 'ราชินีจักรสังหารเทพ', 'มหาเทวีกรงเล็บเก้าหาง'],
      enStems: ['Beastkin Hunter', 'Blink Shortbow Ranger', 'Moonshadow Bow Stalker', 'Arcane Knuckle Master', 'Doom Knuckle Grandmaster', 'God-Slayer Chakram Queen', 'Nine-Tailed Claw Empress'],
      weapons: ['มีดไม้ฝึก', 'ธนูสั้นฝึกพร้อมชิ้นส่วนเหล็กกล้ามาตรฐาน', 'ธนูสั้น (Quick-draw Shortbow)', 'ธนูสั้นเวท (Enchanted Shortbow)', 'สนับมือเวท (Element Knuckles)', 'สนับมือเวทขั้นสูง (Blazing Element Knuckles)', 'จักระ/วงแหวนขว้าง (Gale Chakram)', 'กรงเล็บหมัด (Fenrir Claw)'],
      armor: ['เสื้อหนังสายเดี่ยว + กางเกงขาสั้น', 'ชุดนักล่าหนังเสือดาว ประดับเขี้ยว (Wild Hunter)', 'เกราะหนังนุ่ม ถุงมือขนนุ่ม', 'ชุดหนังเสือดาวเสริมเกราะเบา', 'ชุดนินจาหนังดำตัดแดง ผ้าพันคอยาว', 'ชุดนินจาดำแดง เกราะแขน ผ้าพันคอคู่', 'เกราะเบาหนังมังกร ขนฟีนิกซ์ หางเรืองแสง', 'อาภรณ์ “นิวเคลียร์-คิสึเนะ” หางออร่า 9 หาง'],
      weaponKind: ['dagger', 'shortbow', 'shortbow', 'shortbow', 'knuckles', 'knuckles', 'chakram', 'claw']
    },
    {
      id: 'celestial', th: 'แองเจิล', en: 'Celestial', gender: 'f',
      stems: ['นักรบเทวทูต', 'วัลคิรีกระบี่พิพากษา', 'วัลคิรีกระบี่รุ่งอรุณ', 'เทพีลูกตุ้มมนตรา', 'เทพีลูกตุ้มสุริยา', 'ราชินีพิณบัญชาสวรรค์', 'มหาเทวีคทาปฐมกาล'],
      enStems: ['Seraph Warrior', 'Judgement Estoc Valkyrie', 'Dawn Estoc Valkyrie', 'Arcane Flail Goddess', 'Solar Flail Goddess', 'Heaven-Lyre Queen', 'Genesis Scepter Empress'],
      weapons: ['ดาบไม้สั้น', 'ดาบเหล็กกล้าฝึก', 'กระบี่แสงศักดิ์สิทธิ์ (Holy Estoc Rapier)', 'กระบี่แสงรุ่งอรุณ (Dawn Estoc)', 'ดาวกระจายลูกแก้วเวท (Sun Orb Flail)', 'ลูกตุ้มสุริยะ (Solar Orb Flail)', 'พิณเวท (Divine Lyre)', 'คทาสวรรค์ (Scepter of Genesis)'],
      armor: ['เดรสผ้าขาวเรียบ ปีกขนนกจิ๋ว', 'เกราะเบาอกเงิน ผ้าคลุมฟ้าอ่อน (Valkyrie Initiate)', 'เกราะอกทองคำขาว ปีกกว้างขึ้น (Aegis Angel)', 'เกราะอกเงินทอง ปีกคู่กว้าง', 'เกราะเทพีทองสว่าง รัศมีวงกลม', 'เกราะเทพีทอง ปีกสามคู่ รัศมีคู่', 'เกราะเทพสงคราม ปีก 4 คู่', 'เทวทูต “เซราฟิม-อาร์คเอนเจล” ปีกแสง 6 คู่'],
      weaponKind: ['sword', 'sword', 'rapier', 'rapier', 'orbflail', 'orbflail', 'lyre', 'scepter']
    },
    {
      id: 'fairy', th: 'แฟรี่', en: 'Fairy', gender: 'f',
      stems: ['ภูตบุปผาฝึกเวท', 'นักรบเข็มเกสร', 'ภูตดาวกระจายละอองดาว', 'จอมขมังขลุ่ยพฤกษา', 'จอมภูตขลุ่ยวิหค', 'ราชินีคทาพันธนาการ', 'มหาเทวีคัมภีร์มหาพฤกษา'],
      enStems: ['Blossom Sprite Adept', 'Pollen Needle Fighter', 'Stardust Dart Sprite', 'Sylvan Flute Master', 'Songbird Flute Sprite-Lord', 'Binding Wand Queen', 'Great Grove Grimoire Empress'],
      weapons: ['ไม้กายสิทธิ์กิ่งไม้', 'เข็มฝึกเหล็กกล้ามาตรฐาน', 'มีดขว้าง/ดาวกระจายเล็ก (Pixie Darts)', 'ดาวกระจายละอองดาว (Stardust Darts)', 'ขลุ่ยควบคุมสัตว์ (Sylvan Flute)', 'ขลุ่ยวิหคสวรรค์ (Heavenly Songbird Flute)', 'คทาเวทพฤกษา (Vine Wand)', 'ตำราเวทพฤกษา (Grimoire of Yggdrasil)'],
      armor: ['ชุดใบไม้เย็บต่อ รองเท้าฟาง', 'เดรสกลีบดอกไม้ ปีกผีเสื้อใส (Flower Pixie)', 'ชุดรบละอองเกสร ใยแมงมุมทอง (Nymph Battle Suit)', 'ชุดกลีบดอกไม้ ใยทอง ปีกผีเสื้อสองชั้น', 'ชุดกลีบกุหลาบเวท เกสรเรือง', 'ชุดกลีบกุหลาบเวท ปีกรุ้งกว้าง', 'ชุดราชินีป่าไม้ ผลึกพฤกษา ปีกรุ้ง', 'อาภรณ์ “ไกอา-สไปรต์” ปีกละอองดาว'],
      weaponKind: ['wand', 'needle', 'darts', 'darts', 'flute', 'flute', 'vinewand', 'grimoire']
    }
  ];

  var raceById = {}; RACES.forEach(function (r) { raceById[r.id] = r; });
  var elemById = {}; ELEMENTS.forEach(function (e) { elemById[e.id] = e; });

  function stageIndexOf(level) {
    var idx = 0;
    for (var i = 0; i < STAGES.length; i++) if (level >= STAGES[i]) idx = i;
    return idx;
  }
  function stageOf(level) { return STAGES[stageIndexOf(level)]; }

  function titleOf(raceId, elemId, level, lang) {
    var r = raceById[raceId], e = elemById[elemId];
    if (!r || !e) return lang === 'en' ? 'Unchosen Adventurer' : 'ยังไม่เลือกต้นกำเนิด';
    var si = stageIndexOf(level);
    if (si === 0) return lang === 'en' ? 'Apprentice Adventurer' : 'นักผจญภัยฝึกหัด';
    if (lang === 'en') return r.enStems[si - 1] + ' ' + e.enSuffix;
    return r.stems[si - 1] + e.suffix;
  }
  function weaponOf(raceId, level) { var r = raceById[raceId]; return r ? r.weapons[stageIndexOf(level)] : ''; }
  function weaponKindOf(raceId, level) { var r = raceById[raceId]; return r ? r.weaponKind[stageIndexOf(level)] : 'sword'; }
  function armorOf(raceId, level) { var r = raceById[raceId]; return r ? r.armor[stageIndexOf(level)] : ''; }
  function charKey(raceId, elemId, stage) { return raceId + '-' + elemId + '-' + stage; }

  function allCharacterDesigns() {
    var out = [];
    RACES.forEach(function (r) {
      STAGES.forEach(function (s) {
        ELEMENTS.forEach(function (e) {
          out.push({ key: charKey(r.id, e.id, s), race: r.id, element: e.id, stage: s, title: titleOf(r.id, e.id, s), weapon: weaponOf(r.id, s) });
        });
      });
    });
    return out;
  }

  // ---------- EXP & levels ----------
  var MAX_LEVEL = 99;
  function defaultRequirements() {
    var T = function (L) { return L <= 1 ? 0 : Math.round(999 * Math.pow((L - 1) / 98, 1.25)); };
    var R = [];
    for (var i = 0; i < 98; i++) R.push(Math.max(1, T(i + 2) - T(i + 1)));
    return R;
  }
  function sanitizeRequirements(reqs) {
    var def = defaultRequirements();
    if (!Array.isArray(reqs) || reqs.length !== 98) return def;
    return reqs.map(function (v, i) {
      var n = Math.round(Number(v));
      if (!isFinite(n) || n < 1 || n > 2000) return def[i];
      return n;
    });
  }
  function thresholds(reqs) {
    var t = [0, 0]; // t[L] = cumulative EXP to reach level L
    var sum = 0;
    for (var i = 0; i < 98; i++) { sum += reqs[i]; t.push(sum); }
    return t; // indices 0..99
  }
  function expCap(reqs) { return 99999; } // no gameplay cap: level stops at 99 but EXP keeps accumulating (99,999 is only a safety limit)
  function levelFromExp(exp, reqs) {
    var t = thresholds(reqs), L = 1;
    for (var l = 2; l <= 99; l++) if (exp >= t[l]) L = l; else break;
    return L;
  }
  function levelProgress(exp, reqs) {
    var t = thresholds(reqs), L = levelFromExp(exp, reqs);
    if (L >= 99) return { level: 99, cur: t[99], next: null, pct: 100 };
    var a = t[L], b = t[L + 1];
    return { level: L, cur: a, next: b, pct: Math.max(0, Math.min(100, ((exp - a) / (b - a)) * 100)) };
  }
  // apply a requested delta respecting floor 0 and cap; returns applied delta
  function applyDelta(current, requested, cap) {
    var next = Math.max(0, Math.min(cap, current + requested));
    return next - current;
  }

  // ---------- PvP stats & damage ----------
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function stats(level) {
    var p = (clamp(level, 1, 99) - 1) / 98;
    return {
      hp: 100 + Math.round(8 * p), atk: 20 + Math.round(4 * p), def: 18 + Math.round(4 * p), spd: 10 + Math.round(3 * p),
      crit: Math.round((5 + 3 * p) * 10) / 10
    };
  }
  var ELEM_CYCLE = ['fire', 'earth', 'wind', 'lightning', 'light', 'dark', 'ice', 'water'];
  // Matchup tables: {id: [beaten1, beaten2]}. Every entry beats exactly 2 and loses to exactly 2 others
  // (built from a random ring order: each beats the next two in the ring), the remaining 3 are neutral.
  function randomMatchups(ids, rng) {
    rng = rng || Math.random; var order = shuffle(ids, rng), n = order.length, out = {};
    order.forEach(function (id, i) { out[id] = [order[(i + 1) % n], order[(i + 2) % n]]; });
    return out;
  }
  function validMatchups(m, ids) {
    if (!m || typeof m !== 'object') return false;
    var lose = {}; ids.forEach(function (id) { lose[id] = 0; });
    for (var i = 0; i < ids.length; i++) {
      var b = m[ids[i]]; if (!Array.isArray(b) || b.length !== 2 || b[0] === b[1]) return false;
      for (var k = 0; k < 2; k++) { if (lose[b[k]] === undefined || b[k] === ids[i]) return false; if (m[b[k]] && m[b[k]].indexOf(ids[i]) >= 0) return false; lose[b[k]]++; }
    }
    return ids.every(function (id) { return lose[id] === 2; });
  }
  var DEFAULT_ELEM_MATCHUPS = (function () { var o = {}; ELEM_CYCLE.forEach(function (id, i) { o[id] = [ELEM_CYCLE[(i + 1) % 8], ELEM_CYCLE[(i + 2) % 8]]; }); return o; })();
  // relation of attacker vs defender in a table: 1 attacker has the edge, -1 disadvantage, 0 neutral
  function relationIn(table, att, def) {
    if (!table || !att || !def || att === def) return 0;
    if (table[att] && table[att].indexOf(def) >= 0) return 1;
    if (table[def] && table[def].indexOf(att) >= 0) return -1;
    return 0;
  }
  function elementRelation(att, def, table) { return relationIn(table || DEFAULT_ELEM_MATCHUPS, att, def); }
  function raceRelation(att, def, table) { return table ? relationIn(table, att, def) : 0; }
  function computeDamage(o) {
    // o: {attLevel, defLevel, elapsedMs, seconds, attElem, defElem, attRace, defRace, rng}
    var rng = o.rng || Math.random;
    var A = stats(o.attLevel), D = stats(o.defLevel);
    var speed = clamp(1 - o.elapsedMs / (o.seconds * 1000), 0, 1);
    var speedMul = 0.85 + speed * 0.30 + (A.spd - D.spd) * 0.005;
    var er = elementRelation(o.attElem, o.defElem, o.elemTable), rr = raceRelation(o.attRace, o.defRace, o.raceTable);
    var ep = o.elemPct != null ? o.elemPct : 5, rp = o.racePct != null ? o.racePct : 5;
    var matchMul = Math.max(0.1, 1 + er * ep / 100 + rr * rp / 100);
    var variance = 0.94 + rng() * 0.12;
    var critical = rng() < A.crit / 100;
    var base = 20 + (A.atk - 20) * 0.25 - (D.def - 18) * 0.15;
    var dmg = Math.max(1, Math.round(base * speedMul * matchMul * variance * (critical ? 1.35 : 1)));
    return { damage: dmg, critical: critical, elementRelation: er, raceRelation: rr };
  }

  // ---------- Questions ----------
  var MODES = [
    { id: 'natural-add', th: 'บวก–ลบจำนวนนับ', en: 'Add/Subtract (natural)', ops: ['+', '-'], n: 2, kind: 'natural', family: 'Slime', rewards: [1, 2, 3] },
    { id: 'natural-mul', th: 'คูณ–หารจำนวนนับ (หารลงตัว)', en: 'Multiply/Divide (natural)', ops: ['*', '/'], n: 2, kind: 'natural', family: 'Beast / Wolf', rewards: [1, 2, 3] },
    { id: 'integer-mixed', th: 'บวก ลบ คูณ หาร จำนวนเต็ม', en: 'Integers: + − × ÷', ops: ['+', '-', '*', '/'], n: 2, kind: 'integer', family: 'Undead', rewards: [2, 3, 4] },
    { id: 'real-mixed', th: 'บวก ลบ คูณ หาร จำนวนจริง', en: 'Real numbers: + − × ÷', ops: ['+', '-', '*', '/'], n: 2, kind: 'real', family: 'Golem & Giant', rewards: [2, 3, 4] },
    { id: 'natural-3', th: 'บวก ลบ คูณ หาร จำนวนนับ 3 จำนวน', en: 'Natural numbers, 3 operands', ops: ['+', '-', '*', '/'], n: 3, kind: 'natural', family: 'Demon High Guard', rewards: [3, 4, 5] },
    { id: 'integer-3', th: 'บวก ลบ คูณ หาร จำนวนเต็ม 3 จำนวน', en: 'Integers, 3 operands', ops: ['+', '-', '*', '/'], n: 3, kind: 'integer', family: 'Dragon', rewards: [3, 4, 5] }
  ];
  var DIFFS = [
    { id: 'easy', th: 'ง่าย', en: 'Easy', bound: 10 },
    { id: 'medium', th: 'กลาง', en: 'Medium', bound: 20 },
    { id: 'hard', th: 'ยาก', en: 'Hard', bound: 99 }
  ];
  var modeById = {}; MODES.forEach(function (m) { modeById[m.id] = m; });
  function diffIndex(d) { for (var i = 0; i < DIFFS.length; i++) if (DIFFS[i].id === d) return i; return 0; }

  function rint(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }

  // numbers are held as integers in "units": natural/integer unit=1, real unit=10 (tenths)
  function fmtNum(v, scale) {
    var s;
    if (scale === 10) {
      var neg = v < 0, a = Math.abs(v);
      s = Math.floor(a / 10) + (a % 10 ? '.' + (a % 10) : '');
      if (neg) s = '−' + s;
    } else s = v < 0 ? '−' + Math.abs(v) : String(v);
    return s;
  }
  function fmtOperand(v, scale) { var s = fmtNum(v, scale); return v < 0 ? '(' + s + ')' : s; }
  var OPSYM = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  // exact op in units; returns null when not allowed
  function doOp(a, op, b, scale, kind) {
    var r;
    if (op === '+') r = a + b;
    else if (op === '-') r = a - b;
    else if (op === '*') { if (scale === 10) { var p = a * b; if (p % 10 !== 0) return null; r = p / 10; } else r = a * b; }
    else if (op === '/') {
      if (b === 0) return null;
      if (scale === 10) { var n = a * 10; if (n % b !== 0) return null; r = n / b; } else { if (a % b !== 0) return null; r = a / b; }
    }
    if (kind === 'natural' && r < 0) return null;
    return r;
  }

  function operandRange(kind, bound, scale) {
    // operands stay small: at most two digits and within the difficulty band
    var maxAbs = Math.min(99, bound) * scale;
    if (kind === 'real') maxAbs = Math.min(bound, 20) * scale;
    return maxAbs;
  }

  function randOperand(rng, kind, maxAbs, scale, op, isRight) {
    if (kind === 'natural') {
      var lo = (op === '*' || op === '/') ? 2 : 1;
      var hi = maxAbs;
      if (op === '*' || op === '/') hi = Math.max(lo, Math.min(hi, isRight ? 12 : maxAbs));
      return rint(rng, lo, Math.max(lo, hi));
    }
    if (kind === 'integer') {
      var mag = (op === '*' || op === '/') && isRight ? rint(rng, 1, Math.min(12, maxAbs)) : rint(rng, 1, maxAbs);
      if ((op === '*' || op === '/') && isRight && mag === 1) mag = 2;
      return rng() < 0.45 ? -mag : mag;
    }
    // real (tenths)
    if (op === '*' || op === '/') {
      if (isRight) { var m2 = rint(rng, 2, 9) * 10; return rng() < 0.35 ? -m2 : m2; } // integer multiplier/divisor
    }
    var m = rint(rng, 1, maxAbs);
    if (m % 10 === 0 && rng() < 0.7) m += rint(rng, 1, 9);
    if (m > maxAbs) m = maxAbs;
    return rng() < 0.35 ? -m : m;
  }

  // operand size stays within the difficulty's intent (easy ≤ 30, medium ≤ 60, hard ≤ 99)
  function opCap(bound) { return bound <= 10 ? 30 : bound <= 20 ? 60 : 99; }
  function inBounds(v, kind, bound, scale) {
    var lim = bound * scale;
    if (kind === 'natural') return v >= 0 && v <= lim;
    return v >= -lim && v <= lim;
  }

  function genTwo(rng, mode, bound, scale) {
    var maxAbs = operandRange(mode.kind, bound, scale);
    for (var tries = 0; tries < 400; tries++) {
      var op = pick(rng, mode.ops), a, b, r;
      if (op === '/') {
        // build from quotient so division is exact
        b = randOperand(rng, mode.kind, maxAbs, scale, '/', true);
        var q = mode.kind === 'natural' ? rint(rng, 0, bound) : rint(rng, -bound, bound);
        if (mode.kind === 'real') q = rint(rng, -bound * 10, bound * 10); // tenths
        if (mode.kind === 'natural' && q === 0) q = rint(rng, 1, bound);
        if (scale === 10) a = (q * b) / 10; else a = q * b;
        if (scale === 10 && (q * b) % 10 !== 0) continue;
        if (Math.abs(a) > 99 * scale) continue;
        if (mode.kind === 'natural' && a < 0) continue;
      } else {
        a = randOperand(rng, mode.kind, maxAbs, scale, op, false);
        b = randOperand(rng, mode.kind, maxAbs, scale, op, true);
      }
      r = doOp(a, op, b, scale, mode.kind);
      if (r === null || !inBounds(r, mode.kind, bound, scale)) continue;
      if (Math.abs(a) > opCap(bound) * scale || Math.abs(b) > opCap(bound) * scale) continue;
      return { text: fmtOperand(a, scale) + ' ' + OPSYM[op] + ' ' + fmtOperand(b, scale), answer: r, operands: [a, b], ops: [op] };
    }
    return null;
  }

  function genThree(rng, mode, bound, scale) {
    var maxAbs = Math.min(99, bound) * scale;
    var small = Math.min(12, maxAbs);
    for (var tries = 0; tries < 800; tries++) {
      var op1 = pick(rng, mode.ops), op2 = pick(rng, mode.ops);
      var leftFirst = rng() < 0.5; // (a op1 b) op2 c  vs  a op1 (b op2 c)
      var mk = function (op, right) {
        var lim = (op === '*' || op === '/') ? small : maxAbs;
        var v = randOperand(rng, mode.kind, lim, scale, op, right);
        return v;
      };
      var a, b, c, inner, r;
      if (leftFirst) {
        a = mk(op1, false); b = mk(op1, true);
        if (op1 === '/') { var q1 = mode.kind === 'natural' ? rint(rng, 1, Math.min(bound, 12)) : rint(rng, -Math.min(bound, 12), Math.min(bound, 12)); a = q1 * b; if (Math.abs(a) > 99) continue; }
        inner = doOp(a, op1, b, scale, mode.kind);
        if (inner === null || !inBounds(inner, mode.kind, bound, scale)) continue;
        c = mk(op2, true);
        r = doOp(inner, op2, c, scale, mode.kind);
      } else {
        b = mk(op2, false); c = mk(op2, true);
        if (op2 === '/') { var q2 = mode.kind === 'natural' ? rint(rng, 1, Math.min(bound, 12)) : rint(rng, -Math.min(bound, 12), Math.min(bound, 12)); b = q2 * c; if (Math.abs(b) > 99) continue; }
        inner = doOp(b, op2, c, scale, mode.kind);
        if (inner === null || !inBounds(inner, mode.kind, bound, scale)) continue;
        a = mk(op1, false);
        if (op1 === '/') { if (inner === 0) continue; var q3 = mode.kind === 'natural' ? rint(rng, 1, Math.min(bound, 12)) : rint(rng, -Math.min(bound, 12), Math.min(bound, 12)); a = q3 * inner; if (Math.abs(a) > 99) continue; }
        r = doOp(a, op1, inner, scale, mode.kind);
      }
      if (r === null || !inBounds(r, mode.kind, bound, scale)) continue;
      if ([a, b, c].some(function (v) { return Math.abs(v) > opCap(bound) || (mode.kind === 'natural' && v < 1); })) continue;
      var text = leftFirst
        ? '(' + fmtOperand(a, scale) + ' ' + OPSYM[op1] + ' ' + fmtOperand(b, scale) + ') ' + OPSYM[op2] + ' ' + fmtOperand(c, scale)
        : fmtOperand(a, scale) + ' ' + OPSYM[op1] + ' (' + fmtOperand(b, scale) + ' ' + OPSYM[op2] + ' ' + fmtOperand(c, scale) + ')';
      return { text: text, answer: r, operands: [a, b, c], ops: leftFirst ? [op1, op2] : [op1, op2], order: leftFirst ? 'left' : 'right' };
    }
    return null;
  }

  function makeChoices(rng, answer, kind, bound, scale) {
    var set = {}, out = [answer];
    set[answer] = 1;
    var cands = [];
    var steps = scale === 10 ? [1, 2, 3, 5, 10, 11, 20, -1, -2, -3, -5, -10, -11, -20] : [1, 2, 3, 4, 5, 10, -1, -2, -3, -4, -5, -10];
    steps.forEach(function (s) { cands.push(answer + s); });
    if (answer !== 0 && kind !== 'natural') cands.push(-answer);
    for (var k = cands.length - 1; k > 0; k--) { var j = Math.floor(rng() * (k + 1)); var t = cands[k]; cands[k] = cands[j]; cands[j] = t; }
    for (var i = 0; i < cands.length && out.length < 4; i++) {
      var v = cands[i];
      if (set[v]) continue;
      if (kind === 'natural' && v < 0) continue;
      set[v] = 1; out.push(v);
    }
    var extra = 1;
    while (out.length < 4) { var w = answer + 20 * extra++; if (!set[w]) { set[w] = 1; out.push(w); } }
    for (var m = out.length - 1; m > 0; m--) { var n = Math.floor(rng() * (m + 1)); var tt = out[m]; out[m] = out[n]; out[n] = tt; }
    return out;
  }

  function generateQuestion(modeId, diffId, rng) {
    rng = rng || Math.random;
    var mode = modeById[modeId] || MODES[0];
    var bound = DIFFS[diffIndex(diffId)].bound;
    var scale = mode.kind === 'real' ? 10 : 1;
    var q = mode.n === 3 ? genThree(rng, mode, bound, scale) : genTwo(rng, mode, bound, scale);
    if (!q) {
      // rule-abiding fallback
      if (mode.n === 3) { var x = rint(rng, 1, 3), y = rint(rng, 1, 3), z = rint(rng, 1, 3); q = { text: '(' + x + ' + ' + y + ') + ' + z, answer: (x + y + z) * scale / scale, operands: [x, y, z], ops: ['+', '+'] }; if (scale === 10) q.answer = (x + y + z) * 10; }
      else { var u = rint(rng, 1, 4), v = rint(rng, 1, 4); q = { text: fmtNum(u * scale, scale) + ' + ' + fmtNum(v * scale, scale), answer: (u + v) * scale, operands: [u * scale, v * scale], ops: ['+'] }; }
    }
    var choicesRaw = makeChoices(rng, q.answer, mode.kind, bound, scale);
    return {
      mode: mode.id, difficulty: diffId, text: q.text + ' = ?', answer: fmtNum(q.answer, scale), answerValue: q.answer / scale,
      raw: q.answer, scale: scale, operands: q.operands, ops: q.ops,
      choices: choicesRaw.map(function (v) { return fmtNum(v, scale); }),
      correctIndex: choicesRaw.indexOf(q.answer)
    };
  }

  // ---------- Bracket with play-in ----------
  function bitReverse(i, bits) { var r = 0; for (var k = 0; k < bits; k++) { r = (r << 1) | ((i >> k) & 1); } return r; }
  function shuffle(arr, rng) {
    rng = rng || Math.random; var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rng() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function bracketInfo(N) {
    if (N < 2) return null;
    var B = 1; while (B * 2 <= N) B *= 2;
    var P = N - B;
    return { N: N, B: B, playIn: P, playInPlayers: 2 * P, byes: P ? 2 * B - N : 0, realMatches: N - 1 };
  }
  // returns {rounds:[[match]]}, match: {id, round, a, b, winner, bye, feedA, feedB}
  function buildBracket(ids, rng) {
    var N = ids.length; if (N < 2) return null;
    var seeds = shuffle(ids, rng);
    var info = bracketInfo(N), B = info.B, P = info.playIn;
    var bits = Math.round(Math.log(B) / Math.LN2);
    var rounds = [], mid = 0;
    var slots = new Array(B); // each slot: {pid} or {match}
    if (P > 0) {
      var order = [];
      for (var i = 0; i < B; i++) order.push(i);
      order.sort(function (x, y) { return bitReverse(x, bits) - bitReverse(y, bits); });
      var playSlots = {}; order.slice(0, P).forEach(function (s) { playSlots[s] = true; });
      var r0 = [], si = 0;
      for (var s = 0; s < B; s++) {
        if (playSlots[s]) {
          var m = { id: 'm' + (mid++), round: 0, slot: s, a: seeds[si++], b: seeds[si++], winner: null, bye: false };
          r0.push(m); slots[s] = { match: m.id };
        } else {
          var bm = { id: 'm' + (mid++), round: 0, slot: s, a: seeds[si++], b: null, winner: null, bye: true };
          bm.winner = bm.a; r0.push(bm); slots[s] = { pid: bm.a, fromBye: bm.id };
        }
      }
      rounds.push(r0);
      var r1 = [];
      for (var k = 0; k < B; k += 2) {
        var mm = { id: 'm' + (mid++), round: 1, a: slots[k].pid || null, b: slots[k + 1].pid || null, feedA: slots[k].match || slots[k].fromBye, feedB: slots[k + 1].match || slots[k + 1].fromBye, winner: null, bye: false };
        if (B === 1) break;
        r1.push(mm);
      }
      if (r1.length) rounds.push(r1);
    } else {
      var rr = [];
      for (var q = 0; q < B; q += 2) rr.push({ id: 'm' + (mid++), round: 0, a: seeds[q], b: seeds[q + 1], winner: null, bye: false });
      rounds.push(rr);
    }
    // later rounds
    while (rounds[rounds.length - 1].length > 1) {
      var prev = rounds[rounds.length - 1], next = [];
      for (var z = 0; z < prev.length; z += 2) {
        next.push({ id: 'm' + (mid++), round: rounds.length, a: null, b: null, feedA: prev[z].id, feedB: prev[z + 1].id, winner: null, bye: false });
      }
      rounds.push(next);
    }
    // special case: N=3 -> B=2, P=1: round0 has 2 entries (1 match + 1 bye), round1 has 1 final. loop above handles.
    return { rounds: rounds, info: info };
  }
  function findMatch(br, id) { for (var r = 0; r < br.rounds.length; r++) for (var i = 0; i < br.rounds[r].length; i++) if (br.rounds[r][i].id === id) return br.rounds[r][i]; return null; }
  // propagate winners into feeds
  function syncBracket(br) {
    for (var r = 0; r < br.rounds.length; r++) {
      br.rounds[r].forEach(function (m) {
        if (m.feedA) { var fa = findMatch(br, m.feedA); m.a = fa && fa.winner ? fa.winner : null; }
        if (m.feedB) { var fb = findMatch(br, m.feedB); m.b = fb && fb.winner ? fb.winner : null; }
      });
    }
    var last = br.rounds[br.rounds.length - 1][0];
    return last.winner || null;
  }
  function setMatchWinner(br, matchId, winner) {
    var m = findMatch(br, matchId); if (!m || m.bye) return false;
    if (winner !== m.a && winner !== m.b) return false;
    m.winner = winner; syncBracket(br); return true;
  }
  function readyMatches(br) {
    var out = [];
    br.rounds.forEach(function (r) { r.forEach(function (m) { if (!m.bye && !m.winner && m.a && m.b) out.push(m); }); });
    return out;
  }

  // ---------- Shuffle bag ----------
  function bagNext(bag, pool, rng) {
    // bag: {remaining:[], last:null}; pool: array of ids. returns {pick, bag, newRound}
    rng = rng || Math.random;
    var set = {}; pool.forEach(function (id) { set[id] = 1; });
    var remaining = (bag && bag.remaining || []).filter(function (id) { return set[id]; });
    var newRound = false;
    if (!remaining.length) {
      remaining = shuffle(pool, rng); newRound = true;
      if (bag && bag.last && remaining.length > 1 && remaining[0] === bag.last) { var t = remaining[0]; remaining[0] = remaining[1]; remaining[1] = t; }
    }
    var pickId = remaining.shift();
    return { pick: pickId, bag: { remaining: remaining, last: pickId }, newRound: newRound };
  }

  // ---------- Groups ----------
  var GROUP_NAMES = ['กองอัศวินอุกกาบาต', 'สมาคมเวทจันทรา', 'เงามังกรทมิฬ', 'ฟีนิกซ์เพลิงคราม', 'ผู้พิทักษ์ดารา', 'กองทัพวายุคลั่ง', 'ราชันหมาป่าเงิน', 'คณะนักปราชญ์สายฟ้า', 'กิลด์คมดาบนิรันดร์', 'กองรบมหาสมุทร', 'ผู้พิทักษ์ปฐพี', 'หอกสวรรค์สีชาด', 'คณะภูตเหมันต์', 'นักรบสุริยัน', 'กองร้อยดาราพิฆาต', 'นักล่าเงาจันทรา', 'อัศวินวารีคราม', 'ทัพพยัคฆ์อสนี', 'ดาบพิทักษ์รุ่งอรุณ', 'กองเวทพฤกษานิรันดร์'];
  var GROUP_ICONS = ['⚔️', '🛡️', '🐉', '🔥', '⭐', '🌪️', '🐺', '⚡', '🗡️', '🌊', '⛰️', '🔱', '❄️', '☀️', '💫', '🌙', '💧', '🐯', '🌅', '🌿'];
  var GROUP_COLORS = ['#e8bc58', '#8b6ee8', '#55d69e', '#ef7655', '#6fb7ff', '#ff8fc7', '#c9a36b', '#9be25a', '#ffa94d', '#5fd3d3'];
  function makeGroups(studentIds, count, rng) {
    rng = rng || Math.random;
    count = clamp(Math.round(count), 2, 10);
    var names = shuffle(GROUP_NAMES, rng).slice(0, count);
    var icons = shuffle(GROUP_ICONS, rng).slice(0, count);
    var groups = names.map(function (n, i) { return { id: 'g' + Date.now().toString(36) + i + Math.floor(rng() * 1e6).toString(36), name: n, icon: icons[i], color: GROUP_COLORS[i % GROUP_COLORS.length], members: [] }; });
    shuffle(studentIds, rng).forEach(function (sid, i) { groups[i % count].members.push(sid); });
    return groups;
  }

  // balanced guilds: sizes differ by at most 1, average EXP of every guild close together,
  // and as few pairs as possible who were together in the previous guilds
  function makeBalancedGroups(ids, count, expOf, prevGroups, rng) {
    rng = rng || Math.random; expOf = expOf || function () { return 0; };
    count = clamp(Math.round(count), 2, 10);
    var base = makeGroups([], count, rng);
    if (!ids.length) return base;
    var prev = {};
    (prevGroups || []).forEach(function (g) { var m = g.members || []; for (var i = 0; i < m.length; i++) for (var j = i + 1; j < m.length; j++) { prev[m[i] + '|' + m[j]] = 1; prev[m[j] + '|' + m[i]] = 1; } });
    var exp = {}; ids.forEach(function (id) { exp[id] = +expOf(id) || 0; });
    // snake draft by EXP (with a little noise so equal EXP shuffle)
    var order = shuffle(ids, rng).sort(function (a, b) { return exp[b] - exp[a]; });
    var G = []; for (var g = 0; g < count; g++) G.push([]);
    order.forEach(function (id, i) { var r = Math.floor(i / count), c = i % count; G[r % 2 ? count - 1 - c : c].push(id); });
    var mean = ids.reduce(function (a, id) { return a + exp[id]; }, 0) / ids.length;
    var varAll = ids.reduce(function (a, id) { return a + Math.pow(exp[id] - mean, 2); }, 0) / ids.length || 1;
    function pairs(grp) { var n = 0; for (var i = 0; i < grp.length; i++) for (var j = i + 1; j < grp.length; j++) if (prev[grp[i] + '|' + grp[j]]) n++; return n; }
    function avg(grp) { return grp.length ? grp.reduce(function (a, id) { return a + exp[id]; }, 0) / grp.length : mean; }
    function cost() {
      var p = 0, v = 0; G.forEach(function (grp) { p += pairs(grp); v += Math.pow(avg(grp) - mean, 2); });
      return p * 10 + (v / G.length) / varAll * 40;
    }
    var cur = cost();
    for (var it = 0; it < 4000 && ids.length > 1; it++) {
      var a = Math.floor(rng() * count), b = Math.floor(rng() * count); if (a === b || !G[a].length || !G[b].length) continue;
      var i1 = Math.floor(rng() * G[a].length), i2 = Math.floor(rng() * G[b].length);
      var x = G[a][i1], y = G[b][i2]; G[a][i1] = y; G[b][i2] = x;
      var c2 = cost();
      if (c2 <= cur) cur = c2; else { G[a][i1] = x; G[b][i2] = y; }
    }
    base.forEach(function (grp, k) { grp.members = G[k]; });
    return base;
  }
  function groupRepeatPairs(groups, prevGroups) {
    var prev = {}; (prevGroups || []).forEach(function (g) { var m = g.members || []; for (var i = 0; i < m.length; i++) for (var j = i + 1; j < m.length; j++) prev[[m[i], m[j]].sort().join('|')] = 1; });
    var n = 0; groups.forEach(function (g) { var m = g.members || []; for (var i = 0; i < m.length; i++) for (var j = i + 1; j < m.length; j++) if (prev[[m[i], m[j]].sort().join('|')]) n++; });
    return n;
  }

  // ---------- Mission bosses ----------
  function dailyBoss(task) {
    var roster = task.rosterIds || [];
    var maxHP = roster.length, dmg = 0;
    roster.forEach(function (sid) { if (task.values && task.values[sid] === true) dmg += 1; });
    return { maxHP: maxHP, damage: Math.min(dmg, maxHP), remaining: Math.max(0, maxHP - dmg), defeated: maxHP > 0 && dmg >= maxHP };
  }
  function effectiveScore(task, sid) {
    var f = task.values ? task.values[sid] : undefined, r = task.retests ? task.retests[sid] : undefined;
    var has = function (v) { return typeof v === 'number' && isFinite(v); };
    if (!has(f) && !has(r)) return null;
    var best = Math.max(has(f) ? f : -Infinity, has(r) ? r : -Infinity);
    return clamp(best, 0, task.maxScore || 0);
  }
  function examBoss(task) {
    var roster = task.rosterIds || [];
    var per = task.passScore > 0 ? task.passScore : 0.5 * (task.maxScore || 0);
    var maxHP = Math.round(per * roster.length * 10) / 10, dmg = 0;
    roster.forEach(function (sid) { var e = effectiveScore(task, sid); if (e !== null) dmg += e; });
    return { maxHP: maxHP, damage: Math.min(dmg, maxHP), remaining: Math.max(0, maxHP - dmg), defeated: maxHP > 0 && dmg >= maxHP };
  }
  function examPassed(task, sid) { var e = effectiveScore(task, sid); return e !== null && e >= (task.passScore || 0); }


  // ---------- Student-home export (nicknames only; no real names ever leave the app) ----------
  // Returns { file, missingNick: [no...] } where file is a plain JSON-able object.
  function buildHomeExport(o) {
    var reqs = o.reqs, today = o.today || bangkokDate(), missing = [];
    var dates = Object.keys(o.attendance || {}).sort();
    var students = (o.students || []).map(function (s) {
      var nick = String(s.nick || '').trim();
      if (!nick) { missing.push(s.no); nick = 'นักผจญภัย ' + s.no; }
      var exp = Math.max(0, o.expOf(s.id) || 0), pr = levelProgress(exp, reqs);
      var tasks = [];
      (o.tasks || []).forEach(function (t) {
        if ((t.rosterIds || []).indexOf(s.id) < 0) return;
        var label = String(t.name || '').slice(0, 80);
        if (t.type === 'check') { if (!(t.values && t.values[s.id] === true)) tasks.push({ t: label, d: t.date || '' }); }
        else if (t.type === 'score') { var e = effectiveScore(t, s.id); if (e !== null && e < (t.passScore || 0)) tasks.push({ t: 'สอบซ่อม: ' + label, d: '' }); }
      });
      var att = { present: 0, late: 0, absent: 0, total: 0, last: [] };
      dates.forEach(function (d) {
        var st = (o.attendance[d].records || {})[s.id]; if (!st) return;
        att.total++; if (st === 'present') att.present++; else if (st === 'late') att.late++; else if (st === 'absent') att.absent++;
        var code = st === 'present' ? 'P' : st === 'late' ? 'L' : st === 'absent' ? 'A' : ''; if (code) att.last.push({ d: d, s: code });
      });
      att.last = att.last.slice(-30);
      return { sid: s.id, no: s.no, nick: nick.slice(0, 40), race: s.race || 'human', element: s.element || 'fire', level: pr.level, exp: exp, curAt: pr.cur, nextAt: pr.next == null ? 0 : pr.next, tasks: tasks.slice(0, 40), att: att };
    });
    return { file: { app: 'QuestClass Home export', v: 1, dungeonRewards: o.dungeonRewards || null, exportedAt: new Date().toISOString(), classId: o.classId, className: String(o.className || '').slice(0, 60), asOf: today, students: students }, missingNick: missing };
  }


  // ---------- Home dungeon (student rounds; deterministic so the teacher can re-check them) ----------
  var HOME_MONSTERS = [
    ['green_slime', 'natural-add', 'easy', 'สไลม์เขียว'], ['acid_red_slime', 'natural-add', 'medium', 'สไลม์กรดแดง'], ['king_iron_slime', 'natural-add', 'hard', 'ราชาสไลม์เหล็ก'],
    ['forest_wolf', 'natural-mul', 'easy', 'หมาป่าพงไพร'], ['dire_shadow_wolf', 'natural-mul', 'medium', 'หมาป่าเงาทมิฬ'], ['hellhound_behemoth', 'natural-mul', 'hard', 'สุนัขนรกสองหัว'],
    ['skeletal_soldier', 'integer-mixed', 'easy', 'ทหารโครงกระดูก'], ['armored_skeleton_berserker', 'integer-mixed', 'medium', 'โครงกระดูกคลั่งเกราะ'], ['lich_necromancer', 'integer-mixed', 'hard', 'ลิชจอมเวทมรณะ'],
    ['stone_golem', 'real-mixed', 'easy', 'โกเลมศิลา'], ['rune_crystal_golem', 'real-mixed', 'medium', 'โกเลมผลึกรูน'], ['ancient_titan_golem', 'real-mixed', 'hard', 'ไททันโกเลมโบราณ'],
    ['lesser_demon_imp', 'natural-3', 'easy', 'อิมป์ปีศาจน้อย'], ['abyssal_demon_warrior', 'natural-3', 'medium', 'นักรบปีศาจอเวจี'], ['demon_commander_archon', 'natural-3', 'hard', 'อาร์คอนแม่ทัพปีศาจ'],
    ['wyvern_drake', 'integer-3', 'easy', 'ไวเวิร์น'], ['ancient_red_dragon', 'integer-3', 'medium', 'มังกรแดงโบราณ'], ['aurelius_void_dragon', 'integer-3', 'hard', 'ออเรลิอุส มังกรสุญญตา']
  ].map(function (a) { return { id: a[0], mode: a[1], diff: a[2], th: a[3] }; });
  var homeMonsterById = {}; HOME_MONSTERS.forEach(function (m) { homeMonsterById[m.id] = m; });
  function fnv32(str) { var h = 0x811c9dc5; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }
  function homeSeed(code, monsterId, week, attempt) { return fnv32(String(code).toUpperCase() + '|' + monsterId + '|' + week + '|' + attempt); }
  function homeWeekOf(ms) { return isoWeekKey(bangkokDate(new Date(ms))); }
  function homeQuestions(monsterId, seed) {
    var m = homeMonsterById[monsterId]; if (!m) return null;
    var rng = mulberry32(seed >>> 0), qs = [];
    for (var i = 0; i < 10; i++) qs.push(generateQuestion(m.mode, m.diff, rng));
    return qs;
  }
  function parseAnswer(s) { var t = String(s == null ? '' : s).replace(/[\u2212\u2013\u2014]/g, '-').replace(/,/g, '.').replace(/\s+/g, ''); if (!/^-?\d+(\.\d+)?$/.test(t)) return NaN; return Number(t); }
  function homeCheck(qs, answers) {
    var ok = [], right = 0;
    for (var i = 0; i < 10; i++) { var v = parseAnswer(answers && answers[i]); var good = qs && qs[i] && isFinite(v) && Math.abs(v - qs[i].answerValue) < 1e-9; ok.push(!!good); if (good) right++; }
    return { ok: ok, right: right, win: right === 10 };
  }
  function homeReward(rewards, monsterId) { var m = homeMonsterById[monsterId]; if (!m) return 0; var r = rewards && rewards[m.mode] && rewards[m.mode][m.diff]; if (typeof r !== 'number') r = defaultSettings().dungeonRewards[m.mode][m.diff]; return r; }

  // ---------- Dates (Asia/Bangkok) ----------
  function bangkokDate(d) {
    d = d || new Date();
    var t = new Date(d.getTime() + 7 * 3600 * 1000);
    return t.toISOString().slice(0, 10);
  }
  function daysInMonth(ym) { var y = +ym.slice(0, 4), m = +ym.slice(5, 7); return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function isoWeekKey(dateStr) {
    var d = new Date(dateStr + 'T00:00:00Z'); var day = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - day + 3);
    var firstThu = new Date(Date.UTC(d.getUTCFullYear(), 0, 4)); var wk = 1 + Math.round(((d - firstThu) / 864e5 - 3 + ((firstThu.getUTCDay() + 6) % 7)) / 7);
    return d.getUTCFullYear() + 'W' + (wk < 10 ? '0' : '') + wk;
  }

  // ---------- Roster parsing ----------
  function parseRosterLines(text) {
    return String(text || '').split(/\r?\n/).map(function (line) {
      return line.replace(/^\s*\d+\s*[\.\)\-:]?\s*/, '').replace(/\s+/g, ' ').trim();
    }).filter(function (s) { return s.length > 0; }).map(function (s) { return s.slice(0, 80); });
  }

  // ---------- Settings ----------
  function defaultSettings() {
    var dr = {};
    MODES.forEach(function (m) { dr[m.id] = { easy: m.rewards[0], medium: m.rewards[1], hard: m.rewards[2] }; });
    return {
      levelRequirements: defaultRequirements(), attendanceExp: 5, trainingDefaultExp: 1, dailyTaskExp: 5, examPassExp: 10,
      dailyBonusExp: 5, bossBonusExp: 10, lateTaskExp: 3, v: 2, dungeonRewards: dr, panelOpacity: 88, soundEnabled: true, sfxVolume: 75,
      screenShakeEnabled: true, reducedMotion: false, dungeonSeconds: 10,
      elemMatchups: JSON.parse(JSON.stringify(DEFAULT_ELEM_MATCHUPS)), raceMatchups: defaultRaceMatchups(), elemPct: 10, racePct: 10,
      auraEnabled: true, auraMinLevel: 50, elementFx: true, hitFx: true
    };
  }
  function defaultRaceMatchups() { var ids = RACES.map(function (r) { return r.id; }), o = {}; ids.forEach(function (id, i) { o[id] = [ids[(i + 3) % 8], ids[(i + 6) % 8]]; }); return validMatchups(o, ids) ? o : randomMatchups(ids, mulberry32(7)); }
  function int(v, lo, hi, def) { var n = Math.round(Number(v)); if (!isFinite(n) || n < lo || n > hi) return def; return n; }
  function sanitizeSettings(s) {
    var d = defaultSettings(); s = s || {};
    var out = {
      levelRequirements: sanitizeRequirements(s.levelRequirements),
      attendanceExp: int(s.attendanceExp, 0, 100, d.attendanceExp), trainingDefaultExp: int(s.trainingDefaultExp, 0, 100, d.trainingDefaultExp),
      dailyTaskExp: int(s.dailyTaskExp, 0, 100, d.dailyTaskExp), examPassExp: int(s.examPassExp, 0, 100, d.examPassExp),
      dailyBonusExp: int(s.dailyBonusExp, 0, 100, d.dailyBonusExp), bossBonusExp: (s.v || 1) < 2 && +s.bossBonusExp === 5 ? 10 : int(s.bossBonusExp, 0, 100, d.bossBonusExp),
      lateTaskExp: int(s.lateTaskExp, 0, 100, d.lateTaskExp), v: 2,
      dungeonRewards: {}, panelOpacity: int(s.panelOpacity, 40, 100, d.panelOpacity),
      soundEnabled: typeof s.soundEnabled === 'boolean' ? s.soundEnabled : d.soundEnabled, sfxVolume: int(s.sfxVolume, 0, 100, d.sfxVolume),
      screenShakeEnabled: typeof s.screenShakeEnabled === 'boolean' ? s.screenShakeEnabled : d.screenShakeEnabled,
      reducedMotion: typeof s.reducedMotion === 'boolean' ? s.reducedMotion : d.reducedMotion,
      dungeonSeconds: [5, 10, 15, 20, 30].indexOf(+s.dungeonSeconds) >= 0 ? +s.dungeonSeconds : d.dungeonSeconds,
      elemMatchups: validMatchups(s.elemMatchups, ELEMENTS.map(function (e) { return e.id; })) ? s.elemMatchups : d.elemMatchups,
      raceMatchups: validMatchups(s.raceMatchups, RACES.map(function (r) { return r.id; })) ? s.raceMatchups : d.raceMatchups,
      elemPct: int(s.elemPct, 0, 50, d.elemPct), racePct: int(s.racePct, 0, 50, d.racePct),
      auraEnabled: typeof s.auraEnabled === 'boolean' ? s.auraEnabled : d.auraEnabled, auraMinLevel: [1, 10, 20, 35, 50, 65, 80, 99].indexOf(+s.auraMinLevel) >= 0 ? +s.auraMinLevel : d.auraMinLevel,
      elementFx: typeof s.elementFx === 'boolean' ? s.elementFx : d.elementFx, hitFx: typeof s.hitFx === 'boolean' ? s.hitFx : d.hitFx
    };
    MODES.forEach(function (m) {
      var src = (s.dungeonRewards || {})[m.id] || {};
      out.dungeonRewards[m.id] = { easy: int(src.easy, 0, 100, d.dungeonRewards[m.id].easy), medium: int(src.medium, 0, 100, d.dungeonRewards[m.id].medium), hard: int(src.hard, 0, 100, d.dungeonRewards[m.id].hard) };
    });
    return out;
  }

  var ATTENDANCE = [
    { id: 'present', th: 'มาเรียน', short: 'มา', en: 'Present', enShort: 'P', color: '#55d69e', counts: true },
    { id: 'late', th: 'มาสาย', short: 'สาย', en: 'Late', enShort: 'L', color: '#f1d13f', counts: true },
    { id: 'leave', th: 'ลากิจ', short: 'ลา', en: 'Leave', enShort: 'LV', color: '#6fb7ff', counts: false },
    { id: 'sick', th: 'ลาป่วย', short: 'ป่วย', en: 'Sick', enShort: 'S', color: '#b38bff', counts: false },
    { id: 'absent', th: 'ขาดเรียน', short: 'ขาด', en: 'Absent', enShort: 'A', color: '#ef7655', counts: false }
  ];

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  return {
    STAGES: STAGES, ELEMENTS: ELEMENTS, RACES: RACES, raceById: raceById, elemById: elemById, MODES: MODES, DIFFS: DIFFS, modeById: modeById,
    ATTENDANCE: ATTENDANCE, GROUP_NAMES: GROUP_NAMES, GROUP_ICONS: GROUP_ICONS, ELEM_CYCLE: ELEM_CYCLE, randomMatchups: randomMatchups, validMatchups: validMatchups, relationIn: relationIn,
    stageIndexOf: stageIndexOf, stageOf: stageOf, titleOf: titleOf, weaponOf: weaponOf, weaponKindOf: weaponKindOf, armorOf: armorOf, charKey: charKey, allCharacterDesigns: allCharacterDesigns,
    defaultRequirements: defaultRequirements, sanitizeRequirements: sanitizeRequirements, thresholds: thresholds, expCap: expCap, levelFromExp: levelFromExp, levelProgress: levelProgress, applyDelta: applyDelta,
    stats: stats, elementRelation: elementRelation, raceRelation: raceRelation, computeDamage: computeDamage,
    generateQuestion: generateQuestion, diffIndex: diffIndex, fmtNum: fmtNum,
    bracketInfo: bracketInfo, buildBracket: buildBracket, syncBracket: syncBracket, setMatchWinner: setMatchWinner, readyMatches: readyMatches, findMatch: findMatch,
    shuffle: shuffle, bagNext: bagNext, makeGroups: makeGroups, makeBalancedGroups: makeBalancedGroups, groupRepeatPairs: groupRepeatPairs,
    dailyBoss: dailyBoss, buildHomeExport: buildHomeExport, HOME_MONSTERS: HOME_MONSTERS, homeMonsterById: homeMonsterById, homeSeed: homeSeed, homeWeekOf: homeWeekOf, homeQuestions: homeQuestions, homeCheck: homeCheck, homeReward: homeReward, parseAnswer: parseAnswer, examBoss: examBoss, effectiveScore: effectiveScore, examPassed: examPassed,
    bangkokDate: bangkokDate, daysInMonth: daysInMonth, isoWeekKey: isoWeekKey, parseRosterLines: parseRosterLines,
    defaultSettings: defaultSettings, sanitizeSettings: sanitizeSettings, clamp: clamp, mulberry32: mulberry32
  };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = QC;
