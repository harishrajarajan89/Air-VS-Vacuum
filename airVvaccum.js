// the 8px gap stops the object clipping into the floor div
const TUBE_H= 400;
const OBJ_H = 44;
const FLOOR = TUBE_H - OBJ_H - 8;
const TOP = 14;    
const G= 0.42;
let airOn = false;
let tick= 0;
let raf =null;

// grabbing all the elements i need upfront so i dont query the DOM every frame
const fObj = document.getElementById('feather-obj');
const sObj  = document.getElementById('stone-obj');
const fSplsh= document.getElementById('feather-splash');
const sSplsh  = document.getElementById('stone-splash');
const fSpd = document.getElementById('f-speed');
const sSpd=document.getElementById('s-speed');
const fDrg =document.getElementById('f-drag');
const ins= document.getElementById('insight');
const dragFW= document.getElementById('fvec-drag-f');
const dragSW = document.getElementById('fvec-drag-s');
const dArrF= document.getElementById('drag-arrow-f');
const dArrS = document.getElementById('drag-arrow-s');
const airParts = document.getElementById('air-particles');
const featherG = document.getElementById('feather-g');

// state object for both objects
// y = position, vy = velocity, drift/driftV = sideways wobble for the feather
// active = currently falling, landed = hit the floor
let st = {
  feather: { y: TOP, vy: 0, drift: 0, driftV: 0, active: false, landed: false },
  stone:   { y: TOP, vy: 0, drift: 0, driftV: 0, active: false, landed: false },
};

// spawn 24 random dots inside the feather tube to represent air molecules
// they start invisible (vacuum) and fade in when you switch to atmosphere
(function () {
  for (let i = 0; i < 24; i++) {
    const d = document.createElement('div');
    d.className = 'particle';
    d.style.cssText = [
      `left:${Math.random() * 100}%`,
      `top:${Math.random() * 100}%`,
      `width:${(1.5 + Math.random() * 2).toFixed(1)}px`,
      `height:${(1.5 + Math.random() * 2).toFixed(1)}px`,
      `background:rgba(${140 + (Math.random() * 60 | 0)},${180 + (Math.random() * 40 | 0)},${220 + (Math.random() * 35 | 0)},1)`,
    ].join(';');
    airParts.appendChild(d);
  }
})();

// runs when the toggle is flipped, switches between vacuum and atmosphere
function toggleAir() {
  airOn = document.getElementById('airToggle').checked;
  const tag = document.getElementById('envTag');
  tag.textContent = airOn ? 'Atmosphere' : 'Vacuum';
  tag.className   = 'etag ' + (airOn ? 'tatm' : 'tvac');
  airParts.className = airOn ? 'ap' : 'vp';
  // hide the drag arrows when going back to vacuum
  if (!airOn) {
    dragFW.style.opacity = '0';
    dragSW.style.opacity = '0';
  }
}

// drop button - only activates objects that havent landed yet
// so you can drop mid-reset without breaking anything
function dropBoth() {
  for (const n of ['feather', 'stone']) {
    if (!st[n].landed) st[n].active = true;
  }
  if (!raf) raf = requestAnimationFrame(loop);
  setIns('');
}

// puts everything back to the start
function resetAll() {
  cancelAnimationFrame(raf);
  raf  = null;
  tick = 0;

  for (const n of ['feather', 'stone']) {
    st[n] = { y: TOP, vy: 0, drift: 0, driftV: 0, active: false, landed: false };
  }

  posF(TOP, 0);
  posS(TOP);
  fSplsh.style.opacity = '0';
  sSplsh.style.opacity = '0';
  dragFW.style.opacity = '0';
  dragSW.style.opacity = '0';
  fSpd.textContent = '0.00';
  sSpd.textContent = '0.00';
  fDrg.textContent = '0.00';
  setIns('');
  if (featherG) featherG.setAttribute('transform', 'translate(22,22)');
}

