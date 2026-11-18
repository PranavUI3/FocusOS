# FocusOS 🎯 — Study Efficiency & Distraction Analyzer

> **Study Smarter, Not Just Longer.** A client-side productivity dashboard designed for students to track deep work, analyze focus efficiency, manage tasks, and eliminate digital distractions without relying on external databases or backends.

---

## 📌 Project Overview

Many students measure academic productivity purely by raw **hours spent at a desk**. However, 4 hours of studying interrupted by constant notifications yields very low retention and focus. 

**FocusOS** shifts the focus from *quantity of time* to *quality of attention*. It provides a comprehensive, data-driven dashboard that helps students evaluate their daily study habits, identify recurring distractions, organize daily goals, and reflect on conceptual learning gaps.

---

## 👥 Target Audience

* **College Students & Placement Aspirants:** Looking to build structured, disciplined study habits for exams and technical interview prep.
* **Self-Learners:** Wanting a lightweight, privacy-focused productivity tracker running entirely in the browser.

---

## ✨ Core Features

1. **Pomodoro Focus Timer:** 
   * Customizable session lengths linked directly to academic subjects (Maths, Physics, Chemistry, etc.).
   * Live countdown display with real-time progress bar tracking and automatic session logging upon completion.
2. **Task Planner (CRUD):** 
   * Add, complete, and delete daily study goals with instant UI feedback and status persistence.
3. **Distraction Logger:** 
   * Quick-entry logger capturing common focus disruptors (Phone, Social Media, Wandering Thoughts, Noise) with timestamps.
4. **Daily Reflection Journal:** 
   * Structured mini-journal prompting students to record: *What I learned*, *What confused me*, and *What I will improve tomorrow*.
5. **Weekly Analytics & Consistency Heatmap:** 
   * Visual subject breakdown showing time investment per subject.
   * 7-day visual consistency activity tracker highlighting study streaks and habits.
6. **Browser Persistence:** 
   * Zero backend required—all sessions, tasks, distractions, and journal entries are securely stored using the browser's **LocalStorage API**.

---

## 🛠️ Technology Stack & Constraints

This project was built adhering strictly to modern frontend web standards without heavy frameworks, backend servers, or external databases:

* **Markup:** HTML5 (Semantic structure, accessibility tags)
* **Styling:** CSS3, Bootstrap 5.3 (Responsive grid system, modern cards, utility classes)
* **Icons:** Bootstrap Icons (`v1.11.3`)
* **Logic & Interactivity:** Vanilla JavaScript (ES6+, DOM manipulation, event handling)
* **Data Persistence:** Browser LocalStorage API

---

## 📁 Project Folder Structure

```text
focus-os/
│
├── index.html          # Main application layout & UI markup
├── style.css           # Custom CSS styling, shadows, and layout enhancements
├── script.js           # Core application logic, timer engine, and LocalStorage handlers
└── README.md           # Project documentation