import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth } from './firebase'; // Restored Firebase import
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth'; // Restored Auth hooks
import Auth from './components/Auth'; // Restored Auth screen
import './App.css'; // Keep for Auth screen styles

import {
  fetchAll, addHabitAsync, deleteHabitAsync, completeHabitAsync,
} from './store/habitsSlice';
import {
  selectCompletedToday, selectStreak, selectWeeklyData,
  selectHabitStats, selectTodayKey,
} from './store/selectors';
import HabitCard, { CARD_ACCENTS } from './components/HabitCard';
import AddHabitForm                from './components/AddHabitForm';
import WeeklyStats                 from './components/WeeklyStats';
import PomodoroTimer               from './components/PomodoroTimer';

/* ─── Google Fonts injected once ─────────────────────────────────────── */
if (!document.getElementById('fitbuddy-fonts')) {
  const link = document.createElement('link');
  link.id   = 'fitbuddy-fonts';
  link.rel  = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap';
  document.head.appendChild(link);
}

/* ─── Background orbs injected once ──────────────────────────────────── */
if (!document.getElementById('fitbuddy-bg')) {
  const style = document.createElement('style');
  style.id = 'fitbuddy-bg';
  style.textContent = `
    body { margin:0; background:#2a1505; font-family:'DM Sans',sans-serif; }
    #fitbuddy-orbs { position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden; }
    .fb-orb { position:absolute;border-radius:50%;filter:blur(90px); }
    .fb-orb1 { width:560px;height:560px;background:radial-gradient(circle,#3d1f08,transparent 70%);top:-100px;left:-80px;opacity:0.7; }
    .fb-orb2 { width:480px;height:480px;background:radial-gradient(circle,#0d4a5c,transparent 70%);top:40px;right:-60px;opacity:0.5; }
    .fb-orb3 { width:420px;height:420px;background:radial-gradient(circle,#5c2e0a,transparent 70%);bottom:80px;left:40px;opacity:0.6; }
    .fb-orb4 { width:340px;height:340px;background:radial-gradient(circle,#1a6b82,transparent 70%);bottom:-60px;right:100px;opacity:0.45; }
    .fb-orb5 { width:260px;height:260px;background:radial-gradient(circle,#c8860a,transparent 70%);top:42%;left:36%;opacity:0.3; }

    /* scrollbar */
    ::-webkit-scrollbar { width:4px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:rgba(138,171,138,0.25);border-radius:99px; }

    /* responsive */
    @media(max-width:640px){
      .fb-shell { grid-template-columns:1fr !important; }
      .fb-sidebar { position:static !important;height:auto !important;flex-direction:row !important;padding:14px 16px !important;border-right:none !important;border-bottom:1px solid rgba(200,134,10,0.15) !important;overflow-x:auto !important; }
      .fb-logo { margin-bottom:0 !important; }
      .fb-nav-dot { display:none !important; }
      .fb-sidebar-bottom { display:none !important; }
      .fb-main { padding:18px 16px !important; }
    }
  `;
  document.head.appendChild(style);

  // inject orb divs
  const orbs = document.createElement('div');
  orbs.id = 'fitbuddy-orbs';
  orbs.innerHTML = `
    <div class="fb-orb fb-orb1"></div>
    <div class="fb-orb fb-orb2"></div>
    <div class="fb-orb fb-orb3"></div>
    <div class="fb-orb fb-orb4"></div>
    <div class="fb-orb fb-orb5"></div>
  `;
  document.body.prepend(orbs);
}

/* ─── Nav items ───────────────────────────────────────────────────────── */
const NAV = [
  { key: 'today',    label: 'Today',        color: '#e8a830' },
  { key: 'stats',    label: 'Weekly Stats', color: '#4db8d4' },
  { key: 'pomodoro', label: 'Pomodoro',     color: '#8aab8a' },
];

