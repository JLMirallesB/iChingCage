const SHEET = {
  width: 2834.65,
  height: 2834.65,
  cellW: 280.63,
  cellH: 284.88,
  margin: 14.17,
  cols: [204.09, 513.07, 822.05, 1131.03, 1440.0, 1748.98, 2057.96, 2366.93],
  rows: [206.93, 515.91, 824.88, 1133.86, 1444.25, 1751.81, 2060.79, 2371.18],
};

const WEN_PATTERNS = [
  "111111", "000000", "010001", "100010", "010111", "111010", "000010", "010000",
  "110111", "111011", "000111", "111000", "111101", "101111", "000100", "001000",
  "011001", "100110", "000011", "110000", "101001", "100101", "100000", "000001",
  "111001", "100111", "100001", "011110", "010010", "101101", "011100", "001110",
  "111100", "001111", "101000", "000101", "110101", "101011", "010100", "001010",
  "100011", "110001", "011111", "111110", "011000", "000110", "011010", "010110",
  "011101", "101110", "001001", "100100", "110100", "001011", "001101", "101100",
  "110110", "011011", "110010", "010011", "110011", "001100", "010101", "101010",
];

const PATTERN_TO_INDEX = new Map(WEN_PATTERNS.map((pattern, index) => [pattern, index]));

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
const autoplaySelect = document.getElementById("autoplaySelect");
const designHex = document.getElementById("designHex");
const designLabel = document.getElementById("designLabel");
const designInfo = document.getElementById("designInfo");
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
let autoplayMs = 3000;
let autoplayTimer = null;
let wenSections = null;
let wenInfoCache = new Map();

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
    glyph.dataset.hex = String(hex.id);
    glyph.dataset.index = String(index);

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

function renderDesign() {
  const pattern = manualLines.map((bit) => (bit ? "1" : "0")).join("");
  const index = PATTERN_TO_INDEX.get(pattern);
  if (index === undefined) {
    return;
  }
  const hex = HEXES[index];
  const row = Math.floor(index / 8) + 1;
  const col = (index % 8) + 1;
  const binary = pattern;
  designHex.style.setProperty("--bx", `-${hex.x}px`);
  designHex.style.setProperty("--by", `-${hex.y}px`);
  designHex.dataset.hex = String(hex.id);
  designHex.dataset.index = String(index);
  designLabel.textContent = `Hexagrama ${hex.id} · Fila ${row} Col ${col} · ${binary}`;
  rollLabel.textContent = `Hexagrama ${hex.id}`;
  loadWenInfo(hex.id);
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

function stepComplete(delta) {
  if (completeMode === "circular") {
    if (delta > 0 && completeIndex === completeOrder.length - 1) {
      completeOrder = buildCompleteOrder("shuffle");
      completeIndex = 0;
    } else {
      completeIndex = (completeIndex + delta + completeOrder.length) % completeOrder.length;
    }
  } else {
    completeIndex = (completeIndex + delta + completeOrder.length) % completeOrder.length;
  }
  renderComplete();
}

function updateAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
  if (currentView === "complete" && autoplayMs > 0) {
    autoplayTimer = setInterval(() => {
      stepComplete(1);
    }, autoplayMs);
  }
}

async function fetchWenSections() {
  if (wenSections) return wenSections;
  const url = "https://es.wikipedia.org/w/api.php?action=parse&page=Anexo:Hexagramas_del_I_Ching&prop=sections&format=json&origin=*";
  const res = await fetch(url);
  const data = await res.json();
  const map = new Map();
  for (const section of data.parse.sections) {
    const match = section.line.match(/Hexagrama\\s+(\\d+)/i);
    if (match) {
      map.set(Number(match[1]), section.index);
    }
  }
  wenSections = map;
  return map;
}

async function loadWenInfo(hexNumber) {
  if (!designInfo) return;
  if (wenInfoCache.has(hexNumber)) {
    designInfo.textContent = wenInfoCache.get(hexNumber);
    return;
  }
  try {
    designInfo.textContent = "Cargando descripcion...";
    const sections = await fetchWenSections();
    const sectionId = sections.get(hexNumber);
    if (!sectionId) {
      designInfo.textContent = "";
      return;
    }
    const url = `https://es.wikipedia.org/w/api.php?action=parse&page=Anexo:Hexagramas_del_I_Ching&prop=text&section=${sectionId}&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const wrapper = document.createElement("div");
    wrapper.innerHTML = data.parse.text["*"];
    const paragraphs = Array.from(wrapper.querySelectorAll("p"))
      .map((p) => p.textContent.trim())
      .filter(Boolean);
    const dictamenIndex = paragraphs.findIndex((p) => p.toLowerCase().startsWith("el dictamen"));
    let summary = paragraphs[0] || "";
    if (dictamenIndex !== -1) {
      summary = paragraphs[dictamenIndex].replace(/El dictamen dice:?/i, "").trim();
    }
    if (!summary) {
      const blockquote = wrapper.querySelector("blockquote");
      if (blockquote) {
        summary = blockquote.textContent.trim();
      }
    }
    const cleaned = summary.replace(/\\s+/g, " ").trim();
    const finalText = cleaned ? `Dictamen: ${cleaned}` : "";
    wenInfoCache.set(hexNumber, finalText);
    designInfo.textContent = finalText;
  } catch (error) {
    designInfo.textContent = "";
  }
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
    completeOrder = buildCompleteOrder(completeMode === "circular" ? "shuffle" : completeMode);
    completeIndex = 0;
    renderComplete();
    updateAutoplay();
  } else {
    updateAutoplay();
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
  stepComplete(-1);
});
nextBtn.addEventListener("click", () => {
  stepComplete(1);
});

rowSelect.addEventListener("change", () => {
  if (currentView === "rows") {
    renderRow(Number(rowSelect.value) - 1);
  }
});

completeSelect.addEventListener("change", () => {
  completeMode = completeSelect.value;
  if (currentView === "complete") {
    completeOrder = buildCompleteOrder(completeMode === "circular" ? "shuffle" : completeMode);
    completeIndex = 0;
    renderComplete();
  }
});

autoplaySelect.addEventListener("change", () => {
  autoplayMs = Math.round(Number(autoplaySelect.value) * 1000);
  updateAutoplay();
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