// moves the feather and tilts the SVG based on how far it drifted sideways
function posF(y, drift) {
  fObj.style.top       = y + 'px';
  fObj.style.left      = `calc(50% + ${drift.toFixed(1)}px)`;
  fObj.style.transform = 'translateX(-50%)';
  if (featherG) featherG.setAttribute('transform', `translate(22,22) rotate(${(drift * 2.5).toFixed(1)})`);
}

// stone just moves straight down, no drift
function posS(y) {
  sObj.style.top       = y + 'px';
  sObj.style.left      = '50%';
  sObj.style.transform = 'translateX(-50%)';
}

// resizes the Fr arrow to show how much drag is happening
// longer arrow = more air resistance
function setDragArrow(svgEl, wrapEl, size) {
  const h  = Math.max(6, Math.min(44, size));
  const ln = svgEl.querySelector('line');
  svgEl.setAttribute('height', h + 4);
  if (ln) { ln.setAttribute('y1', h + 2); ln.setAttribute('y2', 4); }
  wrapEl.style.opacity = size > 0.5 ? '1' : '0';
}

// the main physics loop, called every frame by requestAnimationFrame
// does gravity + drag then updates 
function loop() {
  tick++;
  let any = false;
  const f = st.feather;
  const s = st.stone;

  // feather drag is 0.11 because it has a huge surface area
  if (f.active && !f.landed) {
    any = true;
    const drag = airOn ? 0.11 : 0;
    f.vy += G;
    f.vy *= (1 - drag);

    if (airOn) {
      f.driftV += Math.sin(tick * 0.09) * 0.55;
      f.driftV *= 0.88;
      f.drift  += f.driftV;
      f.drift   = Math.max(-26, Math.min(26, f.drift)); // clamp so it doesnt fly off screen
    } else {
      f.drift = 0;
    }

    f.y += f.vy;
    if (f.y >= FLOOR) { f.y = FLOOR; f.landed = true; f.active = false; splash('feather'); }
    posF(f.y, f.drift);

    fSpd.textContent = (f.vy * 0.18).toFixed(2);
    const dm = airOn ? Math.min(1, f.vy * drag * 12) : 0;
    fDrg.textContent= dm.toFixed(2);

    if (airOn) { dragFW.style.opacity = '1'; setDragArrow(dArrF, dragFW, dm * 38); }
    else dragFW.style.opacity='0';
  }

  // stone drag is only 0.018, dense and small so air will not affects it
  if (s.active && !s.landed) {
    any = true;
    const drag = airOn ? 0.018 : 0;
    s.vy += G;
    s.vy *= (1 - drag);
    s.y  += s.vy;

    if (s.y >= FLOOR) { s.y = FLOOR; s.landed = true; s.active = false; splash('stone'); }
    posS(s.y);
    sSpd.textContent = (s.vy * 0.18).toFixed(2);

    if (airOn && !s.landed) { dragSW.style.opacity = '1'; setDragArrow(dArrS, dragSW, Math.min(1, s.vy * drag * 8) * 16); }
    else dragSW.style.opacity = '0';
  }

  if (any) raf = requestAnimationFrame(loop);
  else { raf = null; done(); }
}

// shows the impact burst for 750ms
function splash(n) {
  const el = document.getElementById(n + '-splash');
  el.style.opacity = '1';
  setTimeout(() => el.style.opacity ='0',750);
}

// called once both objects have landed shows the explanation
function done() {
  const f = st.feather;
  const s = st.stone;
  if (f.landed && s.landed) {
    setIns(
      airOn
        ? 'The feather has a large surface area — air molecules push back hard against it (Fr), drastically slowing it down. The dense stone cuts through with almost no drag.'
        : 'Both objects hit the ground at exactly the same time! In a vacuum, gravity gives every object the same acceleration (g = 9.8 m/s²) regardless of mass.',
      true
    );
  }
}
function setIns ( t, on) {
  ins.textContent = t;
  ins.className   = 'insight' + (on ? ' on' : '');
}

// sxfduhys zdiuxdf ioohjxdr ikjhdsdfjoipoixfcfpoiujopxdfgpoiujjxdfolujjsdfoiujsef ikkjc 