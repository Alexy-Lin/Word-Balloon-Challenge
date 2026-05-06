// ============================================================
// app.core.js — 核心模块：常量、状态、DOM 引用、工具函数
// 子模块：app.market.js / app.admin.js / app.game.js
// ============================================================

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

const homeSilverEl = document.getElementById("homeSilverCoins");
const homeGoldEl = document.getElementById("homeGoldCoins");
const homeTotalWordsEl = document.getElementById("homeTotalWords");
const homeStageEls = [0,1,2,3,4].map((s) => document.getElementById("homeStage" + s));

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
  { key: "barrier", label: "前方是大路障，拼对单词撞开它", obstacleText: "路障", successFx: "撞开", failFx: "爆炸" },
  { key: "cliff",   label: "前方是悬崖，拼对单词飞跃过去", obstacleText: "悬崖", successFx: "飞跃", failFx: "坠落" },
  { key: "rock",    label: "前方滚来巨石，拼对单词把它顶飞", obstacleText: "巨石", successFx: "顶飞", failFx: "爆炸" },
  { key: "water",   label: "前方是大水坑，拼对单词跳过去", obstacleText: "水坑", successFx: "跳过", failFx: "翻车" },
  { key: "bridge",  label: "前方断桥了，拼对单词冲过去", obstacleText: "断桥", successFx: "冲过", failFx: "掉落" },
  { key: "cones",   label: "前方锥桶阵挡路，拼对单词冲散它", obstacleText: "锥桶阵", successFx: "冲散", failFx: "爆炸" },
];

const WORD_COMPLETE_REWARD = STATUS_SCORE_MAP[4];
const VEHICLE_CATALOG = [
  { id: "default_bugatti", name: "默认车型",     style: "default",   preview: "免费",       desc: "初始可用，速度稳定。",                     price: 2000 },
  { id: "rusty_oldtimer",  name: "破旧老爷车",   style: "oldtimer",  preview: "老爷车",     desc: "老旧但有情怀，适合刚起步。",               price: 2000 },
  { id: "heavy_bulldozer", name: "重型推土机",   style: "bulldozer", preview: "推土机",     desc: "专属造型，履带碾压一切障碍。",             price: 2000 },
  { id: "family_car",      name: "普通家用车",   style: "family",    preview: "家用车",     desc: "舒适耐用，稳定推进学习。",                 price: 2000 },
  { id: "city_taxi",       name: "城市出租车",   style: "taxi",      preview: "出租车",     desc: "黄黑涂装，街头感拉满。",                   price: 2000 },
  { id: "business_sedan",  name: "商务轿车",     style: "sedan",     preview: "轿车",       desc: "线条流畅，质感升级。",                     price: 2000 },
  { id: "patrol_police",   name: "警车",         style: "police",    preview: "警车",       desc: "蓝红警示，气势十足。",                     price: 2000 },
  { id: "rescue_firetruck",name: "消防车",       style: "fire",      preview: "消防车",     desc: "救援风格，厚重可靠。",                     price: 2000 },
  { id: "track_supercar",  name: "赛道跑车",     style: "supercar",  preview: "跑车",       desc: "高性能涂装，压迫感强。",                   price: 2000 },
  { id: "steel_tank",      name: "装甲坦克",     style: "tank",      preview: "坦克",       desc: "重装甲风格，冲撞感最强。",                 price: 2000 },
  { id: "cyber_truck",     name: "赛博皮卡",     style: "truck",     preview: "皮卡",       desc: "几何切割造型，未来感爆棚。",               price: 2000 },
  { id: "swat_armor",      name: "特警装甲车",   style: "swat",      preview: "特警车",     desc: "重装防爆，红蓝警灯威慑全场。",             price: 2000 },
  { id: "gold_bugatti",    name: "黄金布加迪",   style: "gold",      preview: "黄金布加迪", desc: "顶级收藏，金光闪耀。",                     price: 120000 },
];

const EFFECT_CATALOG = [
  { id: "effect_default",  name: "默认特效", style: "default",  preview: "基础", desc: "免费基础效果。",               price: 0 },
  { id: "effect_neon",     name: "霓虹尾迹", style: "neon",     preview: "尾迹", desc: "车后拖出霓虹轨迹，视觉更炫。", price: 8000 },
  { id: "effect_flame",    name: "烈焰喷射", style: "flame",    preview: "火焰", desc: "尾部喷射火焰，冲刺感更强。",   price: 20000 },
  { id: "effect_thunder",  name: "雷霆电流", style: "thunder",  preview: "电流", desc: "车身带电流闪烁，顶级压迫感。", price: 40000 },
];

