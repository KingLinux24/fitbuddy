import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import '../App.css'; 

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); 
  
  // Read the URL to determine if we should show the Login or Signup panel
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [error, setError] = useState('');

  // Keep the panel synced if the user uses the browser's back/forward buttons
  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
  }, [location.pathname]);

  const handleToggle = (loginState) => {
    setIsLogin(loginState);
    navigate(loginState ? '/login' : '/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        window.location.reload(); 
      }
    } catch (err) {
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This user is already registered. Please sign in.');
          break;
        case 'auth/invalid-credential':
          setError('Incorrect email or password. Please try again.');
          break;
        case 'auth/weak-password':
          setError('Your password must be at least 6 characters.');
          break;
        default:
          setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-container-slide ${!isLogin ? 'right-panel-active' : ''}`} id="container">
        
        {/* ─── SIGN UP FORM ─── */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit} className="slide-form">
            <h1>Create Account</h1>
            <span className="form-subtext">Join the FitBuddy community</span>
            {error && !isLogin && <p className="auth-error-text">{error}</p>}
            
            <div className="floating-label-group">
              <input type="text" id="su-name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} />
              <label htmlFor="su-name">Name</label>
            </div>

            <div className="floating-label-group">
              <input type="email" id="su-email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="su-email">Email Address</label>
            </div>

            <div className="floating-label-group">
              <input type="password" id="su-pass" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label htmlFor="su-pass">Password</label>
            </div>

            <button type="submit" className="slide-btn">Sign Up</button>
          </form>
        </div>

        {/* ─── SIGN IN FORM ─── */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit} className="slide-form">
            <h1>Welcome Back</h1>
            <span className="form-subtext">Log in to track your habits</span>
            {error && isLogin && <p className="auth-error-text">{error}</p>}
            
            <div className="floating-label-group">
              <input type="email" id="si-email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} required />
              <label htmlFor="si-email">Email Address</label>
            </div>

            <div className="floating-label-group">
              <input type="password" id="si-pass" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} required />
              <label htmlFor="si-pass">Password</label>
            </div>

            <a href="#" className="forgot-pass">Forgot your password?</a>
            <button type="submit" className="slide-btn">Sign In</button>
          </form>
        </div>

        {/* ─── SLIDING OVERLAY PANEL ─── */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Already a Member?</h1>
              <p>Sign in to pick up right where you left off.</p>
              <button type="button" className="slide-btn ghost" onClick={() => handleToggle(true)}>Sign In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>New Here?</h1>
              <p>Create an account to start building better habits today.</p>
              <button type="button" className="slide-btn ghost" onClick={() => handleToggle(false)}>Sign Up</button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}