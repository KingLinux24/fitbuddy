import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAll,
  addHabitAsync,
  deleteHabitAsync,
  completeHabitAsync,
} from './store/habitsSlice';
import {
  selectCompletedToday,
  selectStreak,
  selectWeeklyData,
  selectHabitStats,
  selectTodayKey,
} from './store/selectors';
import { api } from './services/api';
import HabitCard    from './components/HabitCard';
import AddHabitForm from './components/AddHabitForm';
import WeeklyStats  from './components/WeeklyStats';

function App() {
  const [view, setView] = useState('today');

  const dispatch       = useDispatch();
  const habits         = useSelector(state => state.habits.habits);
  const loading        = useSelector(state => state.habits.loading);
  const error          = useSelector(state => state.habits.error);
  const completedToday = useSelector(selectCompletedToday);
  const streak         = useSelector(selectStreak);
  const weeklyData     = useSelector(selectWeeklyData);
  const habitStats     = useSelector(selectHabitStats);

  useEffect(() => { dispatch(fetchAll()); }, [dispatch]);

  function handleComplete(id) { dispatch(completeHabitAsync({ date: selectTodayKey(), id })); }
  function handleAdd(habit)   { dispatch(addHabitAsync(habit)); }
  function handleDelete(id)   { dispatch(deleteHabitAsync(id)); }

  const completedCount  = completedToday.size;
  const totalCount      = habits.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  const today = new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) return (
    <div style={styles.splash}>
      <div style={styles.splashInner}>
        <span style={{ fontSize: '56px' }}>💪</span>
        <h1 style={styles.splashTitle}>FitBuddy</h1>
        <p style={styles.splashSub}>Loading your program...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.splash}>
      <div style={styles.splashInner}>
        <span style={{ fontSize: '48px' }}>⚠️</span>
        <p style={{ color: '#ff4444', fontWeight: '700', marginTop: '16px' }}>{error}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '8px' }}>
          Run <code style={{ color: '#ff6b00' }}>node server.js</code> in fitbuddy-server
        </p>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>

      {/* ── TOP NAVBAR ── */}
      <nav style={styles.navbar}>
        <div style={styles.navBrand}>
          <span style={styles.navIcon}>💪</span>
          <span style={styles.navTitle}>FitBuddy</span>
        </div>
        <div style={styles.navCenter}>
          <button
            style={{ ...styles.navBtn, ...(view === 'today' ? styles.navBtnActive : {}) }}
            onClick={() => setView('today')}
          >
            Today
          </button>
          <button
            style={{ ...styles.navBtn, ...(view === 'stats' ? styles.navBtnActive : {}) }}
            onClick={() => setView('stats')}
          >
            Weekly Stats
          </button>
        </div>
        <div style={styles.navRight}>
          {streak > 0 && <div style={styles.streakPill}>🔥 {streak} day streak</div>}
        </div>
      </nav>

      {/* ── HERO BANNER ── */}
      <div style={styles.hero}>
        <div style={styles.heroContent}>
          <p style={styles.heroDate}>{today}</p>
          <h1 style={styles.heroTitle}>
            {completedCount === totalCount && totalCount > 0
              ? 'Beast Mode Activated! 🎉'
              : 'Time to crush your goals.'}
          </h1>
          <p style={styles.heroSub}>
            {completedCount} of {totalCount} habits completed today
          </p>

          {/* Big progress bar */}
          <div style={styles.heroBar}>
            <div style={styles.heroBarTrack}>
              <div style={{ ...styles.heroBarFill, width: `${progressPercent}%` }} />
            </div>
            <span style={styles.heroBarPct}>{progressPercent}%</span>
          </div>
        </div>

        {/* Stats pills */}
        <div style={styles.heroPills}>
          <div style={styles.pill}>
            <span style={styles.pillNum}>{totalCount}</span>
            <span style={styles.pillLabel}>Habits</span>
          </div>
          <div style={styles.pillDivider} />
          <div style={styles.pill}>
            <span style={styles.pillNum}>{streak}</span>
            <span style={styles.pillLabel}>Day Streak</span>
          </div>
          <div style={styles.pillDivider} />
          <div style={styles.pill}>
            <span style={styles.pillNum}>
              {weeklyData.filter(d => d.count === d.total && d.total > 0).length}
            </span>
            <span style={styles.pillLabel}>Perfect Days</span>
          </div>
          <div style={styles.pillDivider} />
          <div style={styles.pill}>
            <span style={styles.pillNum}>
              {weeklyData.reduce((s, d) => s + d.count, 0)}
            </span>
            <span style={styles.pillLabel}>This Week</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={styles.main}>

        {view === 'today' && (
          <>
            {/* Section header */}
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Today's Habits</h2>
                <p style={styles.sectionSub}>Track your daily progress</p>
              </div>
              <div style={styles.progressBadge}>
                {completedCount} / {totalCount} done
              </div>
            </div>

            {/* Habit grid */}
            <div style={styles.grid}>
              {habits.map(habit => (
                <HabitCard
                  key={habit.id}
                  name={habit.name}
                  emoji={habit.emoji}
                  goal={habit.goal}
                  unit={habit.unit}
                  done={completedToday.has(habit.id)}
                  onComplete={() => handleComplete(habit.id)}
                  onDelete={() => handleDelete(habit.id)}
                />
              ))}

              {/* Add habit card inline in grid */}
              <AddHabitForm onAdd={handleAdd} />
            </div>
          </>
        )}

        {view === 'stats' && (
          <>
            <div style={styles.sectionHeader}>
              <div>
                <h2 style={styles.sectionTitle}>Weekly Overview</h2>
                <p style={styles.sectionSub}>Your performance over the last 7 days</p>
              </div>
            </div>
            <WeeklyStats
              streak={streak}
              weeklyData={weeklyData}
              habitStats={habitStats}
            />
          </>
        )}
      </div>

      {/* ── FOOTER ── */}
      <footer style={styles.footer}>
        <span style={styles.footerText}>💪 FitBuddy — Build your best self, one habit at a time.</span>
      </footer>
    </div>
  );
}