function setSyncState(text, isOk) {
  syncStateEl.textContent = text;
  syncStateEl.className = isOk === null ? "" : isOk ? "ok" : "bad";
}

function ensureAudio() {
  if (!audioCtx) { const Ctx = window.AudioContext || window.webkitAudioContext; if (Ctx) audioCtx = new Ctx(); }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playTone(freq, durationMs, type = "sine", gainValue = 0.05) {
  if (!soundEnabled) return;
  ensureAudio(); if (!audioCtx) return;
  const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq; gain.gain.value = gainValue;
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + durationMs / 1000);
}

function soundPop() { playTone(560, 110, "triangle", 0.06); }

function playNoiseBurst(durationMs = 70, gainValue = 0.16) {
  if (!soundEnabled) return; ensureAudio(); if (!audioCtx) return;
  const bufferSize = Math.max(1, Math.floor((audioCtx.sampleRate * durationMs) / 1000));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i += 1) { data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize); }
  const source = audioCtx.createBufferSource(); const gain = audioCtx.createGain();
  source.buffer = buffer; gain.gain.value = gainValue;
  source.connect(gain); gain.connect(audioCtx.destination); source.start();
}

function soundBalloonBurst() { playNoiseBurst(70, 0.15); playTone(150, 50, "square", 0.05); }
function soundGood() { playTone(440, 100, "triangle", 0.06); setTimeout(() => playTone(660, 130, "triangle", 0.05), 80); }
function soundBad() { playTone(280, 160, "square", 0.04); }

function soundCrashExplosion() {
  if (!soundEnabled) return; ensureAudio(); if (!audioCtx) return;
  const noiseLen = 0.18;
  const noiseBufSize = Math.max(1, Math.floor(audioCtx.sampleRate * noiseLen));
  const noiseBuf = audioCtx.createBuffer(1, noiseBufSize, audioCtx.sampleRate);
  const noiseData = noiseBuf.getChannelData(0);
  for (let i = 0; i < noiseBufSize; i += 1) { noiseData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / noiseBufSize, 1.6); }
  const noiseSrc = audioCtx.createBufferSource(); const noiseGain = audioCtx.createGain();
  noiseSrc.buffer = noiseBuf; noiseGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
  noiseSrc.connect(noiseGain); noiseGain.connect(audioCtx.destination); noiseSrc.start();
  const bassOsc = audioCtx.createOscillator(); const bassGain = audioCtx.createGain();
  bassOsc.type = "sine"; bassOsc.frequency.setValueAtTime(55, audioCtx.currentTime);
  bassOsc.frequency.exponentialRampToValueAtTime(22, audioCtx.currentTime + 0.35);
  bassGain.gain.setValueAtTime(0.25, audioCtx.currentTime);
  bassGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  bassOsc.connect(bassGain); bassGain.connect(audioCtx.destination); bassOsc.start(); bassOsc.stop(audioCtx.currentTime + 0.4);
  const midOsc = audioCtx.createOscillator(); const midGain = audioCtx.createGain();
  midOsc.type = "sawtooth"; midOsc.frequency.setValueAtTime(140, audioCtx.currentTime);
  midOsc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.28);
  midGain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  midGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
  midOsc.connect(midGain); midGain.connect(audioCtx.destination); midOsc.start(); midOsc.stop(audioCtx.currentTime + 0.3);
  setTimeout(() => { if (!audioCtx) return;
    const tailBufSize = Math.max(1, Math.floor(audioCtx.sampleRate * 0.14));
    const tailBuf = audioCtx.createBuffer(1, tailBufSize, audioCtx.sampleRate);
    const tailData = tailBuf.getChannelData(0);
    for (let i = 0; i < tailBufSize; i += 1) { tailData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / tailBufSize, 2); }
    const tailSrc = audioCtx.createBufferSource(); const tailGain = audioCtx.createGain();
    tailSrc.buffer = tailBuf; tailGain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    tailGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
    tailSrc.connect(tailGain); tailGain.connect(audioCtx.destination); tailSrc.start();
  }, 60);
  setTimeout(() => { if (!audioCtx) return;
    const subOsc = audioCtx.createOscillator(); const subGain = audioCtx.createGain();
    subOsc.type = "sine"; subOsc.frequency.value = 28;
    subGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    subGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.55);
    subOsc.connect(subGain); subGain.connect(audioCtx.destination); subOsc.start(); subOsc.stop(audioCtx.currentTime + 0.55);
  }, 90);
}

