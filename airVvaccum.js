const DROP_HEIGHT_METERS = 12;
const SLOT_KEYS = ["a", "b"];

const PLANETS = {
  earth: { label: "Earth", gravity: 9.8 },
  moon: { label: "Moon", gravity: 1.6 },
  mars: { label: "Mars", gravity: 3.7 },
  jupiter: { label: "Jupiter", gravity: 24.8 }
};

const OBJECTS = {
  leadBall: {
    label: "Lead Ball",
    drag: 0.02,
    svg: `
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <defs>
          <radialGradient id="leadBallFill" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#ecf3ff" />
            <stop offset="45%" stop-color="#a8b5c5" />
            <stop offset="100%" stop-color="#586473" />
          </radialGradient>
        </defs>
        <circle cx="44" cy="44" r="25" fill="url(#leadBallFill)" />
        <circle cx="35" cy="34" r="7" fill="rgba(255,255,255,0.38)" />
      </svg>
    `
  },
  basketball: {
    label: "Basketball",
    drag: 0.18,
    svg: `
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r="26" fill="#d96e2d" />
        <path d="M44 18C56 30 56 58 44 70" fill="none" stroke="#2a1208" stroke-width="2.8" />
        <path d="M44 18C32 30 32 58 44 70" fill="none" stroke="#2a1208" stroke-width="2.8" />
        <path d="M18 44H70" fill="none" stroke="#2a1208" stroke-width="2.8" />
        <path d="M23 29C35 37 53 37 65 29" fill="none" stroke="#2a1208" stroke-width="2.8" />
        <path d="M23 59C35 51 53 51 65 59" fill="none" stroke="#2a1208" stroke-width="2.8" />
      </svg>
    `
  },
  paperPlane: {
    label: "Paper Plane",
    drag: 0.42,
    svg: `
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <path d="M13 46L75 18L51 70L43 49L13 46Z" fill="#dce7f7" stroke="#8da3c0" stroke-width="2" />
        <path d="M13 46L43 49L51 70" fill="#afc1da" />
        <path d="M43 49L75 18" fill="none" stroke="#8da3c0" stroke-width="2" />
      </svg>
    `
  },
  bowlingBall: {
    label: "Bowling Ball",
    drag: 0.06,
    svg: `
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <defs>
          <radialGradient id="bowlingBallFill" cx="38%" cy="28%" r="70%">
            <stop offset="0%" stop-color="#767a88" />
            <stop offset="40%" stop-color="#2a2e3c" />
            <stop offset="100%" stop-color="#0d1017" />
          </radialGradient>
        </defs>
        <circle cx="44" cy="44" r="26" fill="url(#bowlingBallFill)" />
        <circle cx="36" cy="34" r="3.8" fill="#0a0d13" />
        <circle cx="48" cy="31" r="3.8" fill="#0a0d13" />
        <circle cx="42" cy="42" r="3.8" fill="#0a0d13" />
      </svg>
    `
  }
};

const state = {
  planet: "earth",
  environment: "vacuum",
  running: false,
  dropStart: 0,
  elapsed: 0,
  rafId: null,
  objects: {
    a: { key: "paperPlane", impactShown: false },
    b: { key: "bowlingBall", impactShown: false }
  }
};

const elements = {
  planetSelect: document.getElementById("planetSelect"),
  airToggle: document.getElementById("airToggle"),
  dropButton: document.getElementById("dropButton"),
  resetButton: document.getElementById("resetButton"),
  envTag: document.getElementById("envTag"),
  planetBadge: document.getElementById("planetBadge"),
  gravityBadge: document.getElementById("gravityBadge"),
  modelBadge: document.getElementById("modelBadge"),
  planetReadout: document.getElementById("planetReadout"),
  environmentReadout: document.getElementById("environmentReadout"),
  gravityReadout: document.getElementById("gravityReadout"),
  heightBadge: document.getElementById("heightBadge"),
  timeReadout: document.getElementById("timeReadout"),
  insight: document.getElementById("insight"),
  slots: {
    a: {
      select: document.getElementById("objectASelect"),
      name: document.getElementById("objectAName"),
      drag: document.getElementById("objectADrag"),
      tube: document.getElementById("tubeA"),
      atmosphere: document.getElementById("tubeAtmosphereA"),
      object: document.getElementById("objectA"),
      visual: document.getElementById("objectAVisual"),
      impact: document.getElementById("impactA"),
      dataName: document.getElementById("dataNameA"),
      velocity: document.getElementById("velocityA"),
      height: document.getElementById("heightA"),
      accel: document.getElementById("accelA"),
      status: document.getElementById("statusA")
    },
    b: {
      select: document.getElementById("objectBSelect"),
      name: document.getElementById("objectBName"),
      drag: document.getElementById("objectBDrag"),
      tube: document.getElementById("tubeB"),
      atmosphere: document.getElementById("tubeAtmosphereB"),
      object: document.getElementById("objectB"),
      visual: document.getElementById("objectBVisual"),
      impact: document.getElementById("impactB"),
      dataName: document.getElementById("dataNameB"),
      velocity: document.getElementById("velocityB"),
      height: document.getElementById("heightB"),
      accel: document.getElementById("accelB"),
      status: document.getElementById("statusB")
    }
  }
};

