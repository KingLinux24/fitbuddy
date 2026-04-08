import { useState } from 'react';

const EMOJI_OPTIONS = ['💧','🚶','🏋️','📚','🧘','🥗','😴','🏃','🚴','💊'];

function AddHabitForm({ onAdd }) {
  const [name,  setName]  = useState('');
  const [emoji, setEmoji] = useState('💧');
  const [goal,  setGoal]  = useState('');
  const [unit,  setUnit]  = useState('');
  const [open,  setOpen]  = useState(false);

  function handleSubmit() {
    if (!name.trim() || !goal || !unit.trim()) return;
    onAdd({ id: Date.now(), name: name.trim(), emoji, goal: Number(goal), unit: unit.trim() });
    setName(''); setGoal(''); setUnit(''); setEmoji('💧'); setOpen(false);
  }

  if (!open) return (
    <div style={styles.addCard} onClick={() => setOpen(true)}>
      <div style={styles.plusCircle}>+</div>
      <p style={styles.addText}>Add New Habit</p>
      <p style={styles.addSub}>Click to create a custom habit</p>
    </div>
  );

  return (
    <div style={styles.form}>
      <h3 style={styles.formTitle}>New Habit</h3>

      <label style={styles.label}>Emoji</label>
      <div style={styles.emojiRow}>
        {EMOJI_OPTIONS.map(e => (
          <button key={e} style={{
            ...styles.emojiBtn,
            backgroundColor: emoji === e ? 'rgba(255,107,0,0.25)' : 'rgba(255,255,255,0.06)',
            border: emoji === e ? '2px solid #ff6b00' : '2px solid transparent',
          }} onClick={() => setEmoji(e)}>{e}</button>
        ))}
      </div>

      <label style={styles.label}>Habit name</label>
      <input style={styles.input} type="text" placeholder="e.g. Drink green tea"
        value={name} onChange={e => setName(e.target.value)} />

      <div style={styles.row}>
        <div style={{ flex: 1 }}>
          <label style={styles.label}>Goal</label>
          <input style={styles.input} type="number" placeholder="8"
            value={goal} onChange={e => setGoal(e.target.value)} />
        </div>
        <div style={{ flex: 2 }}>
          <label style={styles.label}>Unit</label>
          <input style={styles.input} type="text" placeholder="glasses, steps..."
            value={unit} onChange={e => setUnit(e.target.value)} />
        </div>
      </div>

      <div style={styles.row}>
        <button style={styles.cancelBtn} onClick={() => setOpen(false)}>Cancel</button>
        <button style={styles.submitBtn} onClick={handleSubmit}>Add Habit</button>
      </div>
    </div>
  );
}

const styles = {
  addCard: {
    border: '2px dashed rgba(255,107,0,0.25)',
    borderRadius: '20px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'rgba(255,107,0,0.03)',
    backdropFilter: 'blur(10px)',
    minHeight: '160px',
  },
  plusCircle: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255,107,0,0.15)',
    border: '2px solid rgba(255,107,0,0.3)',
    color: '#ff6b00',
    fontSize: '24px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  addText: { color: '#ff6b00', fontWeight: '700', fontSize: '15px', margin: 0 },
  addSub:  { color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: 0 },
  form: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '24px',
  },
  formTitle: { margin: '0 0 16px', fontSize: '18px', fontWeight: '800', color: '#fff' },
  label: {
    display: 'block', fontSize: '11px', fontWeight: '700',
    color: 'rgba(255,255,255,0.4)', marginBottom: '6px', marginTop: '14px',
    textTransform: 'uppercase', letterSpacing: '1px',
  },
  emojiRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  emojiBtn: {
    fontSize: '18px', width: '38px', height: '38px',
    borderRadius: '10px', cursor: 'pointer', transition: 'all 0.15s',
  },
  input: {
    width: '100%', padding: '12px 14px',
    backgroundColor: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', fontSize: '14px',
    color: '#fff', boxSizing: 'border-box',
  },
  row: { display: 'flex', gap: '12px', marginTop: '4px' },
  cancelBtn: {
    flex: 1, padding: '11px', marginTop: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px', backgroundColor: 'transparent',
    color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px',
  },
  submitBtn: {
    flex: 2, padding: '11px', marginTop: '16px',
    border: 'none', borderRadius: '12px',
    background: 'linear-gradient(135deg, #ff6b00, #ff9500)',
    color: '#fff', cursor: 'pointer', fontSize: '14px',
    fontWeight: '700', boxShadow: '0 6px 20px rgba(255,107,0,0.4)',
  },
};

export default AddHabitForm;