function triggerCrashExplosion(isHeavy = false) {
  if (!roadCrashExplosionEl) return;
  roadCrashExplosionEl.classList.remove("active", "heavy"); void roadCrashExplosionEl.offsetWidth;
  if (isHeavy) roadCrashExplosionEl.classList.add("heavy");
  roadCrashExplosionEl.classList.add("active");
  if (roadSceneEl) { roadSceneEl.classList.remove("shaking"); void roadSceneEl.offsetWidth; roadSceneEl.classList.add("shaking"); }
  soundCrashExplosion();
}

function resolvePreferredSpeechVoice() {
  if (!("speechSynthesis" in window)) return;
  const voices = window.speechSynthesis.getVoices() || []; if (!voices.length) return;
  preferredSpeechVoice = voices.find((v) => String(v.lang || "").toLowerCase() === "en-us")
    || voices.find((v) => String(v.lang || "").toLowerCase().startsWith("en-us"))
    || voices.find((v) => String(v.lang || "").toLowerCase().startsWith("en")) || null;
}

function stopSpeech() { if (!("speechSynthesis" in window)) return; window.speechSynthesis.cancel(); setSpeakWordButtonPlaying(false); }

function setSpeakWordButtonPlaying(isPlaying) {
  if (!speakWordBtn) return; speakWordBtnPlaying = !!isPlaying;
  speakWordBtn.classList.toggle("is-speaking", speakWordBtnPlaying);
  speakWordBtn.disabled = speakWordBtnPlaying;
  speakWordBtn.textContent = speakWordBtnPlaying ? "播放中..." : speakWordBtnDefaultText;
}

function speakEnglish(text, options = {}) {
  const withButtonEffect = !!options.withButtonEffect;
  if (!speechEnabled) return; if (!("speechSynthesis" in window)) return;
  const normalized = String(text || "").trim(); if (!normalized) return;
  resolvePreferredSpeechVoice();
  if (withButtonEffect) setSpeakWordButtonPlaying(true);
  stopSpeech(); if (withButtonEffect) setSpeakWordButtonPlaying(true);
  const utterance = new SpeechSynthesisUtterance(normalized);
  utterance.lang = "en-US"; utterance.rate = 0.92; utterance.pitch = 1;
  if (preferredSpeechVoice) utterance.voice = preferredSpeechVoice;
  if (withButtonEffect) { utterance.onend = () => setSpeakWordButtonPlaying(false); utterance.onerror = () => setSpeakWordButtonPlaying(false); }
  window.speechSynthesis.speak(utterance);
}

function speakCurrentWordEnglish(options = {}) { if (!currentWord) return; speakEnglish(currentWord.english, options); }
function showBalloonStage() { canvas.classList.remove("hidden"); roadSceneEl.classList.add("hidden"); }
function showRoadStage() { canvas.classList.add("hidden"); roadSceneEl.classList.remove("hidden"); }

function clearSpellingSceneTimer() { if (!spellingSceneTimer) return; clearTimeout(spellingSceneTimer); spellingSceneTimer = null; }
function chooseSpellingChallenge() { currentSpellingChallenge = randomPick(SPELLING_CHALLENGES); }

function resetSpellingScene() {
  clearSpellingSceneTimer();
  const isHidden = roadSceneEl.classList.contains("hidden");
  roadSceneEl.className = `road-scene challenge-${currentSpellingChallenge?.key || "barrier"}${isHidden ? " hidden" : ""}`;
  roadObstacleEl.textContent = currentSpellingChallenge?.obstacleText || "路障";
  roadFxEl.textContent = "";
  if (roadCrashExplosionEl) roadCrashExplosionEl.classList.remove("active", "heavy");
  roadGapEl.classList.remove("hidden"); roadWaterEl.classList.remove("hidden");
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
  const sceneDurationMs = success ? (isGapChallenge ? 2450 : 1650) : (isGapChallenge ? 1450 : 1200);
  if (isCrashChallenge) { triggerCrashExplosion(!success); }
  if (success) { const rc = document.getElementById("roadCar"); if (rc) rc.classList.add("driving"); }
  spellingSceneTimer = setTimeout(() => {
    spellingSceneTimer = null;
    if (roadCrashExplosionEl) roadCrashExplosionEl.classList.remove("active", "heavy");
    if (roadSceneEl) roadSceneEl.classList.remove("shaking");
    if (success) { const rc = document.getElementById("roadCar"); if (rc) rc.classList.remove("driving"); }
    if (onDone) onDone();
  }, sceneDurationMs);
}

function getEnglishForBalloonChoice(pickedText) {
  if (!currentWord) return "";
  if (currentWord.status === 0) return pickedText;
  if (currentWord.status === 1) { const found = selectedWords.find((w) => w.chinese === pickedText); return found ? found.english : ""; }
  return "";
}

