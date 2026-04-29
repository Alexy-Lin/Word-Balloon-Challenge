const STATUS_SCORE_MAP = { 0: 0, 1: 10, 2: 20, 3: 40, 4: 80 };
const STORE_KEY = "balloon_words_state_v2";
const MARKET_STORE_KEY = "balloon_market_state_v1";

const unitScreen = document.getElementById("unitScreen");
const manageScreen = document.getElementById("manageScreen");
const adminScreen = document.getElementById("adminScreen");
const marketScreen = document.getElementById("marketScreen");
const gameScreen = document.getElementById("gameScreen");
const unitList = document.getElementById("unitList");
const openMarketBtn = document.getElementById("openMarketBtn");
const openAdminBtn = document.getElementById("openAdminBtn");
const marketBackBtn = document.getElementById("marketBackBtn");
const marketListEl = document.getElementById("marketList");
const marketWalletSilverEl = document.getElementById("marketWalletSilver");
const marketWalletGoldEl = document.getElementById("marketWalletGold");
const manageTitleEl = document.getElementById("manageTitle");
const manageSummaryEl = document.getElementById("manageSummary");
const reviewCountTextEl = document.getElementById("reviewCountText");
const manageWordListEl = document.getElementById("manageWordList");
const manageBackBtn = document.getElementById("manageBackBtn");
const startLearnBtn = document.getElementById("startLearnBtn");
const startReviewBtn = document.getElementById("startReviewBtn");
const adminBackBtn = document.getElementById("adminBackBtn");
const adminUnitListEl = document.getElementById("adminUnitList");
const adminWordListEl = document.getElementById("adminWordList");
const adminWordTitleEl = document.getElementById("adminWordTitle");
const newUnitInput = document.getElementById("newUnitInput");
const addUnitBtn = document.getElementById("addUnitBtn");
const newWordCnInput = document.getElementById("newWordCnInput");
const newWordEnInput = document.getElementById("newWordEnInput");
const addWordBtn = document.getElementById("addWordBtn");
const batchStatusSelectEl = document.getElementById("batchStatusSelect");
const batchSetStatusBtn = document.getElementById("batchSetStatusBtn");
const sessionScoreEl = document.getElementById("sessionScore");
const totalScoreEl = document.getElementById("totalScore");
const goldCoinsEl = document.getElementById("goldCoins");
const modeLabelEl = document.getElementById("modeLabel");
const promptTextEl = document.getElementById("promptText");
const feedbackEl = document.getElementById("feedback");
const progressEnEl = document.getElementById("progressEn");
const progressCnEl = document.getElementById("progressCn");
const progressSimpleEl = document.getElementById("progressSimple");
const progressNormalEl = document.getElementById("progressNormal");
const spellingPanel = document.getElementById("spellingPanel");
const roadSceneEl = document.getElementById("roadScene");
const roadObstacleEl = document.getElementById("roadObstacle");
const roadFxEl = document.getElementById("roadFx");
const roadGapEl = document.getElementById("roadGap");
const roadWaterEl = document.getElementById("roadWater");
const roadCrashExplosionEl = document.getElementById("roadCrashExplosion");
const roadCarEl = document.getElementById("roadCar");
const roadCarBadgeEl = document.getElementById("roadCarBadge");
const spellingChallengeLabelEl = document.getElementById("spellingChallengeLabel");
const spellingWordEl = document.getElementById("spellingWord");
const keyboardEl = document.getElementById("keyboard");
const canvas = document.getElementById("balloonCanvas");
const ctx = canvas.getContext("2d");

const importBtn = document.getElementById("importBtn");
const exportBtn = document.getElementById("exportBtn");
const soundBtn = document.getElementById("soundBtn");
const speechBtn = document.getElementById("speechBtn");
const speakWordBtn = document.getElementById("speakWordBtn");
const fileInput = document.getElementById("fileInput");
const backBtn = document.getElementById("backBtn");
const syncStateEl = document.getElementById("syncState");
const answerOverlayEl = document.getElementById("answerOverlay");
const overlayChineseEl = document.getElementById("overlayChinese");
const overlayEnglishEl = document.getElementById("overlayEnglish");
const continueBtn = document.getElementById("continueBtn");
const speakWordBtnDefaultText = speakWordBtn ? speakWordBtn.textContent : "播放读音";

let allWords = [];
let selectedWords = [];
let sessionScore = 0;
let cumulativeScore = 0;
let goldCoins = 0;
let goldAwardedWords = new Set();
let ownedVehicleIds = new Set(["default_bugatti"]);
let equippedVehicleId = "default_bugatti";
let ownedEffectIds = new Set(["effect_default"]);
let equippedEffectId = "effect_default";
let selectedUnit = "所有单元";
let currentRunMode = "normal";
let reviewCompletionRecorded = false;
let reviewCountsByUnit = {};
let unitCatalog = [];
let adminSelectedUnit = "";

let currentWord = null;
let balloons = [];
let particles = [];
let explosions = [];
let clouds = [];
let spellingIndex = 0;
let spelledMap = {};
let feedbackTimer = null;
let questionLocked = false;
let syncTimer = null;
let isMouseInCanvas = false;
let mouseCanvasX = 0;
let mouseCanvasY = 0;
let waitingManualContinue = false;
let wrongOverlayContinueHandler = null;
let spellingSceneTimer = null;
let currentSpellingChallenge = null;

let soundEnabled = true;
let audioCtx = null;
let speechEnabled = true;
let preferredSpeechVoice = null;
let speakWordBtnPlaying = false;

const SPELLING_CHALLENGES = [
  {
    key: "barrier",
    label: "前方是大路障，拼对单词撞开它",
    obstacleText: "路障",
    successFx: "撞开",
    failFx: "爆炸",
  },
  {
    key: "cliff",
    label: "前方是悬崖，拼对单词飞跃过去",
    obstacleText: "悬崖",
    successFx: "飞跃",
    failFx: "坠落",
  },
  {
    key: "rock",
    label: "前方滚来巨石，拼对单词把它顶飞",
    obstacleText: "巨石",
    successFx: "顶飞",
    failFx: "爆炸",
  },
  {
    key: "water",
    label: "前方是大水坑，拼对单词跳过去",
    obstacleText: "水坑",
    successFx: "跳过",
    failFx: "翻车",
  },
  {
    key: "bridge",
    label: "前方断桥了，拼对单词冲过去",
    obstacleText: "断桥",
    successFx: "冲过",
    failFx: "掉落",
  },
  {
    key: "cones",
    label: "前方锥桶阵挡路，拼对单词冲散它",
    obstacleText: "锥桶阵",
    successFx: "冲散",
    failFx: "爆炸",
  },
];

const WORD_COMPLETE_REWARD = STATUS_SCORE_MAP[4];
const VEHICLE_CATALOG = [
  {
    id: "default_bugatti",
    name: "默认车型",
    style: "default",
    preview: "免费",
    desc: "初始可用，速度稳定。",
    price: 0,
  },
  {
    id: "rusty_oldtimer",
    name: "破旧老爷车",
    style: "oldtimer",
    preview: "老爷车",
    desc: "老旧但有情怀，适合刚起步。",
    price: 1000,
  },
  {
    id: "family_car",
    name: "普通家用车",
    style: "family",
    preview: "家用车",
    desc: "舒适耐用，稳定推进学习。",
    price: 3000,
  },
  {
    id: "city_taxi",
    name: "城市出租车",
    style: "taxi",
    preview: "出租车",
    desc: "黄黑涂装，街头感拉满。",
    price: 5000,
  },
  {
    id: "business_sedan",
    name: "商务轿车",
    style: "sedan",
    preview: "轿车",
    desc: "线条流畅，质感升级。",
    price: 10000,
  },
  {
    id: "patrol_police",
    name: "警车",
    style: "police",
    preview: "警车",
    desc: "蓝红警示，气势十足。",
    price: 15000,
  },
  {
    id: "rescue_firetruck",
    name: "消防车",
    style: "fire",
    preview: "消防车",
    desc: "救援风格，厚重可靠。",
    price: 30000,
  },
  {
    id: "track_supercar",
    name: "赛道跑车",
    style: "supercar",
    preview: "跑车",
    desc: "高性能涂装，压迫感强。",
    price: 50000,
  },
  {
    id: "steel_tank",
    name: "装甲坦克",
    style: "tank",
    preview: "坦克",
    desc: "重装甲风格，冲撞感最强。",
    price: 80000,
  },
  {
    id: "gold_bugatti",
    name: "黄金布加迪",
    style: "gold",
    preview: "黄金布加迪",
    desc: "顶级收藏，金光闪耀。",
    price: 120000,
  },
];