function formatNumber(value, digits = 2) {
  return value.toFixed(digits);
}

function getPlanet() {
  return PLANETS[state.planet];
}

function getObject(slotKey) {
  return OBJECTS[state.objects[slotKey].key];
}

function getDrag(slotKey) {
  return state.environment === "air" ? getObject(slotKey).drag : 0;
}

function getNetAcceleration(slotKey) {
  const gravity = getPlanet().gravity;
  return gravity * (1 - getDrag(slotKey));
}

function getImpactTime(slotKey) {
  const accel = getNetAcceleration(slotKey);
  return Math.sqrt((2 * DROP_HEIGHT_METERS) / accel);
}

function sampleState(slotKey, elapsedSeconds) {
  const accel = getNetAcceleration(slotKey);
  const impactTime = getImpactTime(slotKey);
  const clampedTime = Math.min(elapsedSeconds, impactTime);
  const distanceFallen = 0.5 * accel * clampedTime * clampedTime;
  const height = Math.max(DROP_HEIGHT_METERS - distanceFallen, 0);
  const velocity = accel * clampedTime;

  return {
    accel,
    impactTime,
    distanceFallen,
    height,
    velocity,
    landed: elapsedSeconds >= impactTime
  };
}

function getStagePosition(slotKey, heightMeters) {
  const slot = elements.slots[slotKey];
  const tubeHeight = slot.tube.clientHeight;
  const objectHeight = slot.object.offsetHeight || 88;
  const topPadding = 18;
  const bottomPadding = 18;
  const travel = tubeHeight - objectHeight - topPadding - bottomPadding;
  const distanceRatio = (DROP_HEIGHT_METERS - heightMeters) / DROP_HEIGHT_METERS;
  return topPadding + travel * distanceRatio;
}

function showImpact(slotKey, active) {
  const impact = elements.slots[slotKey].impact;
  impact.classList.toggle("active", active);
}

function updateObjectSelection(slotKey) {
  const slot = elements.slots[slotKey];
  const objectDef = getObject(slotKey);

  slot.visual.innerHTML = objectDef.svg;
  slot.name.textContent = objectDef.label;
  slot.drag.textContent = `Cd ${formatNumber(objectDef.drag)}`;
  slot.dataName.textContent = objectDef.label;
}

function updateBenchReadouts() {
  const planet = getPlanet();
  const airEnabled = state.environment === "air";

  elements.envTag.textContent = airEnabled ? "Air" : "Vacuum";
  elements.planetBadge.textContent = `Planet: ${planet.label}`;
  elements.gravityBadge.textContent = `${formatNumber(planet.gravity)} m/s^2`;
  elements.modelBadge.textContent = airEnabled ? "Simple drag model" : "Ideal vacuum";
  elements.planetReadout.textContent = planet.label;
  elements.environmentReadout.textContent = airEnabled ? "Air" : "Vacuum";
  elements.gravityReadout.textContent = `${formatNumber(planet.gravity)} m/s^2`;
  elements.heightBadge.textContent = `${formatNumber(DROP_HEIGHT_METERS)} m`;

  SLOT_KEYS.forEach((slotKey) => {
    elements.slots[slotKey].atmosphere.classList.toggle("active", airEnabled);
  });
}

function updateInsight() {
  const planet = getPlanet();
  const airEnabled = state.environment === "air";
  const sampleA = sampleState("a", 0);
  const sampleB = sampleState("b", 0);
  const objectA = getObject("a");
  const objectB = getObject("b");

  if (!airEnabled) {
    elements.insight.textContent =
      `Vacuum mode removes drag entirely, so ${objectA.label} and ${objectB.label} both use a = ${formatNumber(planet.gravity)} m/s^2 and reach the floor together.`;
    return;
  }

  elements.insight.textContent =
    `${objectA.label} uses Cd ${formatNumber(objectA.drag)} for a_eff = ${formatNumber(sampleA.accel)} m/s^2, while ${objectB.label} uses Cd ${formatNumber(objectB.drag)} for a_eff = ${formatNumber(sampleB.accel)} m/s^2.`;
}