function parseCsvLine(line) {
  const result = []; let cur = ""; let inQuote = false;
  for (let i = 0; i < line.length; i += 1) { const ch = line[i];
    if (ch === '"') { if (inQuote && line[i + 1] === '"') { cur += '"'; i += 1; } else { inQuote = !inQuote; } }
    else if (ch === "," && !inQuote) { result.push(cur); cur = ""; } else { cur += ch; }
  } result.push(cur); return result;
}

function parseCsv(text) {
  const lines = text.replace(/\r/g, "").split("\n").filter(Boolean); if (!lines.length) return [];
  const header = parseCsvLine(lines[0]).map((x) => x.replace(/^﻿/, "").trim().toLowerCase());
  const col = { chinese: header.indexOf("中文"), english: header.indexOf("英文"), unit: header.indexOf("unit"), status: header.indexOf("status") };
  return lines.slice(1).map((line) => { const row = parseCsvLine(line); const chinese = (row[col.chinese] || "").trim();
    const norm = chinese.toLowerCase().replace(/\s+/g, ""); if (!chinese || norm === "totalscore" || norm === "totlascore") return null;
    const statusNum = Math.max(0, Math.min(4, Number.parseInt(row[col.status] || "0", 10) || 0));
    return { chinese, english: (row[col.english] || "").trim(), unit: (row[col.unit] || "默认单元").trim() || "默认单元", status: statusNum, score: STATUS_SCORE_MAP[statusNum], hintActive: false };
  }).filter(Boolean);
}

function csvEscape(value) { const v = String(value ?? ""); if (v.includes(",") || v.includes('"') || v.includes("\n")) return `"${v.replace(/"/g, '""')}"`; return v; }
function toCsv(words) { const header = ["中文", "英文", "unit", "status", "score"]; const rows = words.map((w) => [w.chinese, w.english, w.unit, w.status, STATUS_SCORE_MAP[w.status]]); const total = rows.reduce((acc, r) => acc + Number(r[4]), 0); rows.push(["total score", "", "", "", total]); return [header, ...rows].map((r) => r.map(csvEscape).join(",")).join("\n") + "\n"; }

function saveLocalState() { const state = allWords.map((w) => ({ chinese: w.chinese, status: w.status, hintActive: !!w.hintActive })); localStorage.setItem(STORE_KEY, JSON.stringify(state)); }

function applyLocalState() { const raw = localStorage.getItem(STORE_KEY); if (!raw) return; try { const state = JSON.parse(raw); const map = new Map(state.map((x) => [x.chinese, x])); allWords.forEach((w) => { const s = map.get(w.chinese); if (!s) return; w.status = Math.max(0, Math.min(4, Number(s.status) || 0)); w.hintActive = !!s.hintActive; w.score = STATUS_SCORE_MAP[w.status]; }); } catch (error) { console.warn("localStorage 数据损坏", error); } }

function recalcScoresFromStatus(words) { let changed = false; words.forEach((w) => { const nextScore = STATUS_SCORE_MAP[w.status] ?? 0; if (w.score !== nextScore) changed = true; w.score = nextScore; }); return changed; }
function normalizeWordKey(value) { return String(value || "").trim(); }
function getCompletedWordKeys(words) { return words.filter((w) => w.status >= 4).map((w) => normalizeWordKey(w.chinese)).filter(Boolean); }

function initCurrencyFromWords(words) { cumulativeScore = words.reduce((sum, w) => sum + (STATUS_SCORE_MAP[w.status] || 0), 0); const completed = getCompletedWordKeys(words); goldCoins = completed.length * WORD_COMPLETE_REWARD; goldAwardedWords = new Set(completed); }

function applyCurrencyFromPayload(data, words = allWords) { const fallbackSilver = words.reduce((sum, w) => sum + (STATUS_SCORE_MAP[w.status] || 0), 0); const silverRaw = data ? (data.silverCoins ?? data.cumulativeScore ?? data.totalScore) : fallbackSilver; cumulativeScore = Math.max(0, Number.parseInt(silverRaw, 10) || fallbackSilver); const hasGoldData = !!data && (Object.prototype.hasOwnProperty.call(data, "goldCoins") || Object.prototype.hasOwnProperty.call(data, "goldEarnedWords")); if (!hasGoldData) { const completedFromWords = getCompletedWordKeys(words); goldCoins = completedFromWords.length * WORD_COMPLETE_REWARD; goldAwardedWords = new Set(completedFromWords); return; } const earnedWords = Array.isArray(data.goldEarnedWords) ? data.goldEarnedWords.map((x) => normalizeWordKey(x)).filter(Boolean) : []; goldAwardedWords = new Set(earnedWords); goldCoins = goldAwardedWords.size * WORD_COMPLETE_REWARD; }