const EFFECT_CATALOG = [
  {
    id: "effect_default",
    name: "默认特效",
    style: "default",
    preview: "基础",
    desc: "免费基础效果。",
    price: 0,
  },
  {
    id: "effect_neon",
    name: "霓虹尾迹",
    style: "neon",
    preview: "尾迹",
    desc: "车后拖出霓虹轨迹，视觉更炫。",
    price: 8000,
  },
  {
    id: "effect_flame",
    name: "烈焰喷射",
    style: "flame",
    preview: "火焰",
    desc: "尾部喷射火焰，冲刺感更强。",
    price: 20000,
  },
  {
    id: "effect_thunder",
    name: "雷霆电流",
    style: "thunder",
    preview: "电流",
    desc: "车身带电流闪烁，顶级压迫感。",
    price: 40000,
  },
];

function setSyncState(text, isOk) {
  syncStateEl.textContent = text;
  syncStateEl.className = isOk === null ? "" : isOk ? "ok" : "bad";
}

function ensureAudio() {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (Ctx) audioCtx = new Ctx();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, durationMs, type = "sine", gainValue = 0.05) {
  if (!soundEnabled) return;
  ensureAudio();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + durationMs / 1000);
}

function soundPop() {
  playTone(560, 110, "triangle", 0.06);
}

function playNoiseBurst(durationMs = 70, gainValue = 0.16) {
  if (!soundEnabled) return;
  ensureAudio();
  if (!audioCtx) return;
  const bufferSize = Math.max(1, Math.floor((audioCtx.sampleRate * durationMs) / 1000));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) {
    const decay = 1 - i / bufferSize;
    data[i] = (Math.random() * 2 - 1) * decay;
  }

  const source = audioCtx.createBufferSource();
  const gain = audioCtx.createGain();
  source.buffer = buffer;
  gain.gain.value = gainValue;
  source.connect(gain);
  gain.connect(audioCtx.destination);
  source.start();
}

function soundBalloonBurst() {
  playNoiseBurst(70, 0.15);
  playTone(150, 50, "square", 0.05);
}

function soundGood() {
  playTone(440, 100, "triangle", 0.06);
  setTimeout(() => playTone(660, 130, "triangle", 0.05), 80);
}

function soundBad() {
  playTone(280, 160, "square", 0.04);
}

function soundCrashExplosion() {
  playNoiseBurst(120, 0.22);
  playTone(92, 130, "sawtooth", 0.07);
  setTimeout(() => playTone(68, 220, "square", 0.06), 32);
  setTimeout(() => playNoiseBurst(90, 0.12), 110);
}

function triggerCrashExplosion(isHeavy = false) {
  if (!roadCrashExplosionEl) return;
  roadCrashExplosionEl.classList.remove("active", "heavy");
  void roadCrashExplosionEl.offsetWidth;
  if (isHeavy) roadCrashExplosionEl.classList.add("heavy");
  roadCrashExplosionEl.classList.add("active");
  soundCrashExplosion();
}

function resolvePreferredSpeechVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices() || [];
  if (!voices.length) return;
  preferredSpeechVoice =
    voices.find((v) => String(v.lang || "").toLowerCase() === "en-us") ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith("en-us")) ||
    voices.find((v) => String(v.lang || "").toLowerCase().startsWith("en")) ||
    null;
}

function stopSpeech() {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  setSpeakWordButtonPlaying(false);
}

function setSpeakWordButtonPlaying(isPlaying) {
  if (!speakWordBtn) return;
  speakWordBtnPlaying = !!isPlaying;
  speakWordBtn.classList.toggle("is-speaking", speakWordBtnPlaying);
  speakWordBtn.disabled = speakWordBtnPlaying;
  speakWordBtn.textContent = speakWordBtnPlaying ? "播放中..." : speakWordBtnDefaultText;
}

function speakEnglish(text, options = {}) {
  const withButtonEffect = !!options.withButtonEffect;
  if (!speechEnabled) return;
  if (!("speechSynthesis" in window)) return;
  const normalized = String(text || "").trim();
  if (!normalized) return;

  resolvePreferredSpeechVoice();
  if (withButtonEffect) setSpeakWordButtonPlaying(true);
  stopSpeech();
  if (withButtonEffect) setSpeakWordButtonPlaying(true);
  const utterance = new SpeechSynthesisUtterance(normalized);
  utterance.lang = "en-US";
  utterance.rate = 0.92;
  utterance.pitch = 1;
  if (preferredSpeechVoice) utterance.voice = preferredSpeechVoice;
  if (withButtonEffect) {
    utterance.onend = () => setSpeakWordButtonPlaying(false);
    utterance.onerror = () => setSpeakWordButtonPlaying(false);
  }
  window.speechSynthesis.speak(utterance);
}

function speakCurrentWordEnglish(options = {}) {
  if (!currentWord) return;
  speakEnglish(currentWord.english, options);
}

function showBalloonStage() {
  canvas.classList.remove("hidden");
  roadSceneEl.classList.add("hidden");
}

function showRoadStage() {
  canvas.classList.add("hidden");
  roadSceneEl.classList.remove("hidden");
}

function clearSpellingSceneTimer() {
  if (!spellingSceneTimer) return;
  clearTimeout(spellingSceneTimer);
  spellingSceneTimer = null;
}

function chooseSpellingChallenge() {
  currentSpellingChallenge = randomPick(SPELLING_CHALLENGES);
}

function resetSpellingScene() {
  clearSpellingSceneTimer();
  const isHidden = roadSceneEl.classList.contains("hidden");
  roadSceneEl.className = `road-scene challenge-${currentSpellingChallenge?.key || "barrier"}${isHidden ? " hidden" : ""}`;
  roadObstacleEl.textContent = currentSpellingChallenge?.obstacleText || "路障";
  roadFxEl.textContent = "";
  if (roadCrashExplosionEl) roadCrashExplosionEl.classList.remove("active", "heavy");
  roadGapEl.classList.remove("hidden");
  roadWaterEl.classList.remove("hidden");
  spellingChallengeLabelEl.textContent = currentSpellingChallenge?.label || "拼对单词继续前进";
}

function playSpellingSceneResult(success, onDone) {
  if (!currentSpellingChallenge) chooseSpellingChallenge();
  clearSpellingSceneTimer();
  const isHidden = roadSceneEl.classList.contains("hidden");
  roadSceneEl.className = `road-scene challenge-${currentSpellingChallenge.key} ${success ? "success" : "failure"}${isHidden ? " hidden" : ""}`;
  roadFxEl.textContent = success ? currentSpellingChallenge.successFx : currentSpellingChallenge.failFx;
  const isCrashChallenge = ["barrier", "rock", "cones"].includes(currentSpellingChallenge.key);
  const isGapChallenge = ["cliff", "water", "bridge"].includes(currentSpellingChallenge.key);
  const sceneDurationMs = success
    ? (isGapChallenge ? 2450 : 1650)
    : (isGapChallenge ? 1450 : 1200);

  if (isCrashChallenge) {
    triggerCrashExplosion(!success);
  }
  
  // 答题成功时触发车的前进动�?
  if (success) {
    const roadCar = document.getElementById("roadCar");
    if (roadCar) {
      roadCar.classList.add("driving");
    }
  }
  
  spellingSceneTimer = setTimeout(() => {
    spellingSceneTimer = null;
    if (roadCrashExplosionEl) roadCrashExplosionEl.classList.remove("active", "heavy");
    // 移除动画类以重置
    if (success) {
      const roadCar = document.getElementById("roadCar");
      if (roadCar) {
        roadCar.classList.remove("driving");
      }
    }
    if (onDone) onDone();
  }, sceneDurationMs);
}

