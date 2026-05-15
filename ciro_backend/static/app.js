// ============================================
// CIRO Dashboard — app.js
// Connects to FastAPI backend, drives the UI
// ============================================

const API_BASE = "http://localhost:8000";

// ---- CLOCK ----
function updateClock() {
  document.getElementById("clock").textContent = new Date().toLocaleTimeString("en-PK", {
    hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true
  });
}
setInterval(updateClock, 1000);
updateClock();

// ---- SCENARIO DATA ----
const SCENARIOS = {
  1: {
    signals: [
      {
        source: "social_media",
        text: "MAJOR FLOODING IN G-10 RIGHT NOW!! Water everywhere, streets submerged!! #Peshawar #Flood",
        timestamp: "2024-05-14T14:00:00Z",
        credibility_indicator: "unverified Twitter user, hype language, all caps, no GPS"
      },
      {
        source: "emergency_call",
        text: "Multiple panicking callers reporting water on streets in G-10. Some say pipe burst.",
        timestamp: "2024-05-14T14:05:00Z",
        credibility_indicator: "unverified callers, high anxiety, vague location"
      },
      {
        source: "official_sensor",
        text: "Water pressure sensor 01: Critical pressure drop in main line. No area-wide water level rise. Suggests pipe burst NOT surface flooding.",
        timestamp: "2024-05-14T14:03:00Z",
        credibility_indicator: "official_sensor_high_accuracy, real-time data"
      },
      {
        source: "traffic_map",
        text: "Severe localized congestion near main bazaar in G-10. Cars re-routing. Possible road obstruction.",
        timestamp: "2024-05-14T14:10:00Z",
        credibility_indicator: "crowd_sourced_traffic_data, medium accuracy"
      },
      {
        source: "weather_api",
        text: "No significant rainfall in G-10. Temperature spike to 46°C in southern districts. Severe heat warning active.",
        timestamp: "2024-05-14T14:12:00Z",
        credibility_indicator: "official_weather_forecast, high accuracy"
      }
    ],
    resources: {
      ambulances: { total: 8, available: 8 },
      police_units: { total: 12, available: 12 },
      rescue_teams: { total: 2, available: 2 },
      water_tankers: { total: 4, available: 4 }
    }
  },
  2: {
    signals: [
      {
        source: "social_media",
        text: "FIRE at the factory near industrial zone!! Huge smoke cloud visible!! #Peshawar",
        timestamp: "2024-05-14T14:00:00Z",
        credibility_indicator: "unverified social post, low credibility, cached offline"
      },
      {
        source: "emergency_call",
        text: "Caller reports heavy smoke from factory near industrial area. Traffic stopped. Sounds like a fire.",
        timestamp: "2024-05-14T14:05:00Z",
        credibility_indicator: "direct caller, medium credibility"
      },
      {
        source: "traffic_map",
        text: "Industrial zone road completely blocked. All traffic diverted. Multiple users reporting smoke.",
        timestamp: "2024-05-14T14:08:00Z",
        credibility_indicator: "crowd_sourced_traffic_data, medium accuracy"
      }
    ],
    resources: {
      ambulances: { total: 4, available: 4 },
      police_units: { total: 6, available: 6 },
      rescue_teams: { total: 1, available: 1 },
      water_tankers: { total: 2, available: 2 }
    }
  }
};

let currentScenario = 1;

// ---- LOAD SCENARIO ----
function loadScenario(num) {
  currentScenario = num;
  document.querySelectorAll(".btn-scenario").forEach((b, i) => {
    b.classList.toggle("active", i + 1 === num);
  });

  const { signals, resources } = SCENARIOS[num];

  // Render signals
  const list = document.getElementById("signals-list");
  list.innerHTML = signals.map(s => `
    <div class="signal-card">
      <div class="signal-source ${s.source}">${sourceLabel(s.source)}</div>
      <div class="signal-text">${s.text}</div>
    </div>
  `).join("");

  // Update resources
  document.getElementById("r-amb").textContent = resources.ambulances.available;
  document.getElementById("r-pol").textContent = resources.police_units.available;
  document.getElementById("r-res").textContent = resources.rescue_teams.available;
  document.getElementById("r-tan").textContent = resources.water_tankers.available;

  // Reset results
  document.getElementById("idle-state").classList.remove("hidden");
  document.getElementById("results-state").classList.add("hidden");
  document.getElementById("agent-trace-log").innerHTML = '<div class="trace-idle">Pipeline idle. Run orchestration to see traces.</div>';
}