function awardWordCompletionRewards(word) { const key = normalizeWordKey(word?.chinese); if (key && !goldAwardedWords.has(key)) { goldAwardedWords.add(key); goldCoins = goldAwardedWords.size * WORD_COMPLETE_REWARD; } }

function refreshGoldFromWords(words) { const completed = getCompletedWordKeys(words); let added = false; completed.forEach((key) => { if (!goldAwardedWords.has(key)) { goldAwardedWords.add(key); added = true; } }); if (added) { goldCoins = goldAwardedWords.size * WORD_COMPLETE_REWARD; scheduleSync(); } return added; }

function getVehicleById(id) { return VEHICLE_CATALOG.find((v) => v.id === id) || VEHICLE_CATALOG[0]; }
function getEffectById(id) { return EFFECT_CATALOG.find((v) => v.id === id) || EFFECT_CATALOG[0]; }

function filterOwnedIds(list, catalog, defaultId) { const owned = Array.isArray(list) ? list : []; const filtered = owned.map((x) => String(x || "").trim()).filter((x) => catalog.some((v) => v.id === x)); if (!filtered.includes(defaultId)) filtered.push(defaultId); return Array.from(new Set(filtered)); }

function saveLocalMarketState() { const payload = { ownedVehicleIds: Array.from(ownedVehicleIds), equippedVehicleId, ownedEffectIds: Array.from(ownedEffectIds), equippedEffectId }; localStorage.setItem(MARKET_STORE_KEY, JSON.stringify(payload)); }

function applyMarketState(state) { const owned = filterOwnedIds(state.ownedVehicleIds, VEHICLE_CATALOG, "default_bugatti"); ownedVehicleIds = new Set(owned); equippedVehicleId = ownedVehicleIds.has(String(state.equippedVehicleId || "").trim()) ? String(state.equippedVehicleId || "").trim() : "default_bugatti"; const ownedEffects = filterOwnedIds(state.ownedEffectIds, EFFECT_CATALOG, "effect_default"); ownedEffectIds = new Set(ownedEffects); equippedEffectId = ownedEffectIds.has(String(state.equippedEffectId || "").trim()) ? String(state.equippedEffectId || "").trim() : "effect_default"; saveLocalMarketState(); applyVehicleToScene(); }

function loadLocalMarketState() { const raw = localStorage.getItem(MARKET_STORE_KEY); if (!raw) return; try { applyMarketState(JSON.parse(raw)); } catch (error) { console.warn("market local state damaged", error); } }

function applyVehicleToScene() { if (!roadCarEl) return; const car = getVehicleById(equippedVehicleId); const effect = getEffectById(equippedEffectId); roadCarEl.dataset.vehicle = car.style; roadCarEl.dataset.effect = effect.style; if (roadCarBadgeEl) roadCarBadgeEl.textContent = `${car.name} · ${effect.name}`; }

function applyMarketFromPayload(data) { const hasRemote = !!data && (Object.prototype.hasOwnProperty.call(data, "ownedVehicleIds") || Object.prototype.hasOwnProperty.call(data, "equippedVehicleId")); if (!hasRemote) { loadLocalMarketState(); return; } applyMarketState(data); }

function updateScoreUi() { sessionScoreEl.textContent = String(sessionScore); totalScoreEl.textContent = String(cumulativeScore); if (goldCoinsEl) goldCoinsEl.textContent = String(goldCoins); if (marketWalletSilverEl) marketWalletSilverEl.textContent = String(cumulativeScore); if (marketWalletGoldEl) marketWalletGoldEl.textContent = String(goldCoins); }

function updateHomeStats() { if (homeSilverEl) homeSilverEl.textContent = String(cumulativeScore); if (homeGoldEl) homeGoldEl.textContent = String(goldCoins); if (homeTotalWordsEl) homeTotalWordsEl.textContent = String(allWords.length); const stageCounts = [0,0,0,0,0]; allWords.forEach((w) => { const s = Math.max(0, Math.min(4, w.status)); stageCounts[s] += 1; }); homeStageEls.forEach((el, i) => { if (el) el.textContent = String(stageCounts[i]); }); }

function updateModeProgressUi() { const total = selectedWords.length || 0; progressEnEl.textContent = `${selectedWords.filter((w) => w.status >= 1).length}/${total}`; progressCnEl.textContent = `${selectedWords.filter((w) => w.status >= 2).length}/${total}`; progressSimpleEl.textContent = `${selectedWords.filter((w) => w.status >= 3).length}/${total}`; progressNormalEl.textContent = `${selectedWords.filter((w) => w.status >= 4).length}/${total}`; }