function getEnglishForBalloonChoice(pickedText) {
  if (!currentWord) return "";
  if (currentWord.status === 0) return pickedText;
  if (currentWord.status === 1) {
    const found = selectedWords.find((w) => w.chinese === pickedText);
    return found ? found.english : "";
  }
  return "";
}

function parseCsvLine(line) {
  const result = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuote = !inQuote;
      }
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean);
  if (!lines.length) return [];

  const header = parseCsvLine(lines[0]).map((x) => x.replace(/^\uFEFF/, "").trim().toLowerCase());
  const col = {
    chinese: header.indexOf("中文"),
    english: header.indexOf("英文"),
    unit: header.indexOf("unit"),
    status: header.indexOf("status"),
  };

  return lines
    .slice(1)
    .map((line) => {
      const row = parseCsvLine(line);
      const chinese = (row[col.chinese] || "").trim();
      const norm = chinese.toLowerCase().replace(/\s+/g, "");
      if (!chinese || norm === "totalscore" || norm === "totlascore") return null;
      const statusNum = Math.max(0, Math.min(4, Number.parseInt(row[col.status] || "0", 10) || 0));
      return {
        chinese,
        english: (row[col.english] || "").trim(),
        unit: (row[col.unit] || "默认单元").trim() || "默认单元",
        status: statusNum,
        score: STATUS_SCORE_MAP[statusNum],
        hintActive: false,
      };
    })
    .filter(Boolean);
}

