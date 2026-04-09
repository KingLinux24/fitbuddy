require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const fs      = require('fs');
const path    = require('path');
const cron    = require('node-cron');
const nodemailer = require('nodemailer');

const app      = express();
const PORT     = 5000;
const DB_FILE  = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// --- Helper: read / write data.json ---
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const seed = { habits: [], history: {}, users: {} };
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2));
    return seed;
  }
  const db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  // Ensure the users object exists if reading an older file
  if (!db.users) db.users = {}; 
  return db;
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// ─────────────────────────────────────────
//  USER endpoints (Saves emails for reminders)
// ─────────────────────────────────────────
app.post('/users', (req, res) => {
  const { userId, email } = req.body;
  if (!userId || !email) return res.status(400).json({ error: "Missing data" });

  const db = readDB();
  db.users[userId] = email; // Save or update the email
  writeDB(db);
  res.json({ success: true });
});

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
//  SMART AUTOMATED EMAIL REMINDERS
// ─────────────────────────────────────────

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Run at 22:00 (10:00 PM) every single day
cron.schedule('0 22 * * *', () => {
  console.log('⏰ Running 10:00 PM smart reminder task...');
  const db = readDB();
  
  if (!db.users) return; // No users saved yet

  // Get today's date in YYYY-MM-DD format
  const todayDate = new Date().toLocaleDateString('en-CA'); 

  // Loop through every registered user
  Object.keys(db.users).forEach(userId => {
    const userEmail = db.users[userId];

    // 1. Find all habits this specific user created
    const userHabits = db.habits.filter(h => h.userId === userId);
    if (userHabits.length === 0) return; // User has no habits, skip them

    // 2. Find what they already completed today
    const completedTodayIDs = (db.history[userId] && db.history[userId][todayDate]) || [];

    // 3. Find the habits they MISSED
    const missedHabits = userHabits.filter(h => !completedTodayIDs.includes(h.id));

    // 4. If they have missed habits, send the email!
    if (missedHabits.length > 0) {
      
      const habitsListHTML = missedHabits.map(h => `<li>${h.emoji} <b>${h.name}</b></li>`).join('');

      const mailOptions = {
        from: 'gdscnfsu.shashank@gmail.com',
        to: userEmail, 
        subject: `⏰ Only 2 hours left! Finish your habits.`,
        html: `
          <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #e8a830;">Don't lose your streak!</h2>
            <p>You have a few habits left to complete before midnight:</p>
            <ul style="font-size: 16px; list-style-type: none; padding-left: 0;">
              ${habitsListHTML}
            </ul>
            <br/>
            <p>Log in to FitBuddy now to check them off!</p>
            <p>Keep going strong,<br/><b>FitBuddy</b></p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error(`❌ Error sending to ${userEmail}:`, error);
        else console.log(`✅ Smart reminder sent to ${userEmail}`);
      });
    } else {
      console.log(`⭐ ${userEmail} completed everything today. No email sent.`);
    }
  });
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