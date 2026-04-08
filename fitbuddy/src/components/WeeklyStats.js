function WeeklyBar({ day }) {
  const pct = day.total === 0 ? 0 : Math.round((day.count / day.total) * 100);
  const isToday = day.key === new Date().toISOString().slice(0, 10);

  return (
    <div style={styles.barCol}>
      <div style={styles.barWrap}>
        <div style={{
          ...styles.barFill,
          height: `${pct}%`,
          backgroundColor: pct === 100 ? '#22c55e' : pct > 0 ? '#86efac' : '#e5e7eb',
        }} />
      </div>
      <span style={{
        ...styles.dayLabel,
        fontWeight: isToday ? '700' : '400',
        color: isToday ? '#22c55e' : '#9ca3af',
      }}>
        {day.label}
      </span>
    </div>
  );
}

function WeeklyStats({ streak, weeklyData, habitStats }) {
  return (
    <div style={styles.card}>

      {/* Streak + week score header */}
      <div style={styles.metricRow}>
        <div style={styles.metric}>
          <span style={styles.metricNum}>{streak}</span>
          <span style={styles.metricLabel}>🔥 day streak</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.metric}>
          <span style={styles.metricNum}>
            {weeklyData.filter(d => d.count === d.total && d.total > 0).length}
          </span>
          <span style={styles.metricLabel}>✅ perfect days</span>
        </div>
        <div style={styles.divider} />
        <div style={styles.metric}>
          <span style={styles.metricNum}>
            {weeklyData.reduce((sum, d) => sum + d.count, 0)}
          </span>
          <span style={styles.metricLabel}>📌 this week</span>
        </div>
      </div>

      {/* Weekly bar chart */}
      <div style={styles.chartTitle}>Last 7 days</div>
      <div style={styles.chart}>
        {weeklyData.map(day => <WeeklyBar key={day.key} day={day} />)}
      </div>

      {/* Per-habit breakdown */}
      <div style={styles.chartTitle}>Habit consistency (7 days)</div>
      {habitStats.map(h => {
        const pct = Math.round((h.completedDays / 7) * 100);
        return (
          <div key={h.id} style={styles.habitRow}>
            <span style={styles.habitEmoji}>{h.emoji}</span>
            <div style={styles.habitInfo}>
              <div style={styles.habitTop}>
                <span style={styles.habitName}>{h.name}</span>
                <span style={styles.habitPct}>{h.completedDays}/7 days</span>
              </div>
              <div style={styles.miniTrack}>
                <div style={{
                  ...styles.miniFill,
                  width: `${pct}%`,
                  backgroundColor: pct >= 80 ? '#22c55e' : pct >= 50 ? '#facc15' : '#f87171',
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '32px',
    maxWidth: '900px',
  },
  metricRow: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  metric: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  metricNum: { fontSize: '26px', fontWeight: '700', color: '#111' },
  metricLabel: { fontSize: '12px', color: '#9ca3af' },
  divider: { width: '1px', height: '40px', backgroundColor: '#f3f4f6' },
  chartTitle: { fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '10px' },
  chart: { display: 'flex', gap: '6px', alignItems: 'flex-end', marginBottom: '20px' },
  barCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  barWrap: {
    width: '100%',
    height: '60px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', borderRadius: '4px', transition: 'height 0.4s ease' },
  dayLabel: { fontSize: '11px' },
  habitRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' },
  habitEmoji: { fontSize: '20px', width: '28px', textAlign: 'center' },
  habitInfo: { flex: 1 },
  habitTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px' },
  habitName: { fontSize: '13px', fontWeight: '500' },
  habitPct: { fontSize: '12px', color: '#9ca3af' },
  miniTrack: { height: '6px', backgroundColor: '#f3f4f6', borderRadius: '99px', overflow: 'hidden' },
  miniFill: { height: '100%', borderRadius: '99px', transition: 'width 0.4s ease' },
};

export default WeeklyStats;