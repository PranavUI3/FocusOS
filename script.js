const KEYS = {
  sessions: "focusos_sessions",
  tasks: "focusos_tasks",
  distractions: "focusos_distractions",
  reflections: "focusos_reflections"
};

let timerId = null;
let totalSecs = 25 * 60;
let leftSecs = totalSecs;

const today = () => new Date().toISOString().split("T")[0];
const getData = (k) => JSON.parse(localStorage.getItem(k)) || [];
const setData = (k, v) => localStorage.setItem(k, JSON.stringify(v));

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  });

  document.getElementById("durationInput").addEventListener("change", () => {
    if (!timerId) resetTimer();
  });

  document.getElementById("startBtn").addEventListener("click", startTimer);
  document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
  document.getElementById("resetBtn").addEventListener("click", resetTimer);
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document.getElementById("logDistractionBtn").addEventListener("click", logDistraction);
  document.getElementById("saveJournalBtn").addEventListener("click", saveReflection);

  updateTimerUI();
  renderAll();
});

function renderAll() {
  renderTasks();
  renderDistractions();
  loadReflection();
  updateMetrics();
  renderAnalytics();
}

// --- FOCUS TIMER ---
function updateTimerUI() {
  const m = String(Math.floor(leftSecs / 60)).padStart(2, "0");
  const s = String(leftSecs % 60).padStart(2, "0");
  document.getElementById("timerDisplay").textContent = `${m}:${s}`;

  const pct = ((totalSecs - leftSecs) / totalSecs) * 100;
  document.getElementById("timerProgress").style.width = `${pct}%`;
}