function updateTelemetry(slotKey, sample, elapsedSeconds) {
  const slot = elements.slots[slotKey];
  const status = !state.running && elapsedSeconds === 0
    ? "Ready"
    : sample.landed
      ? "Landed"
      : "Falling";

  slot.velocity.textContent = `${formatNumber(sample.velocity)} m/s`;
  slot.height.textContent = `${formatNumber(sample.height)} m`;
  slot.accel.textContent = `${formatNumber(sample.accel)} m/s^2`;
  slot.status.textContent = status;
}

function renderFrame(elapsedSeconds) {
  elements.timeReadout.textContent = `${formatNumber(elapsedSeconds)} s`;

  SLOT_KEYS.forEach((slotKey) => {
    const slot = elements.slots[slotKey];
    const sample = sampleState(slotKey, elapsedSeconds);
    const yPosition = getStagePosition(slotKey, sample.height);

    slot.object.style.top = `${yPosition}px`;
    updateTelemetry(slotKey, sample, elapsedSeconds);

    if (sample.landed && !state.objects[slotKey].impactShown) {
      state.objects[slotKey].impactShown = true;
      showImpact(slotKey, true);
      window.setTimeout(() => showImpact(slotKey, false), 220);
    }
  });
}

function resetSimulation() {
  state.running = false;
  state.elapsed = 0;
  state.dropStart = 0;

  if (state.rafId) {
    cancelAnimationFrame(state.rafId);
    state.rafId = null;
  }

  SLOT_KEYS.forEach((slotKey) => {
    state.objects[slotKey].impactShown = false;
    showImpact(slotKey, false);
  });

  renderFrame(0);
}

function updateLandingInsight() {
  const airEnabled = state.environment === "air";
  const objectA = getObject("a");
  const objectB = getObject("b");
  const impactA = getImpactTime("a");
  const impactB = getImpactTime("b");

  if (!airEnabled) {
    elements.insight.textContent =
      `${objectA.label} and ${objectB.label} landed together in ${formatNumber(impactA)} s because vacuum mode keeps the acceleration identical.`;
    return;
  }

  const slower = impactA > impactB ? objectA.label : objectB.label;
  elements.insight.textContent =
    `${objectA.label} lands in ${formatNumber(impactA)} s and ${objectB.label} lands in ${formatNumber(impactB)} s. ${slower} stays in the air longer because its drag coefficient reduces the net acceleration more strongly.`;
}

function loop(timestamp) {
  state.elapsed = (timestamp - state.dropStart) / 1000;
  renderFrame(state.elapsed);

  const allLanded = SLOT_KEYS.every((slotKey) => sampleState(slotKey, state.elapsed).landed);

  if (allLanded) {
    state.running = false;
    state.rafId = null;
    updateLandingInsight();
    return;
  }

  state.rafId = requestAnimationFrame(loop);
}

function dropObjects() {
  if (state.running) {
    return;
  }

  SLOT_KEYS.forEach((slotKey) => {
    state.objects[slotKey].impactShown = false;
    showImpact(slotKey, false);
  });

  updateInsight();
  state.running = true;
  state.dropStart = performance.now();
  state.rafId = requestAnimationFrame(loop);
}

function applyControlChange() {
  state.planet = elements.planetSelect.value;
  state.environment = elements.airToggle.checked ? "air" : "vacuum";
  state.objects.a.key = elements.slots.a.select.value;
  state.objects.b.key = elements.slots.b.select.value;

  SLOT_KEYS.forEach(updateObjectSelection);
  updateBenchReadouts();
  updateInsight();
  resetSimulation();
}

function bindEvents() {
  elements.dropButton.addEventListener("click", dropObjects);
  elements.resetButton.addEventListener("click", () => {
    updateInsight();
    resetSimulation();
  });

  elements.planetSelect.addEventListener("change", applyControlChange);
  elements.airToggle.addEventListener("change", applyControlChange);
  elements.slots.a.select.addEventListener("change", applyControlChange);
  elements.slots.b.select.addEventListener("change", applyControlChange);
  window.addEventListener("resize", () => renderFrame(state.elapsed));
}

function init() {
  elements.slots.a.select.value = state.objects.a.key;
  elements.slots.b.select.value = state.objects.b.key;

  SLOT_KEYS.forEach(updateObjectSelection);
  updateBenchReadouts();
  updateInsight();
  bindEvents();
  resetSimulation();
}

init();