function csvEscape(value) {
  const v = String(value ?? "");
  if (v.includes(",") || v.includes('"') || v.includes("\n")) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function toCsv(words) {
  const header = ["中文", "英文", "unit", "status", "score"];
  const rows = words.map((w) => [w.chinese, w.english, w.unit, w.status, STATUS_SCORE_MAP[w.status]]);
  const total = rows.reduce((acc, r) => acc + Number(r[4]), 0);
  rows.push(["totla score", "", "", "", total]);
  return [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n") + "\n";
}

function saveLocalState() {
  const state = allWords.map((w) => ({ chinese: w.chinese, status: w.status, hintActive: !!w.hintActive }));
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function applyLocalState() {
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    const map = new Map(state.map((x) => [x.chinese, x]));
    allWords.forEach((w) => {
      const s = map.get(w.chinese);
      if (!s) return;
      w.status = Math.max(0, Math.min(4, Number(s.status) || 0));
      w.hintActive = !!s.hintActive;
      w.score = STATUS_SCORE_MAP[w.status];
    });
  } catch (error) {
    console.warn("localStorage 数据损坏", error);
  }
}

function recalcScoresFromStatus(words) {
  let changed = false;
  words.forEach((w) => {
    const nextScore = STATUS_SCORE_MAP[w.status] ?? 0;
    if (w.score !== nextScore) changed = true;
    w.score = nextScore;
  });
  return changed;
}

function normalizeWordKey(value) {
  return String(value || "").trim();
}

function getCompletedWordKeys(words) {
  return words.filter((w) => w.status >= 4).map((w) => normalizeWordKey(w.chinese)).filter(Boolean);
}

function initCurrencyFromWords(words) {
  const completed = getCompletedWordKeys(words);
  cumulativeScore = completed.length * WORD_COMPLETE_REWARD;
  goldCoins = completed.length * WORD_COMPLETE_REWARD;
  goldAwardedWords = new Set(completed);
}

function applyCurrencyFromPayload(data, words = allWords) {
  const completed = getCompletedWordKeys(words);
  const fallbackSilver = completed.length * WORD_COMPLETE_REWARD;
  const silverRaw = data ? (data.silverCoins ?? data.cumulativeScore ?? data.totalScore) : fallbackSilver;
  cumulativeScore = Math.max(0, Number.parseInt(silverRaw, 10) || fallbackSilver);

  const hasGoldData =
    !!data &&
    (Object.prototype.hasOwnProperty.call(data, "goldCoins") ||
      Object.prototype.hasOwnProperty.call(data, "goldEarnedWords"));

  if (!hasGoldData) {
    goldCoins = completed.length * WORD_COMPLETE_REWARD;
    goldAwardedWords = new Set(completed);
    return;
  }

  const earnedWords = Array.isArray(data.goldEarnedWords)
    ? data.goldEarnedWords.map((x) => normalizeWordKey(x)).filter(Boolean)
    : [];
  goldAwardedWords = new Set(earnedWords);
  goldCoins = Math.max(0, Number.parseInt(data.goldCoins, 10) || 0);
}

function awardWordCompletionRewards(word) {
  cumulativeScore += WORD_COMPLETE_REWARD;
  const key = normalizeWordKey(word?.chinese);
  if (key && !goldAwardedWords.has(key)) {
    goldAwardedWords.add(key);
    goldCoins += WORD_COMPLETE_REWARD;
  }
}

function getVehicleById(id) {
  return VEHICLE_CATALOG.find((v) => v.id === id) || VEHICLE_CATALOG[0];
}

function getEffectById(id) {
  return EFFECT_CATALOG.find((v) => v.id === id) || EFFECT_CATALOG[0];
}

function getVehicleOwnedIdsWithDefault(list) {
  const owned = Array.isArray(list) ? list : [];
  const filtered = owned.map((x) => String(x || "").trim()).filter((x) => VEHICLE_CATALOG.some((v) => v.id === x));
  if (!filtered.includes("default_bugatti")) filtered.push("default_bugatti");
  return Array.from(new Set(filtered));
}

function getEffectOwnedIdsWithDefault(list) {
  const owned = Array.isArray(list) ? list : [];
  const filtered = owned.map((x) => String(x || "").trim()).filter((x) => EFFECT_CATALOG.some((v) => v.id === x));
  if (!filtered.includes("effect_default")) filtered.push("effect_default");
  return Array.from(new Set(filtered));
}

function saveLocalMarketState() {
  const payload = {
    ownedVehicleIds: Array.from(ownedVehicleIds),
    equippedVehicleId,
    ownedEffectIds: Array.from(ownedEffectIds),
    equippedEffectId,
  };
  localStorage.setItem(MARKET_STORE_KEY, JSON.stringify(payload));
}

function loadLocalMarketState() {
  const raw = localStorage.getItem(MARKET_STORE_KEY);
  if (!raw) return;
  try {
    const state = JSON.parse(raw);
    const owned = getVehicleOwnedIdsWithDefault(state.ownedVehicleIds);
    ownedVehicleIds = new Set(owned);
    const maybeEquipped = String(state.equippedVehicleId || "").trim();
    equippedVehicleId = ownedVehicleIds.has(maybeEquipped) ? maybeEquipped : "default_bugatti";

    const ownedEffects = getEffectOwnedIdsWithDefault(state.ownedEffectIds);
    ownedEffectIds = new Set(ownedEffects);
    const maybeEffect = String(state.equippedEffectId || "").trim();
    equippedEffectId = ownedEffectIds.has(maybeEffect) ? maybeEffect : "effect_default";
  } catch (error) {
    console.warn("market local state damaged", error);
  }
}

function applyVehicleToScene() {
  if (!roadCarEl) return;
  const car = getVehicleById(equippedVehicleId);
  const effect = getEffectById(equippedEffectId);
  roadCarEl.dataset.vehicle = car.style;
  roadCarEl.dataset.effect = effect.style;
  if (roadCarBadgeEl) roadCarBadgeEl.textContent = `${car.name} · ${effect.name}`;
}

function applyMarketFromPayload(data) {
  const hasRemote =
    !!data &&
    (Object.prototype.hasOwnProperty.call(data, "ownedVehicleIds") ||
      Object.prototype.hasOwnProperty.call(data, "equippedVehicleId"));
  if (!hasRemote) {
    loadLocalMarketState();
    applyVehicleToScene();
    return;
  }
  const owned = getVehicleOwnedIdsWithDefault(data.ownedVehicleIds);
  ownedVehicleIds = new Set(owned);
  const maybeEquipped = String(data.equippedVehicleId || "").trim();
  equippedVehicleId = ownedVehicleIds.has(maybeEquipped) ? maybeEquipped : "default_bugatti";

  const ownedEffects = getEffectOwnedIdsWithDefault(data.ownedEffectIds);
  ownedEffectIds = new Set(ownedEffects);
  const maybeEffect = String(data.equippedEffectId || "").trim();
  equippedEffectId = ownedEffectIds.has(maybeEffect) ? maybeEffect : "effect_default";

  saveLocalMarketState();
  applyVehicleToScene();
}

function updateScoreUi() {
  sessionScoreEl.textContent = String(sessionScore);
  totalScoreEl.textContent = String(cumulativeScore);
  if (goldCoinsEl) goldCoinsEl.textContent = String(goldCoins);
  if (marketWalletSilverEl) marketWalletSilverEl.textContent = String(cumulativeScore);
  if (marketWalletGoldEl) marketWalletGoldEl.textContent = String(goldCoins);
}

function updateModeProgressUi() {
  const total = selectedWords.length || 0;
  const enDone = selectedWords.filter((w) => w.status >= 1).length;
  const cnDone = selectedWords.filter((w) => w.status >= 2).length;
  const simpleDone = selectedWords.filter((w) => w.status >= 3).length;
  const normalDone = selectedWords.filter((w) => w.status >= 4).length;

  progressEnEl.textContent = `${enDone}/${total}`;
  progressCnEl.textContent = `${cnDone}/${total}`;
  progressSimpleEl.textContent = `${simpleDone}/${total}`;
  progressNormalEl.textContent = `${normalDone}/${total}`;
}

function showFeedback(text, ok) {
  feedbackEl.textContent = text;
  feedbackEl.className = `feedback ${ok ? "ok" : "bad"}`;
}

function clearFeedback() {
  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
}

function updateKeyboardHintHighlight() {
  keyboardEl.querySelectorAll(".key.hint-next").forEach((btn) => btn.classList.remove("hint-next"));
  keyboardEl.classList.remove("hint-active");
}

function showWrongAnswerOverlay(word, onContinue) {
  if (!word) return;
  overlayChineseEl.textContent = word.chinese;
  overlayEnglishEl.textContent = word.english;
  wrongOverlayContinueHandler = typeof onContinue === "function" ? onContinue : null;
  answerOverlayEl.classList.remove("hidden");
  waitingManualContinue = true;
  questionLocked = true;
}

function hideWrongAnswerOverlay() {
  answerOverlayEl.classList.add("hidden");
  waitingManualContinue = false;
}

function continueAfterWrong() {
  if (!waitingManualContinue) return;
  const continueHandler = wrongOverlayContinueHandler;
  wrongOverlayContinueHandler = null;
  hideWrongAnswerOverlay();
  if (continueHandler) {
    continueHandler();
    return;
  }
  nextQuestion();
}

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getAllUnits() {
  const s = new Set(unitCatalog);
  allWords.forEach((w) => {
    if (w.unit) s.add(w.unit);
  });
  return Array.from(s).sort((a, b) => a.localeCompare(b));
}

function buildUnitButtons() {
  unitList.innerHTML = "";
  const map = new Map();
  allWords.forEach((w) => map.set(w.unit, (map.get(w.unit) || 0) + 1));
  const units = ["所有单元", ...getAllUnits()];

  units.forEach((u) => {
    const btn = document.createElement("button");
    btn.className = "unit-btn";
    const count = u === "所有单元" ? allWords.length : map.get(u);
    btn.innerHTML = `${u}<small>${count} 个单词</small>`;
    btn.addEventListener("click", () => openUnitManage(u));
    unitList.appendChild(btn);
  });
}

function getWordsByUnit(unit) {
  return unit === "所有单元" ? allWords : allWords.filter((w) => w.unit === unit);
}

function closeAllScreens() {
  unitScreen.classList.add("hidden");
  manageScreen.classList.add("hidden");
  adminScreen.classList.add("hidden");
  marketScreen.classList.add("hidden");
  gameScreen.classList.add("hidden");
}

function openHomeScreen() {
  closeAllScreens();
  unitScreen.classList.remove("hidden");
}

function createMarketPreviewNode(vehicleStyle, effectStyle, labelText) {
  const preview = document.createElement("div");
  preview.className = "market-preview";

  const car = document.createElement("div");
  car.className = "market-preview-car";
  car.dataset.vehicle = vehicleStyle;
  car.dataset.effect = effectStyle;

  const trail = document.createElement("div");
  trail.className = "preview-trail";
  const body = document.createElement("div");
  body.className = "preview-body";
  const cabin = document.createElement("div");
  cabin.className = "preview-cabin";
  const wheelA = document.createElement("div");
  wheelA.className = "preview-wheel wheel-a";
  const wheelB = document.createElement("div");
  wheelB.className = "preview-wheel wheel-b";
  const label = document.createElement("span");
  label.className = "preview-label";
  label.textContent = labelText;

  car.appendChild(trail);
  car.appendChild(body);
  car.appendChild(cabin);
  car.appendChild(wheelA);
  car.appendChild(wheelB);
  preview.appendChild(car);
  preview.appendChild(label);
  return preview;
}

function renderMarketList() {
  marketListEl.innerHTML = "";
  const renderSection = (titleText, catalog, ownedSet, equippedId, onEquip, buildPreview) => {
    const titleEl = document.createElement("h3");
    titleEl.className = "market-section-title";
    titleEl.textContent = titleText;
    marketListEl.appendChild(titleEl);

    const section = document.createElement("div");
    section.className = "market-list";

    catalog.forEach((item) => {
      const owned = ownedSet.has(item.id);
      const equipped = equippedId === item.id;

      const card = document.createElement("div");
      card.className = `market-item ${equipped ? "equipped" : ""}`;

      const info = document.createElement("div");
      info.className = "market-item-info";

      const name = document.createElement("h4");
      name.textContent = `${item.name} · ${item.preview}`;

      const desc = document.createElement("p");
      desc.textContent = item.desc;

      const price = document.createElement("p");
      price.className = "market-price";
      price.textContent = item.price === 0 ? "免费" : `${item.price} 银币`;

      const status = document.createElement("span");
      status.className = `market-status ${equipped ? "equipped" : owned ? "owned" : "locked"}`;
      status.textContent = equipped ? "已装备" : owned ? "已拥有" : "未购买";

      const preview = buildPreview(item);

      const actionBtn = document.createElement("button");
      actionBtn.className = `btn ${owned ? "ghost" : "warn"}`;

      if (!owned) {
        actionBtn.textContent = `购买 (${item.price})`;
        actionBtn.addEventListener("click", () => {
          if (cumulativeScore < item.price) {
            alert("银币不足，继续学习赚取银币后再来购买。");
            return;
          }
          cumulativeScore -= item.price;
          ownedSet.add(item.id);
          onEquip(item.id);
          saveLocalMarketState();
          applyVehicleToScene();
          updateScoreUi();
          renderMarketList();
          scheduleSync();
        });
      } else if (!equipped) {
        actionBtn.textContent = "装备";
        actionBtn.addEventListener("click", () => {
          onEquip(item.id);
          saveLocalMarketState();
          applyVehicleToScene();
          renderMarketList();
          scheduleSync();
        });
      } else {
        actionBtn.textContent = "当前使用";
        actionBtn.disabled = true;
      }

      info.appendChild(name);
      info.appendChild(desc);
      info.appendChild(price);
      card.appendChild(info);
      card.appendChild(preview);
      card.appendChild(status);
      card.appendChild(actionBtn);
      section.appendChild(card);
    });

    marketListEl.appendChild(section);
  };

  renderSection(
    "车辆",
    VEHICLE_CATALOG,
    ownedVehicleIds,
    equippedVehicleId,
    (id) => {
      equippedVehicleId = id;
    },
    (item) => createMarketPreviewNode(item.style, getEffectById(equippedEffectId).style, item.preview)
  );

  renderSection(
    "特效",
    EFFECT_CATALOG,
    ownedEffectIds,
    equippedEffectId,
    (id) => {
      equippedEffectId = id;
    },
    (item) => createMarketPreviewNode(getVehicleById(equippedVehicleId).style, item.style, item.preview)
  );
}

function openMarketScreen() {
  updateScoreUi();
  renderMarketList();
  closeAllScreens();
  marketScreen.classList.remove("hidden");
}

function reviewCountForUnit(unit) {
  return Number(reviewCountsByUnit[unit] || 0);
}

function buildManageWordList(words) {
  manageWordListEl.innerHTML = "";
  if (!words.length) {
    const empty = document.createElement("p");
    empty.textContent = "该单元暂无单词";
    manageWordListEl.appendChild(empty);
    return;
  }

  words.forEach((w) => {
    const row = document.createElement("div");
    row.className = "manage-word-row";
    row.innerHTML = `
      <span class="word-cn">${w.chinese}</span>
      <span class="word-en">${w.english || "-"}</span>
      <span class="word-status">进度 ${w.status}/4</span>
    `;
    manageWordListEl.appendChild(row);
  });
}

function openUnitManage(unit) {
  selectedUnit = unit;
  const words = getWordsByUnit(unit);
  const done = words.filter((w) => w.status >= 4).length;
  const allDone = words.length > 0 && done === words.length;

  manageTitleEl.textContent = `单元管理: ${unit}`;
  manageSummaryEl.textContent = `完成进度: ${done}/${words.length}`;
  reviewCountTextEl.textContent = `复习模式完成次数: ${reviewCountForUnit(unit)}`;
  startReviewBtn.disabled = !allDone;
  startLearnBtn.disabled = words.length === 0;
  startLearnBtn.textContent = allDone ? "开始学习（自动复习）" : "开始学习";
  buildManageWordList(words);

  closeAllScreens();
  manageScreen.classList.remove("hidden");
}

function resetWordsForReview(words) {
  words.forEach((w) => {
    w.status = 0;
    w.hintActive = false;
    w.score = STATUS_SCORE_MAP[0];
  });
}

function startGameByUnit(unit, mode = "normal") {
  selectedWords = getWordsByUnit(unit);
  if (!selectedWords.length) {
    alert("该单元没有单词");
    return;
  }
  currentRunMode = mode;
  reviewCompletionRecorded = false;
  if (mode === "review") {
    resetWordsForReview(selectedWords);
    saveLocalState();
    scheduleSync();
  }
  sessionScore = 0;
  updateScoreUi();
  updateModeProgressUi();
  closeAllScreens();
  gameScreen.classList.remove("hidden");
  nextQuestion();
}

function refreshUnitCatalog() {
  unitCatalog = getAllUnits();
}

function adminGetSelectedWords() {
  if (!adminSelectedUnit) return [];
  return allWords.filter((w) => w.unit === adminSelectedUnit);
}

function createStatusSelect(status) {
  const sel = document.createElement("select");
  sel.className = "text-input";
  sel.style.maxWidth = "88px";
  for (let i = 0; i <= 4; i += 1) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `进度${i}`;
    if (i === status) opt.selected = true;
    sel.appendChild(opt);
  }
  return sel;
}

async function saveAdminChanges() {
  const payload = {
    words: allWords.map((w) => ({
      chinese: w.chinese,
      english: w.english,
      unit: w.unit,
      status: w.status,
    })),
    meta: {
      cumulativeScore,
      silverCoins: cumulativeScore,
      goldCoins,
      goldEarnedWords: Array.from(goldAwardedWords),
      ownedVehicleIds: Array.from(ownedVehicleIds),
      equippedVehicleId,
      ownedEffectIds: Array.from(ownedEffectIds),
      equippedEffectId,
      reviewCounts: reviewCountsByUnit,
      units: unitCatalog,
    },
  };

  const res = await fetch("/api/admin/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("admin save failed");
  const data = await res.json();
  allWords = (data.words || []).map((w) => ({ ...w, hintActive: false }));
  applyCurrencyFromPayload(data, allWords);
  applyMarketFromPayload(data);
  reviewCountsByUnit = data.reviewCounts && typeof data.reviewCounts === "object" ? data.reviewCounts : reviewCountsByUnit;
  unitCatalog = Array.isArray(data.units) ? data.units : getAllUnits();
  saveLocalState();
  buildUnitButtons();
  updateScoreUi();
  setSyncState("已同步", true);
}

function renderAdminWordList() {
  adminWordListEl.innerHTML = "";
  adminWordTitleEl.textContent = adminSelectedUnit ? `单词管理: ${adminSelectedUnit}` : "单词管理";
  if (!adminSelectedUnit) {
    const p = document.createElement("p");
    p.textContent = "请先选择一个单元";
    adminWordListEl.appendChild(p);
    return;
  }

  const list = adminGetSelectedWords();
  if (!list.length) {
    const p = document.createElement("p");
    p.textContent = "该单元暂无单词";
    adminWordListEl.appendChild(p);
    return;
  }

  list.forEach((w) => {
    const row = document.createElement("div");
    row.className = "admin-word-row";

    const cnInput = document.createElement("input");
    cnInput.className = "text-input word-row-grow";
    cnInput.value = w.chinese;

    const enInput = document.createElement("input");
    enInput.className = "text-input word-row-grow";
    enInput.value = w.english;

    const statusSelect = createStatusSelect(w.status);

    const saveBtn = document.createElement("button");
    saveBtn.className = "btn ghost";
    saveBtn.textContent = "保存";
    saveBtn.addEventListener("click", async () => {
      const nextCn = cnInput.value.trim();
      const nextEn = enInput.value.trim();
      const nextStatus = Math.max(0, Math.min(4, Number.parseInt(statusSelect.value, 10) || 0));
      if (!nextCn) {
        alert("中文不能为空");
        return;
      }
      const duplicate = allWords.find((x) => x.chinese === nextCn && x !== w);
      if (duplicate) {
        alert("中文词条重复，请换一个中文");
        return;
      }
      w.chinese = nextCn;
      w.english = nextEn;
      w.status = nextStatus;
      w.score = STATUS_SCORE_MAP[nextStatus];
      try {
        await saveAdminChanges();
        buildAdminUnitList();
        renderAdminWordList();
      } catch (error) {
        console.warn(error);
        alert("保存失败，请重试");
      }
    });

    const delBtn = document.createElement("button");
    delBtn.className = "btn warn";
    delBtn.textContent = "删除";
    delBtn.addEventListener("click", async () => {
      const ok = window.confirm(`确认删除单词: ${w.chinese} ?`);
      if (!ok) return;
      allWords = allWords.filter((x) => x !== w);
      try {
        await saveAdminChanges();
        buildAdminUnitList();
        renderAdminWordList();
      } catch (error) {
        console.warn(error);
        alert("删除失败，请重试");
      }
    });

    row.appendChild(cnInput);
    row.appendChild(enInput);
    row.appendChild(statusSelect);
    row.appendChild(saveBtn);
    row.appendChild(delBtn);
    adminWordListEl.appendChild(row);
  });
}

function buildAdminUnitList() {
  adminUnitListEl.innerHTML = "";
  const units = getAllUnits();
  if (!units.length) {
    const p = document.createElement("p");
    p.textContent = "暂无单元，请先新增单元";
    adminUnitListEl.appendChild(p);
    adminSelectedUnit = "";
    renderAdminWordList();
    return;
  }

  if (!adminSelectedUnit || !units.includes(adminSelectedUnit)) {
    adminSelectedUnit = units[0];
  }

  units.forEach((u) => {
    const row = document.createElement("div");
    row.className = `admin-unit-row ${u === adminSelectedUnit ? "active" : ""}`;
    row.tabIndex = 0;

    const info = document.createElement("div");
    info.className = "unit-info";

    const name = document.createElement("span");
    name.className = "unit-name";
    name.textContent = u;

    const renameBtn = document.createElement("button");
    renameBtn.className = `btn ghost unit-rename-btn ${u === adminSelectedUnit ? "" : "hidden"}`;
    renameBtn.textContent = "改名";
    renameBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const next = window.prompt("请输入新的单元名称", u);
      if (next === null) return;
      const newUnitName = next.trim();
      if (!newUnitName) {
        alert("单元名称不能为空");
        return;
      }
      if (newUnitName === u) return;
      if (getAllUnits().includes(newUnitName)) {
        alert("该单元名已存在");
        return;
      }

      allWords.forEach((w) => {
        if (w.unit === u) w.unit = newUnitName;
      });
      unitCatalog = unitCatalog.map((x) => (x === u ? newUnitName : x));
      if (Object.prototype.hasOwnProperty.call(reviewCountsByUnit, u)) {
        reviewCountsByUnit[newUnitName] = reviewCountsByUnit[u];
        delete reviewCountsByUnit[u];
      }
      if (adminSelectedUnit === u) adminSelectedUnit = newUnitName;

      try {
        await saveAdminChanges();
        buildAdminUnitList();
        renderAdminWordList();
      } catch (error) {
        console.warn(error);
        alert("修改单元名称失败，请重试");
      }
    });

    const count = document.createElement("span");
    count.className = "unit-count";
    count.textContent = `${getWordsByUnit(u).length} 个词`;

    const delBtn = document.createElement("button");
    delBtn.className = "btn warn";
    delBtn.textContent = "删除";
    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const ok = window.confirm(`确认删除单元 ${u} 及其全部单词?`);
      if (!ok) return;
      allWords = allWords.filter((w) => w.unit !== u);
      unitCatalog = unitCatalog.filter((x) => x !== u);
      delete reviewCountsByUnit[u];
      if (adminSelectedUnit === u) adminSelectedUnit = "";
      try {
        await saveAdminChanges();
        buildAdminUnitList();
        renderAdminWordList();
      } catch (error) {
        console.warn(error);
        alert("删除单元失败，请重试");
      }
    });

    row.addEventListener("click", () => {
      adminSelectedUnit = u;
      buildAdminUnitList();
      renderAdminWordList();
    });

    row.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      adminSelectedUnit = u;
      buildAdminUnitList();
      renderAdminWordList();
    });

    info.appendChild(name);
    info.appendChild(renameBtn);
    row.appendChild(info);
    row.appendChild(count);
    row.appendChild(delBtn);
    adminUnitListEl.appendChild(row);
  });
}