function sourceLabel(src) {
  const labels = {
    social_media: "📱 Social Media",
    official_sensor: "📡 Official Sensor",
    weather_api: "🌤️ Weather API",
    traffic_map: "🗺️ Traffic Map",
    emergency_call: "☎️ Emergency Call"
  };
  return labels[src] || src;
}

// ---- TRACE LOG ----
function addTrace(agentName, message, state = "running") {
  const log = document.getElementById("agent-trace-log");
  if (log.querySelector(".trace-idle")) log.innerHTML = "";

  const entry = document.createElement("div");
  entry.className = `trace-entry ${state}`;
  entry.id = `trace-${agentName}`;
  entry.innerHTML = `
    <div class="trace-agent">${state === "running" ? "⏳" : state === "done" ? "✅" : "❌"} ${agentName}</div>
    <div class="trace-msg">${message}</div>
    <div class="trace-time">${new Date().toLocaleTimeString()}</div>
  `;
  log.appendChild(entry);
  log.scrollTop = log.scrollHeight;
}

function updateTrace(agentName, message, state) {
  const entry = document.getElementById(`trace-${agentName}`);
  if (!entry) return addTrace(agentName, message, state);
  entry.className = `trace-entry ${state}`;
  entry.innerHTML = `
    <div class="trace-agent">${state === "running" ? "⏳" : state === "done" ? "✅" : "❌"} ${agentName}</div>
    <div class="trace-msg">${message}</div>
    <div class="trace-time">${new Date().toLocaleTimeString()}</div>
  `;
}

// ---- RENDER RESULTS ----
function renderResults(traces) {
  const { signal_fusion: fusion, classification: cls, allocation, notification, simulation } = traces;

  document.getElementById("idle-state").classList.add("hidden");
  document.getElementById("results-state").classList.remove("hidden");

  // --- Classification ---
  const severity = cls?.severity || "—";
  document.getElementById("crisis-type").textContent = `${cls?.crisis_type || "—"} — ${cls?.crisis_subtype || ""}`;
  document.getElementById("confidence").textContent = cls?.confidence?.overall_confidence
    ? `${(cls.confidence.overall_confidence * 100).toFixed(0)}%`
    : "—";
  document.getElementById("affected-pop").textContent = cls?.affected_zone?.affected_population?.toLocaleString() || "—";
  document.getElementById("expected-dur").textContent = cls?.expected_duration || "—";

  const sevBadge = document.getElementById("severity-badge");
  sevBadge.textContent = severity;
  sevBadge.className = `severity-badge sev-${severity}`;

  const cascadeEl = document.getElementById("cascade-risks");
  cascadeEl.innerHTML = (cls?.cascade_risks || []).map(r => `<span class="tag">${r}</span>`).join("");

  // --- Signal Fusion ---
  const fusionBody = document.getElementById("fusion-signals-body");
  fusionBody.innerHTML = (fusion?.fused_signals || []).map(s => {
    const pct = Math.round((s.credibility || 0) * 100);
    const color = pct >= 75 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
    return `
      <div class="fusion-signal-row">
        <div style="flex:1">
          <div class="signal-source ${s.source?.toLowerCase().replace(' ','_')}">${sourceLabel(s.source)}</div>
          <div class="signal-text" style="margin-top:4px">${s.text || s.reason || ""}</div>
        </div>
        <div class="cred-bar-wrap">
          <div class="cred-label">${pct}% cred</div>
          <div class="cred-bar"><div class="cred-fill" style="width:${pct}%;background:${color}"></div></div>
        </div>
      </div>`;
  }).join("") || "<div style='font-size:12px;color:var(--text-muted)'>No fusion data.</div>";

  const contraBox = document.getElementById("contradictions-section");
  if (fusion?.contradictions?.length) {
    contraBox.classList.remove("hidden");
    document.getElementById("contradiction-text").textContent =
      fusion.contradictions.map(c => c.contradiction).join(" | ");
  } else {
    contraBox.classList.add("hidden");
  }

  // --- Allocation ---
  const allocBody = document.getElementById("allocation-body");
  allocBody.innerHTML = (allocation?.allocation_plan || []).map(plan => {
    const resChips = Object.entries(plan.allocated_resources || {})
      .filter(([, v]) => v > 0)
      .map(([k, v]) => `<span class="alloc-chip">${v} ${k.replace(/_/g," ")}</span>`)
      .join("");
    return `
      <div class="alloc-incident-block">
        <div class="alloc-title">Priority ${plan.priority_rank}: ${plan.crisis_type} — Score ${plan.priority_score?.toFixed(2)}</div>
        <div class="alloc-resources">${resChips}</div>
        <div style="font-size:11px;color:var(--text-muted);margin-top:6px">⏱ ETA: ${plan.estimated_response_time} | Coverage: ${plan.coverage_vulnerable_pop}</div>
      </div>`;
  }).join("") || "<div style='font-size:12px;color:var(--text-muted)'>No allocation data.</div>";

  // --- Notifications ---
  const notifBody = document.getElementById("notification-body");
  notifBody.innerHTML = (notification?.notification_plan || []).map(n => `
    <div class="notif-row">
      <div class="notif-audience">${n.audience}</div>
      <div style="flex:1;font-size:11px;color:var(--text-muted)">${n.delivery_method || ""}</div>
      <div class="notif-status">${n.status || "READY"}</div>
    </div>`
  ).join("") || "<div style='font-size:12px;color:var(--text-muted)'>No notification data.</div>";
}