function showFeedback(text, ok) { feedbackEl.textContent = text; feedbackEl.className = `feedback ${ok ? "ok" : "bad"}`; }
function clearFeedback() { feedbackEl.textContent = ""; feedbackEl.className = "feedback"; }
function updateKeyboardHintHighlight() { keyboardEl.querySelectorAll(".key.hint-next").forEach((btn) => btn.classList.remove("hint-next")); keyboardEl.classList.remove("hint-active"); }

function showWrongAnswerOverlay(word, onContinue) { if (!word) return; overlayChineseEl.textContent = word.chinese; overlayEnglishEl.textContent = word.english; wrongOverlayContinueHandler = typeof onContinue === "function" ? onContinue : null; answerOverlayEl.classList.remove("hidden"); waitingManualContinue = true; questionLocked = true; }
function hideWrongAnswerOverlay() { answerOverlayEl.classList.add("hidden"); waitingManualContinue = false; }

function continueAfterWrong() { if (!waitingManualContinue) return; const continueHandler = wrongOverlayContinueHandler; wrongOverlayContinueHandler = null; hideWrongAnswerOverlay(); if (continueHandler) { continueHandler(); return; } nextQuestion(); }

function randomPick(list) { return list[Math.floor(Math.random() * list.length)]; }

function getAllUnits() { const s = new Set(unitCatalog); allWords.forEach((w) => { if (w.unit) s.add(w.unit); }); return Array.from(s).sort((a, b) => a.localeCompare(b)); }

function buildUnitButtons() { unitList.innerHTML = ""; const map = new Map(); allWords.forEach((w) => map.set(w.unit, (map.get(w.unit) || 0) + 1)); const units = ["所有单元", ...getAllUnits()]; units.forEach((u) => { const btn = document.createElement("button"); btn.className = "unit-btn"; const count = u === "所有单元" ? allWords.length : map.get(u); btn.innerHTML = `${u}<small>${count} 个单词</small>`; btn.addEventListener("click", () => openUnitManage(u)); unitList.appendChild(btn); }); }

function getWordsByUnit(unit) { return unit === "所有单元" ? allWords : allWords.filter((w) => w.unit === unit); }

function closeAllScreens() { unitScreen.classList.add("hidden"); manageScreen.classList.add("hidden"); adminScreen.classList.add("hidden"); marketScreen.classList.add("hidden"); gameScreen.classList.add("hidden"); }

function openHomeScreen() { closeAllScreens(); unitScreen.classList.remove("hidden"); updateHomeStats(); }

function reviewCountForUnit(unit) { return Number(reviewCountsByUnit[unit] || 0); }

function buildManageWordList(words) { manageWordListEl.innerHTML = ""; if (!words.length) { const empty = document.createElement("p"); empty.textContent = "该单元暂无单词"; manageWordListEl.appendChild(empty); return; } words.forEach((w) => { const row = document.createElement("div"); row.className = "manage-word-row"; row.innerHTML = `<span class="word-cn">${w.chinese}</span><span class="word-en">${w.english || "-"}</span><span class="word-status">进度 ${w.status}/4</span>`; manageWordListEl.appendChild(row); }); }

function openUnitManage(unit) { selectedUnit = unit; const words = getWordsByUnit(unit); const done = words.filter((w) => w.status >= 4).length; const allDone = words.length > 0 && done === words.length; manageTitleEl.textContent = `单元管理: ${unit}`; manageSummaryEl.textContent = `完成进度: ${done}/${words.length}`; reviewCountTextEl.textContent = `复习模式完成次数: ${reviewCountForUnit(unit)}`; startReviewBtn.disabled = !allDone; startLearnBtn.disabled = words.length === 0; startLearnBtn.textContent = allDone ? "开始学习（自动复习）" : "开始学习"; buildManageWordList(words); closeAllScreens(); manageScreen.classList.remove("hidden"); }

function resetWordsForReview(words) { words.forEach((w) => { w.status = 0; w.hintActive = false; w.score = STATUS_SCORE_MAP[0]; }); }

function startGameByUnit(unit, mode = "normal") { selectedWords = getWordsByUnit(unit); if (!selectedWords.length) { alert("该单元没有单词"); return; } currentRunMode = mode; reviewCompletionRecorded = false; if (mode === "review") { resetWordsForReview(selectedWords); saveLocalState(); scheduleSync(); } sessionScore = 0; updateScoreUi(); updateModeProgressUi(); closeAllScreens(); gameScreen.classList.remove("hidden"); nextQuestion(); }

function refreshUnitCatalog() { unitCatalog = getAllUnits(); }

