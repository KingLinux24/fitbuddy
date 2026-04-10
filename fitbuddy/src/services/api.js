import { auth } from '../firebase'; 

// This uses the environment variable, but falls back to localhost just in case
const BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const userId = auth.currentUser ? auth.currentUser.uid : null;

  if (!userId) {
    console.error("No user logged in!");
    throw new Error("User must be authenticated to make API calls.");
  }

  const separator = path.includes('?') ? '&' : '?';
  const url = `${BASE}${path}${separator}userId=${userId}`;

  if (options.method === 'POST' && options.body) {
    const bodyObj = JSON.parse(options.body);
    options.body = JSON.stringify({ ...bodyObj, userId });
  }

  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getHabits:     ()         => request('/habits'),
  addHabit:      (habit)    => request('/habits', { method: 'POST', body: JSON.stringify(habit) }),
  deleteHabit:   (id)       => request(`/habits/${id}`, { method: 'DELETE' }),
  getHistory:    ()         => request('/history'),
  completeHabit: (date, id) => request(`/history/${date}/${id}`, { 
    method: 'POST', 
    body: JSON.stringify({}) 
  }),
};