// ---- MAIN: RUN ORCHESTRATION ----
async function runOrchestration() {
  const btn = document.getElementById("orchestrate-btn");
  const btnText = document.getElementById("btn-text");
  const statusBadge = document.getElementById("system-status");

  btn.disabled = true;
  btnText.textContent = "⏳ Running Agents...";
  statusBadge.className = "status-badge status-loading";
  statusBadge.textContent = "● PROCESSING";

  // Reset trace
  document.getElementById("agent-trace-log").innerHTML = "";
  document.getElementById("idle-state").classList.remove("hidden");
  document.getElementById("results-state").classList.add("hidden");

  const { signals, resources } = SCENARIOS[currentScenario];

  // Show staged traces
  addTrace("Signal Fusion Agent", "Normalizing & scoring source credibility...", "running");

  try {
    const res = await fetch(`${API_BASE}/orchestrate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signals, resources })
    });

    if (!res.ok) throw new Error(`Server error ${res.status}`);
    const traces = await res.json();

    // Animate traces
    updateTrace("Signal Fusion Agent", "Fused signals, detected contradictions, scored credibility.", "done");

    setTimeout(() => addTrace("Crisis Classifier Agent", "Classified crisis type & severity with confidence scoring.", "done"), 300);
    setTimeout(() => addTrace("Severity Prediction Agent", "Modelled crisis evolution timeline & uncertainty ranges.", "done"), 600);
    setTimeout(() => addTrace("Resource Allocator Agent", "Solved multi-crisis resource optimization problem.", "done"), 900);
    setTimeout(() => addTrace("Action Simulator Agent", "Simulated before/after state for each action.", "done"), 1200);
    setTimeout(() => addTrace("Notifier Agent", "Generated staged stakeholder notification plan.", "done"), 1500);
    setTimeout(() => {
      addTrace("Verification Agent", "Monitoring for contradictions. Will retract if confidence drops below 50%.", "done");
      renderResults(traces);
      btn.disabled = false;
      btnText.textContent = "▶ Run CIRO Orchestration";
      statusBadge.className = "status-badge status-online";
      statusBadge.textContent = "● SYSTEM ONLINE";
    }, 1800);

  } catch (err) {
    updateTrace("Signal Fusion Agent", `Error: ${err.message}`, "error");
    addTrace("Orchestrator", "Failed to reach backend. Is the FastAPI server running on port 8000?", "error");
    btn.disabled = false;
    btnText.textContent = "▶ Run CIRO Orchestration";
    statusBadge.className = "status-badge status-online";
    statusBadge.textContent = "● SYSTEM ONLINE";
  }
}

// ---- INIT ----
loadScenario(1);
