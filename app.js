const SHEET = {
  width: 2000,
  height: 2000,
  cellW: 178,
  cellH: 181,
  cols: [144, 362, 580, 798, 1016, 1234, 1452, 1670],
  rows: [146, 364, 582, 800, 1019, 1236, 1454, 1673],
};

const HEXES = [];
for (let r = 0; r < 8; r += 1) {
  for (let c = 0; c < 8; c += 1) {
    HEXES.push({
      id: r * 8 + c + 1,
      x: SHEET.cols[c],
      y: SHEET.rows[r],
    });
  }
}

const grid = document.getElementById("grid");
const rollBtn = document.getElementById("rollBtn");
const modeLabel = document.getElementById("modeLabel");
const rollLabel = document.getElementById("rollLabel");
const modeButtons = Array.from(document.querySelectorAll(".mode-btn"));

let currentCount = 1;
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
    const card = document.createElement("div");
    card.className = "hex-card";
    card.style.animationDelay = `${i * 60}ms`;

    const glyph = document.createElement("div");
    glyph.className = "hex";
    glyph.style.setProperty("--bx", `-${hex.x}px`);
    glyph.style.setProperty("--by", `-${hex.y}px`);
    glyph.setAttribute("role", "img");
    glyph.setAttribute("aria-label", `Hexagrama ${hex.id}`);

    const label = document.createElement("div");
    label.className = "hex-label";
    label.textContent = `Hexagrama ${hex.id}`;

    card.append(glyph, label);
    fragment.append(card);
  });

  grid.append(fragment);
}

function formatModeLabel(count) {
  return `Modo: ${count} hexagrama${count === 1 ? "" : "s"}`;
}

function formatTime(date) {
  return date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function setMode(count, doRoll = true) {
  currentCount = count;
  modeLabel.textContent = formatModeLabel(count);
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

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const count = Number(button.dataset.count);
    setMode(count, true);
  });
});

rollBtn.addEventListener("click", () => roll(currentCount));

setMode(1, true);
