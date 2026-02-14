document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const landing = document.getElementById("landing");
  const dashboard = document.getElementById("dashboard");

  const episodeOverlay = document.getElementById("episodeOverlay");
  const overlayResetBtn = document.getElementById("overlayResetBtn");
  const summaryReward = document.getElementById("summaryReward");
  const summarySteps = document.getElementById("summarySteps");

  const resetBtn = document.getElementById("resetBtn");
  const stepBtn = document.getElementById("stepBtn");
  const autoBtn = document.getElementById("autoBtn");

  const backBtn = document.getElementById("backBtn"); // may or may not exist

  const gridEl = document.getElementById("grid");

  const actionVal = document.getElementById("actionVal");
  const stateVal = document.getElementById("stateVal");
  const posVal = document.getElementById("posVal");
  const passengerVal = document.getElementById("passengerVal");
  const destVal = document.getElementById("destVal");

  const rewardVal = document.getElementById("rewardVal");
  const totalRewardVal = document.getElementById("totalRewardVal");
  const stepCountVal = document.getElementById("stepCountVal");
  const statusVal = document.getElementById("statusVal");

  const speedSlider = document.getElementById("speedSlider");

  let stepCount = 0;
  let totalReward = 0;
  let autoInterval = null;
  let isPaused = false;
  let hasStarted = false;
  let lastAction = null;

  const actionNames = ["South", "North", "East", "West", "Pickup", "Dropoff"];

  const locations = [
    { row: 0, col: 0 },
    { row: 0, col: 4 },
    { row: 4, col: 0 },
    { row: 4, col: 3 }
  ];

  function initGrid() {
    gridEl.innerHTML = "";
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = "cell-" + i;
      gridEl.appendChild(cell);
    }
  }

  function decodeState(state) {
    let s = state;
    const dest = s % 4;
    s = Math.floor(s / 4);
    const passenger = s % 5;
    s = Math.floor(s / 5);
    const col = s % 5;
    const row = Math.floor(s / 5);
    return { row, col, passenger, dest };
  }

  function render(state) {
    const { row, col, passenger, dest } = decodeState(state);

    // Clear grid
    for (let i = 0; i < 25; i++) {
      const c = document.getElementById("cell-" + i);
      c.textContent = "";
      c.className = "cell";
    }

    // Destination
    const d = locations[dest];
    const destIdx = d.row * 5 + d.col;
    const destCell = document.getElementById("cell-" + destIdx);
    destCell.textContent = "🏁";
    destCell.classList.add("destination");

    // Passenger (if not in taxi)
    if (passenger < 4) {
      const p = locations[passenger];
      const pIdx = p.row * 5 + p.col;
      const pCell = document.getElementById("cell-" + pIdx);
      pCell.textContent = "👤";
      pCell.classList.add("passenger");
    }

    // Taxi
    const taxiIdx = row * 5 + col;
    const taxiCell = document.getElementById("cell-" + taxiIdx);
    taxiCell.innerHTML = "";
    taxiCell.classList.add("taxi");

    const taxiSpan = document.createElement("span");
    taxiSpan.textContent = "🚕";
    taxiSpan.className = "taxi-icon";
    taxiCell.appendChild(taxiSpan);

    if (passenger === 4) {
      const passengerSpan = document.createElement("span");
      passengerSpan.textContent = "👤";
      passengerSpan.className = "passenger-on-taxi";
      taxiCell.appendChild(passengerSpan);
    }

    if (lastAction === 4 || lastAction === 5) {
      taxiCell.classList.add("flash-success");
      setTimeout(() => taxiCell.classList.remove("flash-success"), 600);
    }
    updateHeatmap();
  }

  function updateStats(action, state, reward, done) {
    actionVal.textContent = action === null ? "-" : actionNames[action];
    stateVal.textContent = state;

    const decoded = decodeState(state);
    posVal.textContent = `(${decoded.row}, ${decoded.col})`;

    if (decoded.passenger === 4) {
      passengerVal.textContent = "In Taxi";
    } else {
      passengerVal.textContent = `At Location ${decoded.passenger}`;
    }

    destVal.textContent = `Location ${decoded.dest}`;

    rewardVal.textContent = reward;
    totalRewardVal.textContent = totalReward;
    stepCountVal.textContent = stepCount;

    if (done) {
      statusVal.textContent = "FINISHED";
      statusVal.className = "finished";
      stepBtn.disabled = true;

      summaryReward.textContent = totalReward;
      summarySteps.textContent = stepCount;

      if (episodeOverlay) {
        setTimeout(() => {
          episodeOverlay.classList.add("active");
        }, 1400);
      }
    } else {
      if (!hasStarted) {
        statusVal.textContent = "READY";
        statusVal.className = "ready";
      } else {
        statusVal.textContent = "RUNNING";
        statusVal.className = "running";
      }
      stepBtn.disabled = false;
    }
  }

  async function resetEnv() {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }

    isPaused = false;
    hasStarted = false;
    autoBtn.textContent = "▶ Auto Run";

    if (episodeOverlay) {
      episodeOverlay.classList.remove("active");
    }

    stepCount = 0;
    totalReward = 0;
    lastAction = null;

    const res = await fetch("http://127.0.0.1:5000/reset");
    const data = await res.json();

    render(data.state);
    updateStats(null, data.state, 0, false);

    statusVal.textContent = "READY";
    statusVal.className = "ready";
  }

  async function stepEnv() {
    hasStarted = true;

    const res = await fetch("http://127.0.0.1:5000/step");
    const data = await res.json();

    lastAction = data.action;

    stepCount++;
    totalReward += data.reward;

    updateStats(data.action, data.next_state, data.reward, data.done);
    render(data.next_state);

    if (data.done && autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
      isPaused = false;
      autoBtn.textContent = "▶ Auto Run";
    }
  }

  // Wire buttons safely
  if (resetBtn) resetBtn.onclick = resetEnv;
  if (stepBtn) stepBtn.onclick = stepEnv;

  if (autoBtn) {
    autoBtn.onclick = () => {
      if (autoInterval && !isPaused) {
        clearInterval(autoInterval);
        autoInterval = null;
        isPaused = true;
        autoBtn.textContent = "▶ Resume";
        return;
      }

      if (isPaused) {
        const speed = parseInt(speedSlider.value);
        autoInterval = setInterval(stepEnv, speed);
        isPaused = false;
        autoBtn.textContent = "⏸ Pause";
        return;
      }

      const speed = parseInt(speedSlider.value);
      autoInterval = setInterval(stepEnv, speed);
      autoBtn.textContent = "⏸ Pause";
    };
  }

  if (overlayResetBtn) {
    overlayResetBtn.onclick = () => {
      if (episodeOverlay) episodeOverlay.classList.remove("active");
      resetEnv();
    };
  }

  // Back button (safe, won’t break if not present)