function App() {
  const [view, setView] = useState('today');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const dispatch       = useDispatch();
  const habits         = useSelector(s => s.habits.habits);
  const loading        = useSelector(s => s.habits.loading);
  const error          = useSelector(s => s.habits.error);
  const completedToday = useSelector(selectCompletedToday);
  const streak         = useSelector(selectStreak);
  const weeklyData     = useSelector(selectWeeklyData);
  const habitStats     = useSelector(selectHabitStats);

  // Restored login/logout listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Restored Auth-gated fetch
  useEffect(() => { 
    if (user) {
      dispatch(fetchAll()); 
    }
  }, [dispatch, user]);

  function handleComplete(id) { dispatch(completeHabitAsync({ date: selectTodayKey(), id })); }
  function handleAdd(habit)   { dispatch(addHabitAsync(habit)); }
  function handleDelete(id)   { dispatch(deleteHabitAsync(id)); }

  const handleDeleteAccount = async () => {
    // 1. Confirm with the user first!
    if (window.confirm("Are you sure you want to delete your FitBuddy account? This will erase all your habits and history forever.")) {
      try {
        await deleteUser(auth.currentUser);
        window.location.reload(); // Refresh to go back to the login screen
      } catch (error) {
        // Firebase requires "recent authentication" for sensitive actions. 
        // If they've been logged in for 3 weeks, it might fail.
        alert("For security reasons, please Log Out and Log In again before deleting your account.");
      }
    }
  };

  const completedCount  = completedToday.size;
  const totalCount      = habits.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // 1. Restored Auth loading screen
  if (authLoading) return (
    <div style={styles.centered}>
      <span style={{ fontSize: '56px' }}>⏳</span>
      <p style={{ color: '#8aab8a', marginTop: '8px' }}>Authenticating...</p>
    </div>
  );

  // 2. Restored Login check
  if (!user) return <Auth />;

  /* 3. loading */
  if (loading) return (
    <div style={styles.centered}>
      <p style={{ fontSize: '32px' }}>🌿</p>
      <p style={{ color: '#8aab8a', marginTop: '8px' }}>Loading FitBuddy…</p>
    </div>
  );

  /* 4. error */
  if (error) return (
    <div style={styles.centered}>
      <p style={{ fontSize: '32px' }}>⚠️</p>
      <p style={{ color: '#e8a830', fontWeight: '600' }}>{error}</p>
      <p style={{ color: '#8a7060', fontSize: '13px', marginTop: '6px' }}>
        Run <code style={{ color: '#4db8d4' }}>node server.js</code> in the fitbuddy-server folder
      </p>
    </div>
  );

  return (
    <div className="fb-shell" style={styles.shell}>

      {/* ── SIDEBAR ─────────────────────────────────────────── */}
      <aside className="fb-sidebar" style={styles.sidebar}>
        <div className="fb-logo" style={styles.logo}>
          <div style={styles.logoDot} />
          FitBuddy
        </div>

        {NAV.map(n => (
          <div
            key={n.key}
            style={{
              ...styles.navItem,
              ...(view === n.key ? styles.navActive : {}),
            }}
            onClick={() => setView(n.key)}
          >
            <div className="fb-nav-dot" style={{ ...styles.navDot, background: n.color, boxShadow: `0 0 6px ${n.color}` }} />
            {n.label}
          </div>
        ))}

        <div className="fb-sidebar-bottom" style={styles.sidebarBottom}>
          
          {/* Streak badge */}
          <div style={styles.streakPill}>
            <div style={styles.streakNum}>🔥 {streak}</div>
            <div style={styles.streakLabel}>Day Streak. Keep Going!</div>
            <div style={styles.streakTrack}>
              <div style={{ ...styles.streakFill, width: `${Math.min((streak / 7) * 100, 100)}%` }} />
            </div>
          </div>

          {/* Profile Container (Relative for absolute menu positioning) */}
          <div style={{ position: 'relative', marginTop: '10px' }}>
            
            {/* Clickable Profile Card */}
            <div 
              style={{ ...styles.profileCard, cursor: 'pointer', borderColor: isMenuOpen ? '#e8a830' : 'rgba(138,171,138,0.2)' }} 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <div style={styles.profileImgRing}>
                <img src="/image.png" alt="Profile" style={styles.profilePhoto}
                  onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
                <div style={{ ...styles.profileFallback, display:'none' }}>🌿</div>
                <div style={styles.profileOnline} />
              </div>
              <div style={styles.profileInfo}>
                <div style={styles.profileName}>{user?.displayName ? user.displayName : (user?.email ? user.email.split('@')[0] : 'My Profile')}</div>
                <div style={styles.profileSub}>Habit Tracker</div>
              </div>
              <div style={styles.profileBadge}>
                {isMenuOpen ? '▼' : '▲'} {/* Tiny arrow indicates it's a menu */}
              </div>
            </div>

            {/* Glassmorphism Popup Menu */}
            {isMenuOpen && (
              <div style={styles.profileMenu}>
                <div style={styles.menuItem} onClick={() => { setIsMenuOpen(false); alert("Settings coming soon!"); }}>
                  <span style={{ fontSize: '16px' }}>⚙️</span> Account Settings
                </div>
                
                <div style={styles.menuDivider} />
                
                <div style={{ ...styles.menuItem, color: '#f5ede0' }} onClick={() => signOut(auth).then(() => window.location.reload())}>
                  <span style={{ fontSize: '16px' }}>🚪</span> Log Out
                </div>
                
                <div style={{ ...styles.menuItem, color: '#ff6b6b' }} onClick={handleDeleteAccount}>
                  <span style={{ fontSize: '16px' }}>🗑️</span> Delete Account
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="fb-main" style={styles.main}>

        {/* Page header */}
        <div style={styles.pageHeader}>
          <div>
            <span style={styles.hi}>Good morning,</span>
            <div style={styles.pageTitle}>Let's crush it.</div>
          </div>
          <div style={styles.dateBadge}>
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* ── TODAY VIEW ────────────────────────────────────── */}
        {view === 'today' && (
          <>
            {/* Stat cards */}
            <div style={styles.statsGrid}>
              <div style={{ ...styles.statCard, background: 'rgba(200,134,10,0.15)' }}>
                <div style={styles.statLabel}>Completed</div>
                <div style={{ ...styles.statVal, color: '#e8a830' }}>{completedCount}</div>
                <div style={{ ...styles.statSub, color: 'rgba(232,168,48,0.6)' }}>of {totalCount} habits</div>
              </div>
              <div style={{ ...styles.statCard, background: 'rgba(13,74,92,0.35)' }}>
                <div style={styles.statLabel}>Streak</div>
                <div style={{ ...styles.statVal, color: '#4db8d4' }}>{streak}</div>
                <div style={{ ...styles.statSub, color: 'rgba(77,184,212,0.6)' }}>days</div>
              </div>
              <div style={{ ...styles.statCard, background: 'rgba(92,46,10,0.45)' }}>
                <div style={styles.statLabel}>Today</div>
                <div style={{ ...styles.statVal, color: '#f5c96a' }}>{progressPercent}%</div>
                <div style={{ ...styles.statSub, color: 'rgba(245,201,106,0.6)' }}>done</div>
              </div>
            </div>

            {/* Progress bar */}
            <div style={styles.progSection}>
              <div style={styles.progHeader}>
                <span style={styles.progTitle}>Today's progress</span>
                <span style={styles.progPct}>{progressPercent}%</span>
              </div>
              <div style={styles.progTrack}>
                <div style={{ ...styles.progFill, width: `${progressPercent}%` }} />
              </div>
              {totalCount > 0 && completedCount === totalCount && (
                <p style={styles.allDone}>All habits done! Amazing day!</p>
              )}
            </div>

            {/* Habit list */}
            <div style={styles.sectionLabel}>Today's habits</div>
            {habits.map((habit, i) => (
              <HabitCard
                key={habit.id}
                name={habit.name}
                emoji={habit.emoji}
                goal={habit.goal}
                unit={habit.unit}
                done={completedToday.has(habit.id)}
                accentColor={CARD_ACCENTS ? CARD_ACCENTS[i % CARD_ACCENTS.length] : undefined}
                onComplete={() => handleComplete(habit.id)}
                onDelete={() => handleDelete(habit.id)}
              />
            ))}

            <AddHabitForm onAdd={handleAdd} habits={habits} />
          </>
        )}

        {/* ── STATS VIEW ────────────────────────────────────── */}
        {view === 'stats' && (
          <WeeklyStats streak={streak} weeklyData={weeklyData} habitStats={habitStats} />
        )}

        {/* ── POMODORO VIEW ─────────────────────────────────── */}
        {view === 'pomodoro' && <PomodoroTimer />}
      </main>
    </div>
  );
}

const styles = {
  centered: {
    textAlign: 'center', padding: '80px 20px',
    fontFamily: "'DM Sans', sans-serif", color: '#f5ede0',
    position: 'relative', zIndex: 1,
  },
  shell: {
    display: 'grid', gridTemplateColumns: '240px 1fr',
    minHeight: '100vh', maxWidth: '1100px',
    margin: '0 auto', position: 'relative', zIndex: 1,
  },

  /* Sidebar */
  sidebar: {
    padding: '32px 20px', display: 'flex', flexDirection: 'column', gap: '6px',
    position: 'sticky', top: 0, height: '100vh',
    background: 'rgba(30,12,3,0.55)',
    backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
    borderRight: '1px solid rgba(200,134,10,0.15)',
    overflow: 'hidden',
  },
  logo: {
    fontFamily: 'Syne, sans-serif', fontSize: '22px', fontWeight: 800,
    color: '#f5ede0', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '10px',
  },
  logoDot: {
    width: '10px', height: '10px', borderRadius: '50%',
    background: 'linear-gradient(135deg,#c8860a,#2a8fa8)',
    boxShadow: '0 0 16px rgba(200,134,10,0.7)',
  },
  navItem: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '10px 14px', borderRadius: '12px',
    fontSize: '14px', fontWeight: '500', color: '#c4a882',
    cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s',
  },
  navActive: {
    color: '#f5ede0', background: 'rgba(200,134,10,0.12)',
    borderColor: 'rgba(200,134,10,0.22)',
  },
  navDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  sidebarBottom: { marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },

  profileCard: {
    display: 'flex', alignItems: 'center', gap: '12px',
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(138,171,138,0.2)',
    borderRadius: '14px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  },
  profileImgRing: {
    position: 'relative', flexShrink: 0,
    width: '46px', height: '46px',
  },
  profilePhoto: {
    width: '46px', height: '46px',
    borderRadius: '50%',
    objectFit: 'cover', objectPosition: 'center top',
    display: 'block',
    border: '2px solid rgba(138,171,138,0.45)',
    boxShadow: '0 0 14px rgba(138,171,138,0.2)',
  },
  profileFallback: {
    width: '46px', height: '46px', borderRadius: '50%',
    alignItems: 'center', justifyContent: 'center',
    fontSize: '22px', background: 'rgba(138,171,138,0.12)',
    border: '2px solid rgba(138,171,138,0.3)',
  },
  profileOnline: {
    position: 'absolute', bottom: '1px', right: '1px',
    width: '10px', height: '10px', borderRadius: '50%',
    background: '#8aab8a',
    border: '2px solid rgba(30,12,3,0.9)',
    boxShadow: '0 0 6px rgba(138,171,138,0.6)',
  },
  profileInfo: { flex: 1, minWidth: 0 },
  profileName: { fontSize: '13px', fontWeight: '500', color: '#f5ede0', marginBottom: '2px', textTransform: 'capitalize' },
  profileSub: { fontSize: '11px', color: '#8a7060' },
  profileBadge: {
    fontSize: '14px', color: '#e8a830',
    flexShrink: 0, opacity: 0.7,
  },
  streakPill: {
    background: 'rgba(13,74,92,0.35)', backdropFilter: 'blur(12px)',
    border: '1px solid rgba(42,143,168,0.3)', borderRadius: '16px', padding: '16px',
  },
  streakNum: {
    fontFamily: 'Syne, sans-serif', fontSize: '28px', fontWeight: 800,
    background: 'linear-gradient(90deg,#e8a830,#4db8d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  streakLabel: { fontSize: '12px', color: '#4db8d4', marginTop: '2px', opacity: 0.8 },
  streakTrack: { height: '4px', background: 'rgba(42,143,168,0.2)', borderRadius: '99px', overflow: 'hidden', marginTop: '10px' },
  streakFill: { height: '100%', background: 'linear-gradient(90deg,#c8860a,#2a8fa8)', borderRadius: '99px' },

  // // ADDED: Logout Button Style
  // logoutBtn: {
  //   marginTop: '4px',
  //   background: 'rgba(255, 68, 68, 0.08)',
  //   color: '#ff6b6b',
  //   border: '1px solid rgba(255, 68, 68, 0.15)',
  //   padding: '10px',
  //   borderRadius: '12px',
  //   cursor: 'pointer',
  //   fontWeight: '600',
  //   fontSize: '13px',
  //   width: '100%',
  //   transition: 'background 0.2s',
  // },

  /* Main */
  main: { padding: '32px 36px', overflowY: 'auto' },
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
  hi: { display: 'block', fontSize: '13px', color: '#8a7060', marginBottom: '4px' },
  pageTitle: {
    fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800,
    background: 'linear-gradient(90deg,#f5ede0 20%,#e8a830,#4db8d4)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  dateBadge: {
    background: 'rgba(200,134,10,0.1)', backdropFilter: 'blur(10px)',
    border: '1px solid rgba(200,134,10,0.2)', borderRadius: '8px',
    padding: '6px 12px', fontSize: '12px', color: '#f5c96a', whiteSpace: 'nowrap',
  },

  /* Stat cards */
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px', marginBottom: '20px' },
  statCard: {
    borderRadius: '18px', padding: '18px',
    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(200,134,10,0.18)',
  },
  statLabel: { fontSize: '11px', color: '#8a7060', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' },
  statVal: { fontFamily: 'Syne, sans-serif', fontSize: '30px', fontWeight: 800 },
  statSub: { fontSize: '11px', marginTop: '2px' },

  /* Progress bar */
  progSection: { marginBottom: '20px' },
  progHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  progTitle: { fontSize: '13px', fontWeight: '500', color: '#c4a882' },
  progPct: { fontFamily: 'Syne, sans-serif', fontSize: '13px', fontWeight: 700, color: '#e8a830' },
  progTrack: { height: '7px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(200,134,10,0.1)' },
  progFill: {
    height: '100%', borderRadius: '99px',
    background: 'linear-gradient(90deg,#c8860a,#1a6b82,#4db8d4)',
    boxShadow: '0 0 14px rgba(42,143,168,0.4)', transition: 'width 0.5s ease',
  },
  allDone: { textAlign: 'center', color: '#8aab8a', fontWeight: '600', margin: '10px 0 0', fontSize: '14px' },

  sectionLabel: {
    fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em',
    color: '#8a7060', fontWeight: '500', marginBottom: '12px',
  },

  // NEW POPUP MENU STYLES
  profileMenu: {
    position: 'absolute',
    bottom: 'calc(100% + 12px)', // Pops up right above the profile card
    left: '0',
    width: '100%',
    background: 'rgba(20, 25, 20, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(138,171,138,0.25)',
    borderRadius: '16px',
    padding: '8px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    zIndex: 100,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  menuItem: {
    padding: '12px 14px',
    borderRadius: '10px',
    color: '#8aab8a',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s',
  },
  menuDivider: {
    height: '1px',
    background: 'rgba(138,171,138,0.15)',
    margin: '4px 8px',
  },
};

export default App;