function openAdminScreen() {
  refreshUnitCatalog();
  buildAdminUnitList();
  renderAdminWordList();
  closeAllScreens();
  adminScreen.classList.remove("hidden");
}

function getModeByStatus(status) {
  if (status === 0) return "英文气球";
  if (status === 1) return "中文气球";
  if (status === 2) return "简单拼写";
  if (status === 3) return "普通拼写";
  return "完成";
}

function buildBalloonQuestion(word) {
  showBalloonStage();
  const isChineseBalloon = word.status === 1;
  const pool = selectedWords.filter((w) => w.chinese !== word.chinese);
  const wrongs = [];
  while (wrongs.length < 3 && pool.length) {
    const p = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
    wrongs.push(isChineseBalloon ? p.chinese : p.english);
  }

  const correct = isChineseBalloon ? word.chinese : word.english;
  const options = [correct, ...wrongs].sort(() => Math.random() - 0.5);
  const spacing = canvas.width / (options.length + 1);

  balloons = options.map((text, i) => ({
    text,
    isCorrect: text === correct,
    x: spacing * (i + 1),
    baseY: canvas.height * 0.52,
    y: canvas.height * 0.52,
    r: 93,
    phase: Math.random() * Math.PI * 2,
    popped: false,
    color: ["#ffd0d6", "#d4eeff", "#fff3b8", "#d5ffd9"][i % 4],
  }));

  promptTextEl.textContent = isChineseBalloon ? word.english : word.chinese;
  modeLabelEl.textContent = getModeByStatus(word.status);
  spellingPanel.classList.add("hidden");
}

