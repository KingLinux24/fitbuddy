function HabitCard({ name, emoji, goal, unit, done, onComplete, onDelete }) {
  return (
    <div style={{
      ...styles.card,
      borderColor: done ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.08)',
      background: done
        ? 'linear-gradient(135deg, rgba(255,107,0,0.12) 0%, rgba(255,107,0,0.05) 100%)'
        : 'rgba(255,255,255,0.05)',
    }}>
      {/* Top row */}
      <div style={styles.top}>
        <div style={styles.emojiWrap}>
          <span style={styles.emoji}>{emoji}</span>
        </div>
        <div style={styles.info}>
          <h3 style={{ ...styles.name, color: done ? '#ff8c3a' : '#fff' }}>{name}</h3>
          <p style={styles.goal}>{goal} {unit} / day</p>
        </div>
        <div style={styles.topRight}>
          {done && <span style={styles.badge}>✔ Done</span>}
          <button style={styles.deleteBtn} onClick={onDelete}>✕</button>
        </div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Bottom row */}
      <div style={styles.bottom}>
        <button
          style={{
            ...styles.button,
            background: done
              ? 'rgba(255,107,0,0.15)'
              : 'linear-gradient(135deg, #ff6b00, #ff9500)',
            color: done ? '#ff8c3a' : '#fff',
            cursor: done ? 'default' : 'pointer',
            boxShadow: done ? 'none' : '0 6px 20px rgba(255,107,0,0.4)',
          }}
          onClick={onComplete}
          disabled={done}
        >
          {done ? '✔ Completed!' : '✓ Mark as Done'}
        </button>

        {/* Mini progress indicator */}
        <div style={styles.statusDot(done)} />
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '22px 24px',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    cursor: 'default',
  },
  top: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    marginBottom: '16px',
  },
  emojiWrap: {
    width: '52px',
    height: '52px',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  emoji: { fontSize: '26px' },
  info: { flex: 1 },
  name: { margin: '0 0 4px', fontSize: '17px', fontWeight: '700' },
  goal: { color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: '13px' },
  topRight: { display: 'flex', alignItems: 'center', gap: '8px' },
  badge: {
    backgroundColor: 'rgba(255,107,0,0.18)',
    color: '#ff8c3a',
    fontSize: '11px',
    fontWeight: '700',
    padding: '4px 12px',
    borderRadius: '99px',
    letterSpacing: '0.3px',
  },
  deleteBtn: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: '16px',
  },
  bottom: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    border: 'none',
    borderRadius: '12px',
    padding: '11px 28px',
    fontSize: '14px',
    fontWeight: '700',
    transition: 'all 0.2s',
    letterSpacing: '0.3px',
  },
  statusDot: (done) => ({
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: done ? '#ff6b00' : 'rgba(255,255,255,0.12)',
    boxShadow: done ? '0 0 10px rgba(255,107,0,0.7)' : 'none',
    transition: 'all 0.3s',
  }),
};

export default HabitCard;