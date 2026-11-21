// LocalStorage Keys
const STORAGE_KEYS = {
  SESSIONS: "focusos_sessions",
  TASKS: "focusos_tasks",
  DISTRACTIONS: "focusos_distractions",
  REFLECTIONS: "focusos_reflections",
};

// Application State
let timerInterval = null;
let totalSeconds = 25 * 60;
let remainingSeconds = totalSeconds;
let isRunning = false;

// Initialize App on DOM Load
document.addEventListener("DOMContentLoaded", () => {
  displayTodayDate();
  loadTasks();
  loadDistractions();
  loadReflections();
  updateMetrics();
  renderAnalytics();
  setupEventListeners();
});

// 1. Display Today's Date in Navbar
function displayTodayDate() {
  const options = { weekday: "short", month: "short", day: "numeric" };
  const today = new Date().toLocaleDateString("en-US", options);
  document.getElementById("todayDate").textContent = today;
}
// 2. FOCUS TIMER ENGINE
function setupEventListeners() {
  const durationInput = document.getElementById("durationInput");
  const timerDisplay = document.getElementById("timerDisplay");
  const startBtn = document.getElementById("startBtn");
  const pauseBtn = document.getElementById("pauseBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Update timer display when user changes input duration
  durationInput.addEventListener("change", () => {
    if (!isRunning) {
      const mins = parseInt(durationInput.value) || 25;
      totalSeconds = mins * 60;
      remainingSeconds = totalSeconds;
      updateTimerDisplay();
    }
  });

  startBtn.addEventListener("click", startTimer);
  pauseBtn.addEventListener("click", pauseTimer);
  resetBtn.addEventListener("click", resetTimer);

  // Task Planner
  document.getElementById("addTaskBtn").addEventListener("click", addTask);
  document.getElementById("taskInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") addTask();
  });

  // Distraction Logger
  document
    .getElementById("logDistractionBtn")
    .addEventListener("click", logDistraction);

  // Journal
  document
    .getElementById("saveJournalBtn")
    .addEventListener("click", saveReflection);
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const displayString = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  document.getElementById("timerDisplay").textContent = displayString;

  // Update progress bar
  const progressPercent =
    ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const progressBar = document.getElementById("timerProgress");
  progressBar.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", progressPercent);
}