if (backBtn) {
  backBtn.onclick = () => {
    if (autoInterval) {
      clearInterval(autoInterval);
      autoInterval = null;
    }

    isPaused = false;
    hasStarted = false;

    if (episodeOverlay) {
      episodeOverlay.classList.remove("active");
    }

    // Fade out dashboard
    dashboard.classList.remove("active");

    // After fade-out, show landing
    setTimeout(() => {
      landing.classList.add("active");
    }, 450);
  };
}



  // Start Simulation button ✅
if (startBtn) {
  startBtn.onclick = () => {
    // Fade out landing
    landing.classList.remove("active");

    // After fade-out, show dashboard
    setTimeout(() => {
      dashboard.classList.add("active");
      initGrid();
      resetEnv();
    }, 450); // must match CSS transition time
  };
}

});
async function updateHeatmap() {
  const res = await fetch("http://127.0.0.1:5000/qvalues_map");
  const data = await res.json();

  const values = data.values;
  if (!values || values.length !== 25) return;

  const maxV = Math.max(...values);
  const minV = Math.min(...values);

  for (let i = 0; i < 25; i++) {
    const cell = document.getElementById("cell-" + i);
    if (!cell) continue;

    const v = values[i];

    // Normalize 0..1
    let t = (v - minV) / (maxV - minV + 1e-6);
    t = Math.max(0, Math.min(1, t));

    // Simple 3-zone coloring
    let bgColor;
    if (t < 0.33) {
      bgColor = "rgba(200, 40, 40, 0.5)";     // red = bad
    } else if (t < 0.66) {
      bgColor = "rgba(220, 180, 40, 0.5)";    // yellow = medium
    } else {
      bgColor = "rgba(40, 180, 80, 0.5)";     // green = good
    }

    // Apply background
    cell.style.background = bgColor;

    // Add / update value label
    let label = cell.querySelector(".qvalue-label");
    if (!label) {
      label = document.createElement("div");
      label.className = "qvalue-label";
      label.style.position = "absolute";
      label.style.bottom = "6px";
      label.style.right = "8px";
      label.style.fontSize = "12px";
      label.style.fontWeight = "600";
      label.style.color = "#ffffff";
      label.style.opacity = "0.9";
      label.style.pointerEvents = "none";
      cell.appendChild(label);
    }

    label.textContent = v.toFixed(1);
  }
}




