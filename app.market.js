// ============================================================
// app.market.js — 市场（车辆 & 特效商店）模块
// 依赖 app.core.js 中定义的全局变量和 DOM 引用
// ============================================================

const PREVIEW_SVG_MAP = {
  bulldozer: { selector: "#roadCar .bulldozer-svg", cls: "preview-bulldozer" },
  police:    { selector: "#roadCar .police-svg",    cls: "preview-police" },
  fire:      { selector: "#roadCar .firetruck-svg", cls: "preview-firetruck" },
  tank:      { selector: "#roadCar .tank-svg",      cls: "preview-tank" },
  taxi:      { selector: "#roadCar .taxi-svg",      cls: "preview-taxi" },
  truck:     { selector: "#roadCar .pickup-svg",    cls: "preview-pickup" },
  swat:      { selector: "#roadCar .swat-svg",      cls: "preview-swat" },
};

function createMarketPreviewNode(vehicleStyle, effectStyle, labelText) {
  const preview = document.createElement("div");
  preview.className = "market-preview";
  const car = document.createElement("div");
  car.className = "market-preview-car";
  car.dataset.vehicle = vehicleStyle;
  car.dataset.effect = effectStyle;
  const speedLines = document.createElement("div");
  speedLines.className = "preview-speed-lines";
  const trail = document.createElement("div");
  trail.className = "preview-trail";
  const mapping = PREVIEW_SVG_MAP[vehicleStyle] || { selector: "#roadCar .bugatti-svg", cls: "preview-bugatti" };
  const sourceSVG = document.querySelector(mapping.selector);
  let svg = sourceSVG ? sourceSVG.cloneNode(true) : null;
  if (svg) {
    const defs = svg.querySelector("defs");
    if (defs) defs.remove();
    svg.classList.add(mapping.cls);
  }
  const label = document.createElement("span");
  label.className = "preview-label";
  label.textContent = labelText;
  car.appendChild(trail);
  if (svg) car.appendChild(svg);
  car.appendChild(speedLines);
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
          if (cumulativeScore < item.price) { alert("银币不足，继续学习赚取银币后再来购买。"); return; }
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
  renderSection("车辆", VEHICLE_CATALOG, ownedVehicleIds, equippedVehicleId, (id) => { equippedVehicleId = id; }, (item) => createMarketPreviewNode(item.style, getEffectById(equippedEffectId).style, item.preview));
  renderSection("特效", EFFECT_CATALOG, ownedEffectIds, equippedEffectId, (id) => { equippedEffectId = id; }, (item) => createMarketPreviewNode(getVehicleById(equippedVehicleId).style, item.style, item.preview));
}

function openMarketScreen() {
  updateScoreUi();
  renderMarketList();
  closeAllScreens();
  marketScreen.classList.remove("hidden");
}