// ---- 网络同步 ----
function buildMetaPayload() { return { cumulativeScore, silverCoins: cumulativeScore, goldCoins, goldEarnedWords: Array.from(goldAwardedWords), ownedVehicleIds: Array.from(ownedVehicleIds), equippedVehicleId, ownedEffectIds: Array.from(ownedEffectIds), equippedEffectId, reviewCounts: reviewCountsByUnit, units: unitCatalog }; }

async function syncToServer() {
  try {
    const payload = { words: allWords.map((w) => ({ chinese: w.chinese, status: w.status })), meta: buildMetaPayload() };
    const res = await fetch("/api/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("sync failed");
    const data = await res.json();
    if (Array.isArray(data.words) && data.words.length) { const map = new Map(data.words.map((w) => [w.chinese, w])); allWords.forEach((w) => { const serverW = map.get(w.chinese); if (!serverW) return; w.status = serverW.status; w.score = serverW.score; }); applyCurrencyFromPayload(data, allWords); applyMarketFromPayload(data); reviewCountsByUnit = data.reviewCounts && typeof data.reviewCounts === "object" ? data.reviewCounts : reviewCountsByUnit; unitCatalog = Array.isArray(data.units) ? data.units : unitCatalog; updateScoreUi(); setSyncState("已同步", true); }
  } catch (error) { console.warn(error); setSyncState("同步失败", false); }
}

function scheduleSync() { setSyncState("同步中...", null); if (syncTimer) clearTimeout(syncTimer); syncTimer = setTimeout(() => syncToServer(), 500); }

function bootstrapApp() {
  canvas.addEventListener("click", (e) => { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; mouseCanvasX = (e.clientX - rect.left) * scaleX; mouseCanvasY = (e.clientY - rect.top) * scaleY; handleBalloonClick(mouseCanvasX, mouseCanvasY); });
  canvas.addEventListener("mousemove", (e) => { const rect = canvas.getBoundingClientRect(); const scaleX = canvas.width / rect.width; const scaleY = canvas.height / rect.height; mouseCanvasX = (e.clientX - rect.left) * scaleX; mouseCanvasY = (e.clientY - rect.top) * scaleY; });
  canvas.addEventListener("mouseenter", () => { isMouseInCanvas = true; });
  canvas.addEventListener("mouseleave", () => { isMouseInCanvas = false; });
  window.addEventListener("keydown", (e) => { if (gameScreen.classList.contains("hidden")) return; if (waitingManualContinue && e.code === "Space") { e.preventDefault(); continueAfterWrong(); return; } if (!currentWord || currentWord.status < 2) return; const key = e.key === " " ? " " : e.key.length === 1 ? e.key.toUpperCase() : ""; if (!key) return; e.preventDefault(); handleSpellingInput(key); });
  backBtn.addEventListener("click", () => { openHomeScreen(); clearFeedback(); isMouseInCanvas = false; hideWrongAnswerOverlay(); });
  manageBackBtn.addEventListener("click", () => { openHomeScreen(); });
  openAdminBtn.addEventListener("click", () => { openAdminScreen(); });
  openMarketBtn.addEventListener("click", () => { openMarketScreen(); });
  adminBackBtn.addEventListener("click", () => { openHomeScreen(); });
  marketBackBtn.addEventListener("click", () => { openHomeScreen(); });
  addUnitBtn.addEventListener("click", async () => { const unit = newUnitInput.value.trim(); if (!unit) { alert("请输入单元名"); return; } if (getAllUnits().includes(unit)) { alert("该单元已存在"); return; } unitCatalog.push(unit); adminSelectedUnit = unit; newUnitInput.value = ""; try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("新增单元失败，请重试"); } });
  addWordBtn.addEventListener("click", async () => { if (!adminSelectedUnit) { alert("请先选择单元"); return; } const chinese = newWordCnInput.value.trim(); const english = newWordEnInput.value.trim(); if (!chinese) { alert("中文不能为空"); return; } if (allWords.some((w) => w.chinese === chinese)) { alert("中文词条已存在，不能重复"); return; } allWords.push({ chinese, english, unit: adminSelectedUnit, status: 0, score: STATUS_SCORE_MAP[0], hintActive: false }); newWordCnInput.value = ""; newWordEnInput.value = ""; try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("新增单词失败，请重试"); } });
  batchSetStatusBtn.addEventListener("click", async () => { if (!adminSelectedUnit) { alert("请先选择单元"); return; } const targetStatus = Math.max(0, Math.min(4, Number.parseInt(batchStatusSelectEl.value, 10) || 0)); const list = adminGetSelectedWords(); if (!list.length) { alert("该单元暂无单词"); return; } let changedCount = 0; list.forEach((w) => { if (w.status === targetStatus) return; w.status = targetStatus; w.hintActive = false; w.score = STATUS_SCORE_MAP[targetStatus]; changedCount += 1; }); if (!changedCount) { alert(`当前单元全部单词已是进度${targetStatus}`); return; } try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); alert(`已将 ${changedCount} 个单词一键设置为进度${targetStatus}`); } catch (error) { console.warn(error); alert("批量设置失败，请重试"); } });
  startLearnBtn.addEventListener("click", () => { const words = getWordsByUnit(selectedUnit); const allDone = words.length > 0 && words.every((w) => w.status >= 4); startGameByUnit(selectedUnit, allDone ? "review" : "normal"); });
  startReviewBtn.addEventListener("click", () => { startGameByUnit(selectedUnit, "review"); });
  continueBtn.addEventListener("click", () => { continueAfterWrong(); });
  soundBtn.addEventListener("click", () => { soundEnabled = !soundEnabled; soundBtn.textContent = `音效: ${soundEnabled ? "开" : "关"}`; if (soundEnabled) soundGood(); });
  speechBtn.addEventListener("click", () => { speechEnabled = !speechEnabled; speechBtn.textContent = `读音: ${speechEnabled ? "开" : "关"}`; if (!speechEnabled) stopSpeech(); });
  speakWordBtn.addEventListener("click", () => { if (speakWordBtnPlaying) return; speakCurrentWordEnglish({ withButtonEffect: true }); });
  importBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", async (e) => { const file = e.target.files?.[0]; if (!file) return; const text = await file.text(); const parsed = parseCsv(text); if (!parsed.length) { alert("CSV 解析失败"); return; } allWords = parsed; initCurrencyFromWords(allWords); reviewCountsByUnit = {}; unitCatalog = Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b)); saveLocalState(); buildUnitButtons(); updateScoreUi(); scheduleSync(); alert("导入成功"); fileInput.value = ""; });
  exportBtn.addEventListener("click", () => { if (!allWords.length) { alert("暂无数据可导出"); return; } const blob = new Blob([toCsv(allWords)], { type: "text/csv;charset=utf-8;" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "words_web_export.csv"; a.click(); URL.revokeObjectURL(url); });

  async function loadInitialData() {
    try { const res = await fetch("/api/words", { cache: "no-store" }); if (!res.ok) throw new Error("api unavailable"); const data = await res.json(); allWords = (data.words || []).map((w) => ({ ...w, hintActive: false })); applyCurrencyFromPayload(data, allWords); refreshGoldFromWords(allWords); applyMarketFromPayload(data); reviewCountsByUnit = data.reviewCounts && typeof data.reviewCounts === "object" ? data.reviewCounts : {}; unitCatalog = Array.isArray(data.units) ? data.units : Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b)); applyLocalState(); const scoreChanged = recalcScoresFromStatus(allWords); buildUnitButtons(); updateScoreUi(); updateHomeStats(); updateModeProgressUi(); setSyncState("已同步", true); if (scoreChanged) scheduleSync(); }
    catch (error) { setSyncState("离线模式", false);
      try { const localRes = await fetch("words.csv", { cache: "no-store" }); if (!localRes.ok) throw new Error("words.csv unavailable"); const text = await localRes.text(); allWords = parseCsv(text); initCurrencyFromWords(allWords); refreshGoldFromWords(allWords); applyMarketFromPayload(null); reviewCountsByUnit = {}; unitCatalog = Array.from(new Set(allWords.map((w) => w.unit))).sort((a, b) => a.localeCompare(b)); applyLocalState(); recalcScoresFromStatus(allWords); buildUnitButtons(); updateScoreUi(); updateHomeStats(); updateModeProgressUi(); alert("已进入离线模式，运行 server.py 可启用自动同步。\n现在也可以先玩。"); }
      catch (error2) { console.warn(error, error2); alert('无法加载词库，请点击"导入 CSV"选择 web_client 目录内的 words.csv。'); }
    }
  }

  function initClouds() { clouds = [{ x: 60, y: 90, r: 22, speed: 0.22 }, { x: 320, y: 130, r: 18, speed: 0.16 }, { x: 730, y: 100, r: 26, speed: 0.2 }]; }

  buildSpellingKeyboard();
  initClouds();
  if ("speechSynthesis" in window) { resolvePreferredSpeechVoice(); window.speechSynthesis.onvoiceschanged = () => resolvePreferredSpeechVoice(); }
  loadInitialData();
  requestAnimationFrame(drawFrame);
}

window.bootstrapApp = bootstrapApp;
