const SHEET = {
  width: 2000,
  height: 2000,
  cellW: 198,
  cellH: 201,
  margin: 10,
  cols: [144, 362, 580, 798, 1016, 1234, 1452, 1670],
  rows: [146, 364, 582, 800, 1019, 1236, 1454, 1673],
};

const HEXES = [];
for (let r = 0; r < 8; r += 1) {
  for (let c = 0; c < 8; c += 1) {
    HEXES.push({
      id: r * 8 + c + 1,
      x: SHEET.cols[c] - SHEET.margin,
      y: SHEET.rows[r] - SHEET.margin,
    });
  }
}

const grid = document.getElementById("grid");
const modeSelect = document.getElementById("modeSelect");
const rollBtn = document.getElementById("rollBtn");
const modeLabel = document.getElementById("modeLabel");
const rollLabel = document.getElementById("rollLabel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const rowSelect = document.getElementById("rowSelect");
const completeSelect = document.getElementById("completeSelect");
const designHex = document.getElementById("designHex");
const designLabel = document.getElementById("designLabel");
const progressBar = document.getElementById("progressBar");
const progressText = document.getElementById("progressText");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const controlGroups = Array.from(document.querySelectorAll("[data-controls]"));
const lineButtons = Array.from(document.querySelectorAll(".line-btn"));

let currentCount = 1;
let currentView = "random";
let completeMode = "shuffle";
let completeOrder = [];
let completeIndex = 0;
let manualLines = Array(6).fill(1);
let rolling = false;

function randInt(max) {
  if (window.crypto && window.crypto.getRandomValues) {
    const buffer = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    let value = 0;
    do {
      window.crypto.getRandomValues(buffer);
      value = buffer[0];
    } while (value >= limit);
    return value % max;
  }
  return Math.floor(Math.random() * max);
}

function pickRandom(count) {
  const pool = HEXES.map((_, index) => index);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

function render(indices) {
  grid.innerHTML = "";
  grid.dataset.count = String(indices.length);

  const fragment = document.createDocumentFragment();
  indices.forEach((index, i) => {
    const hex = HEXES[index];
    const item = document.createElement("div");
    item.className = "hex-item";
    item.style.animationDelay = `${i * 60}ms`;

    const glyph = document.createElement("div");
    glyph.className = "hex";
    glyph.style.setProperty("--bx", `-${hex.x}px`);
    glyph.style.setProperty("--by", `-${hex.y}px`);
    glyph.setAttribute("role", "img");
    glyph.setAttribute("aria-label", `Hexagrama ${hex.id}`);

    const label = document.createElement("div");
    label.className = "hex-label";
    label.textContent = `Hexagrama ${hex.id}`;

    item.append(glyph, label);
    fragment.append(item);
  });

  grid.append(fragment);
}

function formatModeLabel() {
  const labels = {
    random: "Aleatorio",
    rows: "Filas de 8",
    design: "Diseña",
    complete: "Completo",
  };
  return `Modo: ${labels[currentView] || "Aleatorio"}`;
}

function formatTime(date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setMode(count, doRoll = true) {
  currentCount = count;
  modeLabel.textContent = formatModeLabel();
  modeButtons.forEach((btn) => {
    const isActive = Number(btn.dataset.count) === count;
    btn.setAttribute("aria-pressed", String(isActive));
  });
  if (doRoll) {
    roll(count);
  }
}

function roll(count) {
  if (rolling) return;
  rolling = true;
  rollBtn.disabled = true;

  const ticks = 10;
  let currentTick = 0;

  const interval = setInterval(() => {
    render(pickRandom(count));
    currentTick += 1;

    if (currentTick >= ticks) {
      clearInterval(interval);
      render(pickRandom(count));
      rollLabel.textContent = `Ultima tirada: ${formatTime(new Date())}`;
      rollBtn.disabled = false;
      rolling = false;
    }
  }, 80);
}

function renderRow(rowIndex) {
  const start = rowIndex * 8;
  const indices = Array.from({ length: 8 }, (_, i) => start + i);
  render(indices);
  rollLabel.textContent = `Fila ${rowIndex + 1}`;
}

function linesToIndex(linesTopToBottom) {
  let value = 0;
  for (let i = 0; i < 6; i += 1) {
    const bit = linesTopToBottom[5 - i];
    value |= (bit ? 1 : 0) << i;
  }
  return value;
}

function renderDesign() {
  const index = linesToIndex(manualLines);
  const hex = HEXES[index];
  designHex.style.setProperty("--bx", `-${hex.x}px`);
  designHex.style.setProperty("--by", `-${hex.y}px`);
  designLabel.textContent = `Hexagrama ${hex.id}`;
  rollLabel.textContent = `Hexagrama ${hex.id}`;
}

function buildCompleteOrder(mode) {
  if (mode === "sequence") {
    return HEXES.map((_, i) => i);
  }
  const pool = HEXES.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}

function renderComplete() {
  const index = completeOrder[completeIndex];
  render([index]);
  const current = completeIndex + 1;
  progressBar.style.width = `${(current / 64) * 100}%`;
  progressText.textContent = `${current} / 64`;
  rollLabel.textContent = `Hexagrama ${index + 1}`;
}

function setView(view, doRender = true) {
  currentView = view;
  grid.dataset.view = view;
  modeLabel.textContent = formatModeLabel();
  modeSelect.value = view;
  controlGroups.forEach((group) => {
    const isActive = group.dataset.controls === view;
    group.classList.toggle("is-active", isActive);
  });

  if (!doRender) return;
  if (view === "random") {
    roll(currentCount);
  }
  if (view === "rows") {
    renderRow(Number(rowSelect.value) - 1);
  }
  if (view === "design") {
    renderDesign();
  }
  if (view === "complete") {
    completeOrder = buildCompleteOrder(completeMode);
    completeIndex = 0;
    renderComplete();
  }
}

modeSelect.addEventListener("change", () => {
  setView(modeSelect.value, true);
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const count = Number(button.dataset.count);
    setMode(count, true);
  });
});

rollBtn.addEventListener("click", () => roll(currentCount));
prevBtn.addEventListener("click", () => {
  completeIndex = (completeIndex + 63) % 64;
  renderComplete();
});
nextBtn.addEventListener("click", () => {
  completeIndex = (completeIndex + 1) % 64;
  renderComplete();
});

rowSelect.addEventListener("change", () => {
  if (currentView === "rows") {
    renderRow(Number(rowSelect.value) - 1);
  }
});

completeSelect.addEventListener("change", () => {
  completeMode = completeSelect.value;
  if (currentView === "complete") {
    completeOrder = buildCompleteOrder(completeMode);
    completeIndex = 0;
    renderComplete();
  }
});

lineButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.line);
    manualLines[index] = manualLines[index] ? 0 : 1;
    button.textContent = manualLines[index] ? "—" : "-- --";
    renderDesign();
  });
});

setMode(1, false);
setView("random", true);