function startTimer() {
  if (timerId) return;
  const subject = document.getElementById("subjectSelect").value;
  if (!subject) return alert("Choose a subject first.");

  document.getElementById("durationInput").disabled = true;
  timerId = setInterval(() => {
    if (leftSecs > 0) {
      leftSecs--;
      updateTimerUI();
    } else {
      clearInterval(timerId);
      timerId = null;
      document.getElementById("durationInput").disabled = false;

      const mins = Math.max(1, Math.round(totalSecs / 60));
      const sessions = getData(KEYS.sessions);
      sessions.push({ subject, mins, date: today() });
      setData(KEYS.sessions, sessions);

      alert(`Completed ${mins}m in ${subject}!`);
      resetTimer();
      updateMetrics();
      renderAnalytics();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerId);
  timerId = null;
  document.getElementById("durationInput").disabled = false;
}

function resetTimer() {
  pauseTimer();
  const mins = Math.min(180, Math.max(1, Number(document.getElementById("durationInput").value) || 25));
  totalSecs = mins * 60;
  leftSecs = totalSecs;
  updateTimerUI();
}

// --- TASKS ---
function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;

  const tasks = getData(KEYS.tasks);
  tasks.push({ id: Date.now(), text, done: false });
  setData(KEYS.tasks, tasks);
  input.value = "";
  renderTasks();
  updateMetrics();
}

function toggleTask(id) {
  const tasks = getData(KEYS.tasks).map((t) => (t.id === id ? { ...t, done: !t.done } : t));
  setData(KEYS.tasks, tasks);
  renderTasks();
  updateMetrics();
}

function deleteTask(id) {
  const tasks = getData(KEYS.tasks).filter((t) => t.id !== id);
  setData(KEYS.tasks, tasks);
  renderTasks();
  updateMetrics();
}

function renderTasks() {
  const tasks = getData(KEYS.tasks);
  const list = document.getElementById("taskList");
  document.getElementById("taskEmpty").classList.toggle("d-none", tasks.length > 0);

  list.innerHTML = tasks.map((t) => `
    <li class="list-group-item d-flex justify-content-between align-items-center">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" ${t.done ? "checked" : ""} onchange="toggleTask(${t.id})">
        <label class="form-check-label ${t.done ? "text-decoration-line-through text-muted" : ""}">${t.text}</label>
      </div>
      <button class="btn btn-sm btn-outline-danger" onclick="deleteTask(${t.id})"><i class="bi bi-trash"></i></button>
    </li>
  `).join("");
}

// --- DISTRACTIONS ---
function logDistraction() {
  const category = document.getElementById("distractionCategory").value;
  const items = getData(KEYS.distractions);
  items.push({
    category,
    date: today(),
    time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  });
  setData(KEYS.distractions, items);
  renderDistractions();
  updateMetrics();
}

function renderDistractions() {
  const todayItems = getData(KEYS.distractions).filter((d) => d.date === today());
  const list = document.getElementById("distractionList");
  document.getElementById("distractionEmpty").classList.toggle("d-none", todayItems.length > 0);

  list.innerHTML = todayItems.slice(-5).reverse().map((d) => `
    <li class="list-group-item d-flex justify-content-between align-items-center py-2">
      <span><i class="bi bi-exclamation-circle text-warning me-2"></i>${d.category}</span>
      <span class="text-muted small">${d.time}</span>
    </li>
  `).join("");
}

// --- REFLECTION ---
function saveReflection() {
  const learned = document.getElementById("learnedInput").value.trim();
  const confused = document.getElementById("confusedInput").value.trim();
  const improve = document.getElementById("improveInput").value.trim();
  if (!learned && !confused && !improve) return alert("Write at least one reflection point.");

  const list = getData(KEYS.reflections).filter((r) => r.date !== today());
  list.push({ date: today(), learned, confused, improve });
  setData(KEYS.reflections, list);

  const msg = document.getElementById("journalSavedMsg");
  msg.classList.remove("d-none");
  setTimeout(() => msg.classList.add("d-none"), 2500);
}

function loadReflection() {
  const item = getData(KEYS.reflections).find((r) => r.date === today());
  if (!item) return;
  document.getElementById("learnedInput").value = item.learned || "";
  document.getElementById("confusedInput").value = item.confused || "";
  document.getElementById("improveInput").value = item.improve || "";
}

// --- METRICS & ANALYTICS ---
function updateMetrics() {
  const sessions = getData(KEYS.sessions);
  const tasks = getData(KEYS.tasks);
  const distractions = getData(KEYS.distractions);

  const totalMins = sessions.reduce((sum, s) => sum + (s.mins || 0), 0);
  document.getElementById("totalStudyTime").textContent = `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;

  const todayDist = distractions.filter((d) => d.date === today()).length;
  const eff = Math.max(35, 100 - todayDist * 12);
  document.getElementById("focusEfficiency").textContent = `${sessions.length || todayDist ? eff : 100}%`;

  document.getElementById("tasksLeft").textContent = tasks.filter((t) => !t.done).length;

  const todayCount = sessions.filter((s) => s.date === today()).length;
  document.getElementById("todayLog").textContent = `${todayCount} ${todayCount === 1 ? "session" : "sessions"}`;
}

function renderAnalytics() {
  const sessions = getData(KEYS.sessions);
  const box = document.getElementById("subjectBreakdown");
  document.getElementById("breakdownEmpty").classList.toggle("d-none", sessions.length > 0);

  const totals = {};
  sessions.forEach((s) => { totals[s.subject] = (totals[s.subject] || 0) + s.mins; });
  const maxVal = Math.max(...Object.values(totals), 60);

  box.innerHTML = Object.entries(totals).map(([subj, mins]) => `
    <div class="mb-2">
      <div class="d-flex justify-content-between small mb-1"><span>${subj}</span><span>${mins}m</span></div>
      <div class="progress" style="height: 8px;">
        <div class="progress-bar" style="width: ${Math.round((mins / maxVal) * 100)}%"></div>
      </div>
    </div>
  `).join("");

  const heatmap = document.getElementById("weeklyHeatmap");
  let weekMins = 0;
  let cells = "";

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "narrow" });
    const mins = sessions.filter((s) => s.date === key).reduce((sum, s) => sum + s.mins, 0);
    weekMins += mins;

    const color = mins > 60 ? "bg-success text-white" : mins > 0 ? "bg-info text-dark" : "bg-light text-muted";
    cells += `<div class="flex-fill text-center p-2 rounded border ${color}"><div class="small fw-bold">${dayLabel}</div><div class="small">${mins}m</div></div>`;
  }

  heatmap.innerHTML = cells;
  document.getElementById("weeklySummary").textContent =
    `Last 7 days total: ${Math.floor(weekMins / 60)}h ${weekMins % 60}m`;
}