function startTimer() {
  const subject = document.getElementById("subjectSelect").value;
  if (!subject) {
    alert("Please choose a subject before starting the focus timer!");
    return;
  }

  if (isRunning) return;
  isRunning = document.getElementById("durationInput").disabled = true;

  timerInterval = setInterval(() => {
    if (remainingSeconds > 0) {
      remainingSeconds--;
      updateTimerDisplay();
    } else {
      clearInterval(timerInterval);
      isRunning = false;
      document.getElementById("durationInput").disabled = false;

      // Save completed session
      const durationMins = Math.round(totalSeconds / 60);
      saveSessionRecord(subject, durationMins);
      alert(
        `🎉 Great job! Focus session for ${subject} (${durationMins} mins) completed and logged.`,
      );
      resetTimer();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  document.getElementById("durationInput").disabled = false;
}

function resetTimer() {
  clearInterval(timerInterval);
  isRunning = false;
  document.getElementById("durationInput").disabled = false;
  const mins = parseInt(document.getElementById("durationInput").value) || 25;
  totalSeconds = mins * 60;
  remainingSeconds = totalSeconds;
  updateTimerDisplay();
}

function saveSessionRecord(subject, duration) {
  const sessions =
    JSON.parse(localStorage.getItem(STORAGE_KEYS.SESSIONS)) || [];
  sessions.push({
    id: Date.now(),
    subject: subject,
    duration: duration,
    date: new Date().toISOString().split("T")[0],
  });
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  updateMetrics();
  renderAnalytics();
}
// 3. TASK PLANNER LOGIC
function getStoredData(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setStoredData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function addTask() {
  const input = document.getElementById("taskInput");
  const text = input.value.trim();
  if (!text) return;

  const tasks = getStoredData(STORAGE_KEYS.TASKS);
  tasks.push({ id: Date.now(), text: text, completed: false });
  setStoredData(STORAGE_KEYS.TASKS, tasks);

  input.value = "";
  loadTasks();
  updateMetrics();
}

function loadTasks() {
  const tasks = getStoredData(STORAGE_KEYS.TASKS);
  const taskList = document.getElementById("taskList");
  const taskEmpty = document.getElementById("taskEmpty");

  taskList.innerHTML = "";
  if (tasks.length === 0) {
    taskEmpty.classList.remove("d-none");
  } else {
    taskEmpty.classList.add("d-none");
    tasks.forEach((task) => {
      const li = document.createElement("li");
      li.className =
        "list-group-item d-flex justify-content-between align-items-center";
      li.innerHTML = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="task-${task.id}" ${task.completed ? "checked" : ""} onclick="toggleTask(${task.id})">
                    <label class="form-check-label ${task.completed ? "text-decoration-line-through text-muted" : ""}" for="task-${task.id}">
                        ${escapeHTML(task.text)}
                    </label>
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="deleteTask(${task.id})"><i class="bi bi-trash"></i></button>
            `;
      taskList.appendChild(li);
    });
  }
  updateMetrics();
}

function toggleTask(id) {
  let tasks = getStoredData(STORAGE_KEYS.TASKS);
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );
  setStoredData(STORAGE_KEYS.TASKS, tasks);
  loadTasks();
}

function deleteTask(id) {
  let tasks = getStoredData(STORAGE_KEYS.TASKS);
  tasks = tasks.filter((t) => t.id !== id);
  setStoredData(STORAGE_KEYS.TASKS, tasks);
  loadTasks();
}
// 4. DISTRACTION LOGGER LOGIC
function logDistraction() {
  const category = document.getElementById("distractionCategory").value;
  const distractions = getStoredData(STORAGE_KEYS.DISTRACTIONS);

  distractions.push({
    id: Date.now(),
    category: category,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  setStoredData(STORAGE_KEYS.DISTRACTIONS, distractions);
  loadDistractions();
  updateMetrics();
}

function loadDistractions() {
  const distractions = getStoredData(STORAGE_KEYS.DISTRACTIONS);
  const list = document.getElementById("distractionList");
  const empty = document.getElementById("distractionEmpty");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayDistractions = distractions.filter((d) => d.date === todayStr);

  list.innerHTML = "";
  if (todayDistractions.length === 0) {
    empty.classList.remove("d-none");
  } else {
    empty.classList.add("d-none");
    todayDistractions
      .slice(-5)
      .reverse()
      .forEach((d) => {
        const li = document.createElement("li");
        li.className =
          "list-group-item d-flex justify-content-between align-items-center py-2";
        li.innerHTML = `
                <span><i class="bi bi-exclamation-circle text-warning me-2"></i>${escapeHTML(d.category)}</span>
                <span class="text-muted small">${d.time}</span>
            `;
        list.appendChild(li);
      });
  }
  updateMetrics();
}
// 5. DAILY REFLECTION JOURNAL LOGIC
function saveReflection() {
  const learned = document.getElementById("learnedInput").value.trim();
  const confused = document.getElementById("confusedInput").value.trim();
  const improve = document.getElementById("improveInput").value.trim();

  if (!learned && !confused && !improve) {
    alert("Please fill out at least one reflection field.");
    return;
  }

  const reflections = getStoredData(STORAGE_KEYS.REFLECTIONS);
  const todayStr = new Date().toISOString().split("T")[0];

  // Save or update today's reflection
  const existingIndex = reflections.findIndex((r) => r.date === todayStr);
  const entry = { date: todayStr, learned, confused, improve };

  if (existingIndex >= 0) {
    reflections[existingIndex] = entry;
  } else {
    reflections.push(entry);
  }

  setStoredData(STORAGE_KEYS.REFLECTIONS, reflections);

  const msg = document.getElementById("journalSavedMsg");
  msg.classList.remove("d-none");
  setTimeout(() => msg.classList.add("d-none"), 3000);
}

function loadReflections() {
  const reflections = getStoredData(STORAGE_KEYS.REFLECTIONS);
  const todayStr = new Date().toISOString().split("T")[0];
  const todayRef = reflections.find((r) => r.date === todayStr);

  if (todayRef) {
    document.getElementById("learnedInput").value = todayRef.learned || "";
    document.getElementById("confusedInput").value = todayRef.confused || "";
    document.getElementById("improveInput").value = todayRef.improve || "";
  }
}
// 6. METRICS & ANALYTICS UPDATER
function updateMetrics() {
  const sessions = getStoredData(STORAGE_KEYS.SESSIONS);
  const tasks = getStoredData(STORAGE_KEYS.TASKS);
  const distractions = getStoredData(STORAGE_KEYS.DISTRACTIONS);
  const todayStr = new Date().toISOString().split("T")[0];

  // 1. Total Study Time
  const totalMins = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  document.getElementById("totalStudyTime").textContent = `${hours}h ${mins}m`;

  // 2. Focus Efficiency (Calculated dynamically based on today's distractions vs sessions)
  const todayDistractions = distractions.filter(
    (d) => d.date === todayStr,
  ).length;
  const efficiency = Math.max(35, 100 - todayDistractions * 12);
  document.getElementById("focusEfficiency").textContent =
    `${sessions.length > 0 || todayDistractions > 0 ? efficiency : 100}%`;

  // 3. Tasks Left
  const tasksLeft = tasks.filter((t) => !t.completed).length;
  document.getElementById("tasksLeft").textContent = tasksLeft;

  // 4. Today's Log count
  const todaySessions = sessions.filter((s) => s.date === todayStr).length;
  document.getElementById("todayLog").textContent =
    `${todaySessions} session${todaySessions === 1 ? "" : "s"}`;
}

function renderAnalytics() {
  const sessions = getStoredData(STORAGE_KEYS.SESSIONS);
  const breakdownContainer = document.getElementById("subjectBreakdown");
  const breakdownEmpty = document.getElementById("breakdownEmpty");
  const weeklyHeatmap = document.getElementById("weeklyHeatmap");
  const weeklySummary = document.getElementById("weeklySummary");

  // Subject Breakdown
  breakdownContainer.innerHTML = "";
  if (sessions.length === 0) {
    breakdownEmpty.classList.remove("d-none");
  } else {
    breakdownEmpty.classList.add("d-none");

    // Group by subject
    const subjectMap = {};
    sessions.forEach((s) => {
      subjectMap[s.subject] = (subjectMap[s.subject] || 0) + s.duration;
    });

    const maxMins = Math.max(...Object.values(subjectMap), 60);

    for (const [subject, duration] of Object.entries(subjectMap)) {
      const percent = Math.round((duration / maxMins) * 100);
      const div = document.createElement("div");
      div.className = "mb-2";
      div.innerHTML = `
                <div class="d-flex justify-content-between small mb-1">
                    <span>${escapeHTML(subject)}</span>
                    <span class="text-muted">${duration} mins</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar bg-primary" role="progressbar" style="width: ${percent}%"></div>
                </div>
            `;
      breakdownContainer.appendChild(div);
    }
  }

  // Weekly Heatmap (Last 7 Days)
  weeklyHeatmap.innerHTML = "";
  let weekTotalMins = 0;
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayName = d.toLocaleDateString("en-US", { weekday: "narrow" });

    const daySessions = sessions.filter((s) => s.date === dateStr);
    const dayMins = daySessions.reduce((acc, s) => acc + s.duration, 0);
    weekTotalMins += dayMins;

    const cell = document.createElement("div");
    cell.className = "flex-fill text-center p-2 rounded border";
    let bgClass = "bg-light text-muted";
    if (dayMins > 60) bgClass = "bg-success text-white";
    else if (dayMins > 0) bgClass = "bg-info text-dark";

    cell.className += ` ${bgClass}`;
    cell.innerHTML = `
            <div class="small fw-bold">${dayName}</div>
            <div class="small">${dayMins}m</div>
        `;
    weeklyHeatmap.appendChild(cell);
  }

  weeklySummary.textContent = `Total studied over the past 7 days: ${Math.floor(weekTotalMins / 60)}h ${weekTotalMins % 60}m. Keep up the consistency!`;
}

// Utility: Prevent XSS injection when rendering user input
function escapeHTML(str) {
  return str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        tag
      ] || tag,
  );
}