function buildSpellingKeyboard() {
  keyboardEl.innerHTML = "";
  const rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  rows.forEach((rowText, rowIdx) => {
    const row = document.createElement("div");
    row.className = "keyboard-row";

    rowText.split("").forEach((ch) => {
      const k = document.createElement("button");
      k.className = "key";
      k.dataset.key = ch;
      k.textContent = ch;
      k.addEventListener("click", () => {
        k.classList.add("active");
        setTimeout(() => k.classList.remove("active"), 120);
        handleSpellingInput(ch);
      });
      row.appendChild(k);
    });

    keyboardEl.appendChild(row);
  });

  const row4 = document.createElement("div");
  row4.className = "keyboard-row";
  const space = document.createElement("button");
  space.className = "key space";
  space.dataset.key = " ";
  space.textContent = "SPACE";
  space.addEventListener("click", () => handleSpellingInput(" "));
  row4.appendChild(space);
  keyboardEl.appendChild(row4);
}

function renderSpellingWord() {
  const chars = currentWord.english.split("");
  spellingWordEl.innerHTML = "";
  chars.forEach((ch, idx) => {
    const token = document.createElement("span");
    if (spelledMap[idx]) {
      token.textContent = ch === " " ? "_" : spelledMap[idx];
      if (ch === " ") token.className = "spelling-space-char";
    } else {
      token.textContent = "_";
    }
    spellingWordEl.appendChild(token);
    if (idx < chars.length - 1) {
      spellingWordEl.appendChild(document.createTextNode(" "));
    }
  });
}

function buildSpellingQuestion(word) {
  chooseSpellingChallenge();
  showRoadStage();
  modeLabelEl.textContent = getModeByStatus(word.status);
  promptTextEl.textContent = word.chinese;
  spellingPanel.classList.remove("hidden");
  balloons = [];
  spellingIndex = 0;
  spelledMap = {};
  resetSpellingScene();
  renderSpellingWord();
  updateKeyboardHintHighlight();
}

function nextQuestion() {
  clearFeedback();
  questionLocked = false;
  hideWrongAnswerOverlay();
  updateKeyboardHintHighlight();
  if (feedbackTimer) {
    clearTimeout(feedbackTimer);
    feedbackTimer = null;
  }

  const pending = selectedWords.filter((w) => w.status < 4);
  updateModeProgressUi();
  if (!pending.length) {
    currentWord = null;
    showBalloonStage();
    promptTextEl.textContent = "太棒啦，你完成全部单词！";
    modeLabelEl.textContent = "完成";
    spellingPanel.classList.add("hidden");
    balloons = [];
    resetSpellingScene();
    if (currentRunMode === "review" && !reviewCompletionRecorded) {
      reviewCompletionRecorded = true;
      reviewCountsByUnit[selectedUnit] = reviewCountForUnit(selectedUnit) + 1;
      reviewCountTextEl.textContent = `复习模式完成次数: ${reviewCountForUnit(selectedUnit)}`;
      alert(`复习模式完成次数 +1，当前: ${reviewCountForUnit(selectedUnit)}`);
    }
    saveLocalState();
    scheduleSync();
    soundGood();
    return;
  }

  let stageWords = pending.filter((w) => w.status === 0);
  if (!stageWords.length) stageWords = pending.filter((w) => w.status === 1);
  if (!stageWords.length) stageWords = pending.filter((w) => w.status === 2);
  if (!stageWords.length) stageWords = pending.filter((w) => w.status === 3);

  currentWord = randomPick(stageWords);
  if (currentWord.status <= 1) buildBalloonQuestion(currentWord);
  else buildSpellingQuestion(currentWord);
}

function spawnPopParticles(x, y, color) {
  for (let i = 0; i < 58; i += 1) {
    const angle = (Math.PI * 2 * i) / 58;
    const speed = 3 + Math.random() * 6;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 46,
      color,
      size: 4 + Math.random() * 5,
    });
  }
}

function spawnExplosionWave(x, y, color) {
  explosions.push({ x, y, radius: 6, life: 20, color, grow: 7, width: 5 });
  explosions.push({ x, y, radius: 14, life: 16, color, grow: 8, width: 3 });
}

