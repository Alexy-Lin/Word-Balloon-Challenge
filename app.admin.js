// ============================================================
// app.admin.js — 单元 & 单词管理后台模块
// 依赖 app.core.js 中定义的全局变量和 DOM 引用
// ============================================================

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
    words: allWords.map((w) => ({ chinese: w.chinese, english: w.english, unit: w.unit, status: w.status })),
    meta: buildMetaPayload(),
  };
  const res = await fetch("/api/admin/save", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
  if (!adminSelectedUnit) { const p = document.createElement("p"); p.textContent = "请先选择一个单元"; adminWordListEl.appendChild(p); return; }
  const list = adminGetSelectedWords();
  if (!list.length) { const p = document.createElement("p"); p.textContent = "该单元暂无单词"; adminWordListEl.appendChild(p); return; }
  list.forEach((w) => {
    const row = document.createElement("div"); row.className = "admin-word-row";
    const cnInput = document.createElement("input"); cnInput.className = "text-input word-row-grow"; cnInput.value = w.chinese;
    const enInput = document.createElement("input"); enInput.className = "text-input word-row-grow"; enInput.value = w.english;
    const statusSelect = createStatusSelect(w.status);
    const saveBtn = document.createElement("button"); saveBtn.className = "btn ghost"; saveBtn.textContent = "保存";
    saveBtn.addEventListener("click", async () => {
      const nextCn = cnInput.value.trim(); const nextEn = enInput.value.trim();
      const nextStatus = Math.max(0, Math.min(4, Number.parseInt(statusSelect.value, 10) || 0));
      if (!nextCn) { alert("中文不能为空"); return; }
      const duplicate = allWords.find((x) => x.chinese === nextCn && x !== w);
      if (duplicate) { alert("中文词条重复，请换一个中文"); return; }
      w.chinese = nextCn; w.english = nextEn; w.status = nextStatus; w.score = STATUS_SCORE_MAP[nextStatus];
      try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("保存失败，请重试"); }
    });
    const delBtn = document.createElement("button"); delBtn.className = "btn warn"; delBtn.textContent = "删除";
    delBtn.addEventListener("click", async () => {
      const ok = window.confirm(`确认删除单词: ${w.chinese} ?`); if (!ok) return;
      allWords = allWords.filter((x) => x !== w);
      try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("删除失败，请重试"); }
    });
    row.appendChild(cnInput); row.appendChild(enInput); row.appendChild(statusSelect); row.appendChild(saveBtn); row.appendChild(delBtn);
    adminWordListEl.appendChild(row);
  });
}

function buildAdminUnitList() {
  adminUnitListEl.innerHTML = "";
  const units = getAllUnits();
  if (!units.length) { const p = document.createElement("p"); p.textContent = "暂无单元，请先新增单元"; adminUnitListEl.appendChild(p); adminSelectedUnit = ""; renderAdminWordList(); return; }
  if (!adminSelectedUnit || !units.includes(adminSelectedUnit)) { adminSelectedUnit = units[0]; }
  units.forEach((u) => {
    const row = document.createElement("div"); row.className = `admin-unit-row ${u === adminSelectedUnit ? "active" : ""}`; row.tabIndex = 0;
    const info = document.createElement("div"); info.className = "unit-info";
    const name = document.createElement("span"); name.className = "unit-name"; name.textContent = u;
    const renameBtn = document.createElement("button"); renameBtn.className = `btn ghost unit-rename-btn ${u === adminSelectedUnit ? "" : "hidden"}`; renameBtn.textContent = "改名";
    renameBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); const next = window.prompt("请输入新的单元名称", u); if (next === null) return;
      const newUnitName = next.trim(); if (!newUnitName) { alert("单元名称不能为空"); return; }
      if (newUnitName === u) return; if (getAllUnits().includes(newUnitName)) { alert("该单元名已存在"); return; }
      allWords.forEach((w) => { if (w.unit === u) w.unit = newUnitName; });
      unitCatalog = unitCatalog.map((x) => (x === u ? newUnitName : x));
      if (Object.prototype.hasOwnProperty.call(reviewCountsByUnit, u)) { reviewCountsByUnit[newUnitName] = reviewCountsByUnit[u]; delete reviewCountsByUnit[u]; }
      if (adminSelectedUnit === u) adminSelectedUnit = newUnitName;
      try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("修改单元名称失败，请重试"); }
    });
    const count = document.createElement("span"); count.className = "unit-count"; count.textContent = `${getWordsByUnit(u).length} 个词`;
    const delBtn = document.createElement("button"); delBtn.className = "btn warn"; delBtn.textContent = "删除";
    delBtn.addEventListener("click", async (e) => {
      e.stopPropagation(); const ok = window.confirm(`确认删除单元 ${u} 及其全部单词?`); if (!ok) return;
      allWords = allWords.filter((w) => w.unit !== u); unitCatalog = unitCatalog.filter((x) => x !== u); delete reviewCountsByUnit[u];
      if (adminSelectedUnit === u) adminSelectedUnit = "";
      try { await saveAdminChanges(); buildAdminUnitList(); renderAdminWordList(); } catch (error) { console.warn(error); alert("删除单元失败，请重试"); }
    });
    row.addEventListener("click", () => { adminSelectedUnit = u; buildAdminUnitList(); renderAdminWordList(); });
    row.addEventListener("keydown", (e) => { if (e.key !== "Enter" && e.key !== " ") return; e.preventDefault(); adminSelectedUnit = u; buildAdminUnitList(); renderAdminWordList(); });
    info.appendChild(name); info.appendChild(renameBtn); row.appendChild(info); row.appendChild(count); row.appendChild(delBtn);
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
