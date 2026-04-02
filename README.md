# 💪 FitBuddy — Daily Habit & Workout Tracker

A full-stack habit tracking web app built with React, Redux Toolkit and Express.js — following the NFSU JavaScript Frameworks syllabus (Units I–V).

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)
![React](https://img.shields.io/badge/React-18-blue)
![Redux](https://img.shields.io/badge/Redux_Toolkit-2.0-purple)
![Express](https://img.shields.io/badge/Express-4.x-green)

---

## 📱 What it does

FitBuddy helps you build and track daily habits. You can:

- ✅ Track habits like water intake, walking steps, workouts and reading time
- ➕ Add your own custom habits with a name, emoji and daily goal
- 🔥 See your current streak for consecutive perfect days
- 📊 View a weekly stats dashboard with bar chart and per-habit consistency
- 💾 All data is saved to an Express server — survives page refresh

---

## 🖥️ Screenshots

> Today view — track and complete your daily habits

![Today View](assets/screen.png)

---

## 🗂️ Project Structure
```
fitbuddy-fullstack/
│
├── fitbuddy/                   ← React frontend
│   └── src/
│       ├── components/
│       │   ├── HabitCard.js        # Individual habit card
│       │   ├── AddHabitForm.js     # Form to add custom habits
│       │   └── WeeklyStats.js      # Stats dashboard
│       ├── hooks/
│       │   └── useHabits.js        # Custom React hook
│       ├── services/
│       │   └── api.js              # API calls to Express server
│       ├── store/
│       │   ├── store.js            # Redux store setup
│       │   ├── habitsSlice.js      # Reducers + async thunks
│       │   └── selectors.js        # Derived state selectors
│       └── App.js                  # Root component
│
└── fitbuddy-server/            ← Express backend
    ├── server.js                   # API endpoints
    ├── data.json                   # Auto-generated database file
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ 
- npm

### 1. Start the backend server
```bash
cd fitbuddy-server
npm install
node server.js
```

Server runs at **http://localhost:5000**

### 2. Start the React frontend
```bash
cd fitbuddy
npm install
npm start
```

App runs at **http://localhost:3000**

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/habits` | Get all habits |
| POST | `/habits` | Add a new habit |
| DELETE | `/habits/:id` | Delete a habit |
| GET | `/history` | Get full completion history |
| POST | `/history/:date/:id` | Mark a habit as done |

---

## 🧠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 | UI components and rendering |
| State | Redux Toolkit | Global state management |
| Async | Redux Thunks | API calls from Redux |
| Backend | Node.js + Express | REST API server |
| Storage | JSON file | Persistent data storage |
| Styling | CSS-in-JS | Inline component styles |

---

## 📚 Syllabus Coverage

This project covers the full NFSU JavaScript Frameworks curriculum:

| Unit | Topic | What was built |
|------|-------|----------------|
| Unit I | JS Frameworks Intro | Understanding React vs Angular vs Vue |
| Unit II | Environment Setup | VS Code, Node.js, npm, create-react-app |
| Unit III | React Components | HabitCard, AddHabitForm, JSX, props, Virtual DOM |
| Unit IV | State & Forms | useState, useEffect, controlled inputs, custom hooks |
| Unit V | Redux + Express | Redux store, async thunks, JSON API endpoints |

---

## 👤 Author

**KingLinux24** — [github.com/KingLinux24](https://github.com/KingLinux24)