function applyCorrectForBalloon(picked) {
  if (!currentWord) return;
  currentWord.status = Math.min(4, currentWord.status + 1);
  currentWord.score = STATUS_SCORE_MAP[currentWord.status];
  sessionScore += 10;
  spawnPopParticles(picked.x, picked.y, picked.color);
  spawnExplosionWave(picked.x, picked.y, "#ffffff");
  updateScoreUi();
  updateModeProgressUi();
  saveLocalState();
  scheduleSync();
  showFeedback("✓ 正确 +10", true);
  soundGood();
  lockAndNext();
}

function lockAndNext(delay = 1300) {
  questionLocked = true;
  feedbackTimer = setTimeout(() => nextQuestion(), delay);
}

function handleBalloonClick(mx, my) {
  if (questionLocked || !currentWord) return;
  const picked = balloons.find((b) => !b.popped && (mx - b.x) ** 2 + (my - b.y) ** 2 <= b.r ** 2);
  if (!picked) return;
  speakEnglish(getEnglishForBalloonChoice(picked.text));
  picked.popped = true;
  soundBalloonBurst();
  spawnPopParticles(picked.x, picked.y, picked.isCorrect ? picked.color : "#ff8f8f");
  spawnExplosionWave(picked.x, picked.y, picked.isCorrect ? "#ffffff" : "#ffd6d6");
  if (picked.isCorrect) {
    applyCorrectForBalloon(picked);
  } else {
    showFeedback("✗ 答错了，请看中英文答案", false);
    soundBad();
    showWrongAnswerOverlay(currentWord);
  }
}

function handleSpellingInput(ch) {
  if (questionLocked || !currentWord) return;
  const word = currentWord.english;
  if (spellingIndex >= word.length) return;

  const expected = word[spellingIndex].toUpperCase();
  if (ch.toUpperCase() === expected) {
    spelledMap[spellingIndex] = word[spellingIndex];
    spellingIndex += 1;
    renderSpellingWord();
    updateKeyboardHintHighlight();
    soundPop();

    if (spellingIndex === word.length) {
      questionLocked = true;
      if (currentWord.status === 2) {
        currentWord.status = 3;
        currentWord.score = STATUS_SCORE_MAP[3];
        sessionScore += 20;
        showFeedback("✓ 简单模式完成 +20", true);
      } else {
        sessionScore += 40;
        currentWord.hintActive = false;
        currentWord.status = 4;
        currentWord.score = STATUS_SCORE_MAP[4];
        awardWordCompletionRewards(currentWord);
        showFeedback("✓ 拼写完美 +40", true);
      }
      updateScoreUi();
      updateModeProgressUi();
      saveLocalState();
      scheduleSync();
      speakCurrentWordEnglish();
      soundGood();
      playSpellingSceneResult(true, () => lockAndNext(50));
    }
  } else if (currentWord.status === 2) {
    questionLocked = true;
    showFeedback(`撞上障碍了，拼写错误，请看中英文答案后从字母 ${word[spellingIndex]} 继续`, false);
    soundBad();
    playSpellingSceneResult(false, () => {
      updateKeyboardHintHighlight();
      showWrongAnswerOverlay(currentWord, () => {
        clearFeedback();
        questionLocked = false;
        updateKeyboardHintHighlight();
      });
      speakCurrentWordEnglish();
    });
  } else {
    questionLocked = true;
    currentWord.hintActive = false;
    clearFeedback();
    soundBad();
    playSpellingSceneResult(false, () => {
      updateKeyboardHintHighlight();
      saveLocalState();
      scheduleSync();
      showWrongAnswerOverlay(currentWord);
    });
  }
}

function drawBackground() {
  const grd = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grd.addColorStop(0, "#bde9ff");
  grd.addColorStop(0.5, "#dff4ff");
  grd.addColorStop(1, "#e8ffe3");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ffe27d";
  ctx.beginPath();
  ctx.arc(canvas.width - 90, 85, 44, 0, Math.PI * 2);
  ctx.fill();
}

function drawClouds() {
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  clouds.forEach((cloud) => {
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.r, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.r * 0.8, cloud.y - 8, cloud.r * 0.7, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.r * 1.55, cloud.y, cloud.r * 0.9, 0, Math.PI * 2);
    ctx.fill();

    cloud.x += cloud.speed;
    if (cloud.x > canvas.width + 80) cloud.x = -120;
  });
}

