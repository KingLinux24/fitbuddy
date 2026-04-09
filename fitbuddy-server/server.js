const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');

const app      = express();
const PORT     = 5000;
const DB_FILE  = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// --- Helper: read / write data.json ---
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seed = { habits: [], history: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────
//  HABITS endpoints (Filtered by userId)
// ─────────────────────────────────────────

// GET /habits?userId=XYZ
app.get('/habits', (req, res) => {
  const { userId } = req.query; 
  if (!userId) return res.status(400).json({ error: "userId is required" });

  const db = readDB();
  // Filter so users only get their own habits
  const userHabits = db.habits.filter(h => h.userId === userId);
  res.json(userHabits);
});

// POST /habits
app.post('/habits', (req, res) => {
  const db = readDB();
  const newHabit = { 
    id: Date.now(), 
    ...req.body 
  };
  
  if (!newHabit.userId) return res.status(400).json({ error: "userId is required" });

  db.habits.push(newHabit);
  writeDB(db);
  res.status(201).json(newHabit);
});

// DELETE /habits/:id?userId=XYZ
app.delete('/habits/:id', (req, res) => {
  const db = readDB();
  const id = Number(req.params.id);
  const { userId } = req.query;

  // Only delete if the habit belongs to the user
  db.habits = db.habits.filter(h => !(h.id === id && h.userId === userId));
  
  if (db.history[userId]) {
    Object.keys(db.history[userId]).forEach(day => {
      db.history[userId][day] = db.history[userId][day].filter(hid => hid !== id);
    });
  }

  writeDB(db);
  res.json({ success: true });
});

// ─────────────────────────────────────────
//  HISTORY endpoints (Stored by userId)
// ─────────────────────────────────────────

// GET /history?userId=XYZ
app.get('/history', (req, res) => {
  const { userId } = req.query;
  const db = readDB();
  res.json(db.history[userId] || {});
});

// POST /history/:date/:habitId
app.post('/history/:date/:habitId', (req, res) => {
  const db = readDB();
  const { date, habitId } = req.params;
  const { userId } = req.body; 
  const id = Number(habitId);

  if (!userId) return res.status(400).json({ error: "userId is required" });

  if (!db.history[userId]) db.history[userId] = {};
  if (!db.history[userId][date]) db.history[userId][date] = [];
  
  if (!db.history[userId][date].includes(id)) {
    db.history[userId][date].push(id);
  }

  writeDB(db);
  res.json({ success: true, history: db.history[userId] });
});

// ─────────────────────────────────────────
//  Health check
// ─────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: '💪 FitBuddy server running!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ FitBuddy server running at http://localhost:${PORT}`);
});