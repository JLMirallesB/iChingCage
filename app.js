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
const rollBtn = document.getElementById("rollBtn");
const modeLabel = document.getElementById("modeLabel");
const rollLabel = document.getElementById("rollLabel");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const viewButtons = Array.from(document.querySelectorAll(".view-btn"));
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));
const controlGroups = Array.from(document.querySelectorAll("[data-controls]"));
const lineButtons = Array.from(document.querySelectorAll(".line-btn"));

let currentCount = 1;
let currentView = "random";
let sequenceIndex = 0;
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
    rows: "Filas 8",
    shuffle: "Aleatorio 64",
    sequence: "Secuencia",
    manual: "Manual",
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

function renderRows() {
  render(Array.from({ length: 64 }, (_, i) => i));
  rollLabel.textContent = "Ultima tirada: --";
}

function renderShuffle() {
  const pool = HEXES.map((_, index) => index);
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = randInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  render(pool);
  rollLabel.textContent = "Ultima tirada: --";
}

function renderSequence() {
  render([sequenceIndex]);
  rollLabel.textContent = `Hexagrama ${sequenceIndex + 1} de 64`;
}

function linesToIndex(linesTopToBottom) {
  let value = 0;
  for (let i = 0; i < 6; i += 1) {
    const bit = linesTopToBottom[5 - i];
    value |= (bit ? 1 : 0) << i;
  }
  return value;
}

function renderManual() {
  const index = linesToIndex(manualLines);
  render([index]);
  rollLabel.textContent = `Hexagrama ${index + 1} (manual)`;
}

function setView(view, doRender = true) {
  currentView = view;
  grid.dataset.view = view;
  modeLabel.textContent = formatModeLabel();
  viewButtons.forEach((btn) => {
    const isActive = btn.dataset.view === view;
    btn.setAttribute("aria-pressed", String(isActive));
  });
  controlGroups.forEach((group) => {
    const isActive = group.dataset.controls === view;
    group.classList.toggle("is-active", isActive);
  });

  if (!doRender) return;
  if (view === "random") {
    roll(currentCount);
  } else if (view === "rows") {
    renderRows();
  } else if (view === "shuffle") {
    renderShuffle();
  } else if (view === "sequence") {
    renderSequence();
  } else if (view === "manual") {
    renderManual();
  }
}

viewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    setView(view, true);
  });
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const count = Number(button.dataset.count);
    setMode(count, true);
  });
});

rollBtn.addEventListener("click", () => roll(currentCount));
prevBtn.addEventListener("click", () => {
  sequenceIndex = (sequenceIndex + 63) % 64;
  renderSequence();
});
nextBtn.addEventListener("click", () => {
  sequenceIndex = (sequenceIndex + 1) % 64;
  renderSequence();
});

lineButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.line);
    manualLines[index] = manualLines[index] ? 0 : 1;
    button.textContent = manualLines[index] ? "—" : "-- --";
    renderManual();
  });
});

setMode(1, false);
setView("random", true);
