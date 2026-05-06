// ============================================================
// app.game.js — 游戏逻辑模块（气球模式、拼写模式、Canvas 渲染）
// 依赖 app.core.js 中定义的全局变量、DOM 引用和工具函数
// ============================================================

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
  cumulativeScore += 10;
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
        cumulativeScore += 20;
        showFeedback("✓ 简单模式完成 +20", true);
      } else {
        sessionScore += 40;
        cumulativeScore += 40;
        currentWord.hintActive = false;
        currentWord.status = 4;
        currentWord.score = STATUS_SCORE_MAP[4];
        if (currentRunMode === "normal") awardWordCompletionRewards(currentWord);
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