function drawBalloon(b, time) {
  if (b.popped) return;
  const bob = Math.sin(time / 650 + b.phase) * 10;
  b.y = b.baseY + bob;

  ctx.fillStyle = "rgba(50,70,90,0.15)";
  ctx.beginPath();
  ctx.ellipse(b.x, b.y + b.r + 20, b.r * 0.55, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = b.color;
  ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.arc(b.x - b.r * 0.3, b.y - b.r * 0.38, b.r * 0.23, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.strokeStyle = "#3a4d66";
  ctx.lineWidth = 3;
  ctx.moveTo(b.x, b.y + b.r);
  ctx.lineTo(b.x, b.y + b.r + 34);
  ctx.stroke();

  ctx.fillStyle = "#1d2f4a";
  ctx.font = "bold 36px Microsoft YaHei";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(b.text, b.x, b.y);
}

function drawParticles() {
  particles = particles.filter((p) => p.life > 0);
  particles.forEach((p) => {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.06;
    p.life -= 1;
    ctx.globalAlpha = Math.max(0, p.life / 46);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  });
}

function drawExplosions() {
  explosions = explosions.filter((e) => e.life > 0);
  explosions.forEach((e) => {
    e.radius += e.grow;
    e.life -= 1;
    ctx.globalAlpha = Math.max(0, e.life / 20);
    ctx.strokeStyle = e.color;
    ctx.lineWidth = e.width;
    ctx.beginPath();
    ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  });
}

function drawCrosshair() {
  if (!isMouseInCanvas || gameScreen.classList.contains("hidden")) return;
  ctx.strokeStyle = "#ff4d4d";
  ctx.lineWidth = 3;
  const size = 36;
  ctx.beginPath();
  ctx.moveTo(mouseCanvasX - size, mouseCanvasY);
  ctx.lineTo(mouseCanvasX + size, mouseCanvasY);
  ctx.moveTo(mouseCanvasX, mouseCanvasY - size);
  ctx.lineTo(mouseCanvasX, mouseCanvasY + size);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(mouseCanvasX, mouseCanvasY, 16, 0, Math.PI * 2);
  ctx.stroke();
}

function drawFrame(ts) {
  drawBackground();
  drawClouds();
  balloons.forEach((b) => drawBalloon(b, ts));
  drawParticles();
  drawExplosions();
  drawCrosshair();

  requestAnimationFrame(drawFrame);
}

async function syncToServer() {
  try {
    const payload = {
      words: allWords.map((w) => ({ chinese: w.chinese, status: w.status })),
      meta: {
        cumulativeScore,
        silverCoins: cumulativeScore,
        goldCoins,
        goldEarnedWords: Array.from(goldAwardedWords),
        ownedVehicleIds: Array.from(ownedVehicleIds),
        equippedVehicleId,
        ownedEffectIds: Array.from(ownedEffectIds),
        equippedEffectId,
        reviewCounts: reviewCountsByUnit,
        units: unitCatalog,
      },
    };
    const res = await fetch("/api/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("sync failed");
    const data = await res.json();
    if (Array.isArray(data.words) && data.words.length) {
      const map = new Map(data.words.map((w) => [w.chinese, w]));
      allWords.forEach((w) => {
        const serverW = map.get(w.chinese);
        if (!serverW) return;
        w.status = serverW.status;
        w.score = serverW.score;
      });
      applyCurrencyFromPayload(data, allWords);
      applyMarketFromPayload(data);
      reviewCountsByUnit = data.reviewCounts && typeof data.reviewCounts === "object" ? data.reviewCounts : reviewCountsByUnit;
      unitCatalog = Array.isArray(data.units) ? data.units : unitCatalog;
      updateScoreUi();
      setSyncState("已同步", true);
    }
  } catch (error) {
    console.warn(error);
    setSyncState("同步失败", false);
  }
}

function scheduleSync() {
  setSyncState("同步中...", null);
  if (syncTimer) clearTimeout(syncTimer);
  syncTimer = setTimeout(() => syncToServer(), 500);
}


function bootstrapApp() {
  canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;
    mouseCanvasX = mx;
    mouseCanvasY = my;
    handleBalloonClick(mx, my);
  });

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseCanvasX = (e.clientX - rect.left) * scaleX;
    mouseCanvasY = (e.clientY - rect.top) * scaleY;
  });

  canvas.addEventListener("mouseenter", () => {
    isMouseInCanvas = true;
  });

  canvas.addEventListener("mouseleave", () => {
    isMouseInCanvas = false;
  });

  window.addEventListener("keydown", (e) => {
    if (gameScreen.classList.contains("hidden")) return;
    if (waitingManualContinue && e.code === "Space") {
      e.preventDefault();
      continueAfterWrong();
      return;
    }
    if (!currentWord || currentWord.status < 2) return;
    const key = e.key === " " ? " " : e.key.length === 1 ? e.key.toUpperCase() : "";
    if (!key) return;
    e.preventDefault();
    handleSpellingInput(key);
  });

  backBtn.addEventListener("click", () => {
    openHomeScreen();
    clearFeedback();
    isMouseInCanvas = false;
    hideWrongAnswerOverlay();
  });

  manageBackBtn.addEventListener("click", () => {
    openHomeScreen();
  });

  openAdminBtn.addEventListener("click", () => {
    openAdminScreen();
  });

  openMarketBtn.addEventListener("click", () => {
    openMarketScreen();
  });

  adminBackBtn.addEventListener("click", () => {
    openHomeScreen();
  });

  marketBackBtn.addEventListener("click", () => {
    openHomeScreen();
  });

  addUnitBtn.addEventListener("click", async () => {
    const unit = newUnitInput.value.trim();
    if (!unit) {
      alert("请输入单元名");
      return;
    }
    if (getAllUnits().includes(unit)) {
      alert("该单元已存在");
      return;
    }
    unitCatalog.push(unit);
    adminSelectedUnit = unit;
    newUnitInput.value = "";
    try {
      await saveAdminChanges();
      buildAdminUnitList();
      renderAdminWordList();
    } catch (error) {
      console.warn(error);
      alert("新增单元失败，请重试");
    }
  });

  addWordBtn.addEventListener("click", async () => {
    if (!adminSelectedUnit) {
      alert("请先选择单元");
      return;
    }
    const chinese = newWordCnInput.value.trim();
    const english = newWordEnInput.value.trim();
    if (!chinese) {
      alert("中文不能为空");
      return;
    }
    if (allWords.some((w) => w.chinese === chinese)) {
      alert("中文词条已存在，不能重复");
      return;
    }
    allWords.push({
      chinese,
      english,
      unit: adminSelectedUnit,
      status: 0,
      score: STATUS_SCORE_MAP[0],
      hintActive: false,
    });
    newWordCnInput.value = "";
    newWordEnInput.value = "";
    try {
      await saveAdminChanges();
      buildAdminUnitList();
      renderAdminWordList();
    } catch (error) {
      console.warn(error);
      alert("新增单词失败，请重试");
    }
  });

  batchSetStatusBtn.addEventListener("click", async () => {
    if (!adminSelectedUnit) {
      alert("请先选择单元");
      return;
    }
    const targetStatus = Math.max(0, Math.min(4, Number.parseInt(batchStatusSelectEl.value, 10) || 0));
    const list = adminGetSelectedWords();
    if (!list.length) {
      alert("该单元暂无单词");
      return;
    }

    let changedCount = 0;
    list.forEach((w) => {
      if (w.status === targetStatus) return;
      w.status = targetStatus;
      w.hintActive = false;
      w.score = STATUS_SCORE_MAP[targetStatus];
      changedCount += 1;
    });

    if (!changedCount) {
      alert(`当前单元全部单词已是进度${targetStatus}`);
      return;
    }

    try {
      await saveAdminChanges();
      buildAdminUnitList();
      renderAdminWordList();
      alert(`已将 ${changedCount} 个单词一键设置为进度${targetStatus}`);
    } catch (error) {
      console.warn(error);
      alert("批量设置失败，请重试");
    }
  });

  startLearnBtn.addEventListener("click", () => {
    const words = getWordsByUnit(selectedUnit);
    const allDone = words.length > 0 && words.every((w) => w.status >= 4);
    startGameByUnit(selectedUnit, allDone ? "review" : "normal");
  });

  startReviewBtn.addEventListener("click", () => {
    startGameByUnit(selectedUnit, "review");
  });

  continueBtn.addEventListener("click", () => {
    continueAfterWrong();
  });

  soundBtn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = `音效: ${soundEnabled ? "开" : "关"}`;
    if (soundEnabled) soundGood();
  });

  speechBtn.addEventListener("click", () => {
    speechEnabled = !speechEnabled;
    speechBtn.textContent = `读音: ${speechEnabled ? "开" : "关"}`;
    if (!speechEnabled) stopSpeech();
  });

  speakWordBtn.addEventListener("click", () => {
    if (speakWordBtnPlaying) return;
    speakCurrentWordEnglish({ withButtonEffect: true });
  });

  importBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const parsed = parseCsv(text);
    if (!parsed.length) {
      alert("CSV 解析失败");
      return;
    }
    allWords = parsed;
    initCurrencyFromWords(allWords);
    reviewCountsByUnit = {};
    unitCatalog = Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b));
    saveLocalState();
    buildUnitButtons();
    updateScoreUi();
    scheduleSync();
    alert("导入成功");
    fileInput.value = "";
  });

  exportBtn.addEventListener("click", () => {
    if (!allWords.length) {
      alert("暂无数据可导出");
      return;
    }
    const blob = new Blob([toCsv(allWords)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "words_web_export.csv";
    a.click();
    URL.revokeObjectURL(url);
  });

  async function loadInitialData() {
    try {
      const res = await fetch("/api/words", { cache: "no-store" });
      if (!res.ok) throw new Error("api unavailable");
      const data = await res.json();
      allWords = (data.words || []).map((w) => ({ ...w, hintActive: false }));
      applyCurrencyFromPayload(data, allWords);
      applyMarketFromPayload(data);
      reviewCountsByUnit = data.reviewCounts && typeof data.reviewCounts === "object" ? data.reviewCounts : {};
      unitCatalog = Array.isArray(data.units) ? data.units : Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b));
      applyLocalState();
      const scoreChanged = recalcScoresFromStatus(allWords);
      buildUnitButtons();
      updateScoreUi();
      updateModeProgressUi();
      setSyncState("已同步", true);
      if (scoreChanged) scheduleSync();
    } catch (error) {
      setSyncState("离线模式", false);
      try {
        const localRes = await fetch("words.csv", { cache: "no-store" });
        if (!localRes.ok) throw new Error("words.csv unavailable");
        const text = await localRes.text();
        allWords = parseCsv(text);
        initCurrencyFromWords(allWords);
        applyMarketFromPayload(null);
        reviewCountsByUnit = {};
        unitCatalog = Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b));
        applyLocalState();
        recalcScoresFromStatus(allWords);
        buildUnitButtons();
        updateScoreUi();
        updateModeProgressUi();
        alert("已进入离线模式，运行 server.py 可启用自动同步。\n现在也可以先玩。");
      } catch (error2) {
        console.warn(error, error2);
        alert("无法加载词库，请点击“导入 CSV”选择 web_client 目录内的 words.csv。");
      }
    }
  }

  function initClouds() {
    clouds = [
      { x: 60, y: 90, r: 22, speed: 0.22 },
      { x: 320, y: 130, r: 18, speed: 0.16 },
      { x: 730, y: 100, r: 26, speed: 0.2 },
    ];
  }

  buildSpellingKeyboard();
  initClouds();
  if ("speechSynthesis" in window) {
    resolvePreferredSpeechVoice();
    window.speechSynthesis.onvoiceschanged = () => resolvePreferredSpeechVoice();
  }
  loadInitialData();
  requestAnimationFrame(drawFrame);
}

window.bootstrapApp = bootstrapApp;
