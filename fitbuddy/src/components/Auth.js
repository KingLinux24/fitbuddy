import LoadingOverlay from './LoadingOverlay';
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
  
  const [isLogin, setIsLogin] = useState(location.pathname !== '/signup');
  const [error, setError] = useState('');
  
  // --- NEW LOADING STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    setIsLogin(location.pathname !== '/signup');
    setError(''); 
  }, [location.pathname]);

  const handleToggle = (loginState) => {
    setIsLogin(loginState);
    setError(''); 
    navigate(loginState ? '/login' : '/signup');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 

    if (!isLogin && !name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    // --- START LOADING ---
    setIsLoading(true);
    if (isLogin) {
      setLoadingMessage('Authenticating your credentials...');
    } else {
      setLoadingMessage('Setting up your FitBuddy workspace...');
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        // Note: We intentionally DO NOT set isLoading(false) here. 
        // Keeping it true prevents the screen from flashing back to the form
        // before React Router pushes the user to the Dashboard!
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        window.location.reload(); 
      }
    } catch (err) {
      // Turn off loading only if there's an error so the user can try again
      setIsLoading(false); 
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          setError('This user is already registered. Please sign in.');
          break;
        case 'auth/user-not-found':
          setError("This account doesn't exist. Please sign up first.");
          break;
        case 'auth/invalid-credential':
          setError("Incorrect credentials, or this account doesn't exist yet.");
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
      {/* --- NEW LOADING OVERLAY --- */}
      {isLoading && (
        <div className="global-loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">{loadingMessage}</p>
        </div>
      )}

      <div className={`auth-container-slide ${!isLogin ? 'right-panel-active' : ''}`} id="container">
        
        {/* SIGN UP FORM */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSubmit} className="slide-form" noValidate>
            <h1>Create Account</h1>
            <span className="form-subtext">Join the FitBuddy community</span>
            {error && !isLogin && <p className="auth-error-text">{error}</p>}
            
            <div className="floating-label-group">
              <input type="text" id="su-name" placeholder=" " value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} />
              <label htmlFor="su-name">Name</label>
            </div>

            <div className="floating-label-group">
              <input type="email" id="su-email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              <label htmlFor="su-email">Email Address</label>
            </div>

            <div className="floating-label-group">
              <input type="password" id="su-pass" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              <label htmlFor="su-pass">Password</label>
            </div>

            <button type="submit" className="slide-btn" disabled={isLoading}>Sign Up</button>
          </form>
        </div>

        {/* SIGN IN FORM */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSubmit} className="slide-form" noValidate>
            <h1>Welcome Back</h1>
            <span className="form-subtext">Log in to track your habits</span>
            {error && isLogin && <p className="auth-error-text">{error}</p>}
            
            <div className="floating-label-group">
              <input type="email" id="si-email" placeholder=" " value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} />
              <label htmlFor="si-email">Email Address</label>
            </div>

            <div className="floating-label-group">
              <input type="password" id="si-pass" placeholder=" " value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} />
              <label htmlFor="si-pass">Password</label>
            </div>

            {/* <a href="#" className="forgot-pass">Forgot your password?</a> */}
            <button type="submit" className="slide-btn" disabled={isLoading}>Sign In</button>
          </form>
        </div>

        {/* SLIDING OVERLAY PANEL */}
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