const styles = {
  // Splash / loading
  splash: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashInner: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  splashTitle: {
    fontSize: '42px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '-1px',
  },
  splashSub: { color: 'rgba(255,255,255,0.5)', fontSize: '16px' },

  // Page
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },

  // Navbar
  navbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 48px',
    height: '72px',
    backgroundColor: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navBrand: { display: 'flex', alignItems: 'center', gap: '10px' },
  navIcon:  { fontSize: '28px' },
  navTitle: {
    fontSize: '22px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '-0.5px',
  },
  navCenter: { display: 'flex', gap: '6px' },
  navBtn: {
    padding: '8px 22px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '99px',
    backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.55)',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    letterSpacing: '0.2px',
  },
  navBtnActive: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
    color: '#fff',
    boxShadow: '0 4px 16px rgba(255,107,0,0.45)',
  },
  navRight: { display: 'flex', alignItems: 'center', gap: '12px', minWidth: '160px', justifyContent: 'flex-end' },
  streakPill: {
    backgroundColor: 'rgba(255,107,0,0.18)',
    border: '1px solid rgba(255,107,0,0.45)',
    color: '#ff8c3a',
    fontSize: '13px',
    fontWeight: '700',
    padding: '6px 16px',
    borderRadius: '99px',
  },

  // Hero
  hero: {
    padding: '56px 48px 40px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.35)',
    backdropFilter: 'blur(8px)',
  },
  heroContent: { maxWidth: '680px', marginBottom: '40px' },
  heroDate: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ff6b00',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    marginBottom: '10px',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '900',
    color: '#fff',
    letterSpacing: '-1.5px',
    lineHeight: 1.1,
    marginBottom: '12px',
  },
  heroSub: {
    fontSize: '16px',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: '24px',
  },
  heroBar: { display: 'flex', alignItems: 'center', gap: '16px', maxWidth: '520px' },
  heroBarTrack: {
    flex: 1,
    height: '10px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: '99px',
    overflow: 'hidden',
  },
  heroBarFill: {
    height: '100%',
    backgroundColor: '#ff6b00',
    borderRadius: '99px',
    transition: 'width 0.6s ease',
    boxShadow: '0 0 16px rgba(255,107,0,0.6)',
  },
  heroBarPct: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#ff6b00',
    minWidth: '48px',
  },

  // Pills row
  heroPills: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '20px 32px',
    width: 'fit-content',
  },
  pill: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '0 32px',
  },
  pillNum: {
    fontSize: '28px',
    fontWeight: '900',
    color: '#fff',
    lineHeight: 1,
  },
  pillLabel: { fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: '500' },
  pillDivider: { width: '1px', height: '36px', backgroundColor: 'rgba(255,255,255,0.1)' },

  // Main
  main: {
    flex: 1,
    padding: '40px 48px',
  },

  // Section header
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '28px',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#fff',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  sectionSub: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.4)',
    margin: '4px 0 0',
  },
  progressBadge: {
    backgroundColor: 'rgba(255,107,0,0.15)',
    border: '1px solid rgba(255,107,0,0.35)',
    color: '#ff8c3a',
    fontSize: '14px',
    fontWeight: '700',
    padding: '8px 20px',
    borderRadius: '99px',
  },

  // Habit grid — 2 columns on wide screens
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
  },

  // Footer
  footer: {
    textAlign: 'center',
    padding: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  footerText: { color: 'rgba(255,255,255,0.25)', fontSize: '13px' },
};

export default App;