import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Mail, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Ipon365Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
        const redirectUrl = import.meta.env.VITE_APP_URL || window.location.origin;
      if (authView === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        setEmailSent(true);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="auth-page">
        <style>{styles}</style>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="auth-page">
        <style>{styles}</style>
        
        {/* Animated background */}
        <div className="bg-animation">
          <div className="coin coin-1">₱</div>
          <div className="coin coin-2">₱</div>
          <div className="coin coin-3">₱</div>
          <div className="coin coin-4">₱</div>
          <div className="coin coin-5">₱</div>
          <div className="coin coin-6">₱</div>
        </div>

        <div className="auth-container">
          <div className="auth-card">
            {/* Logo section */}
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="piggy-icon">
                  <PiggyBank size={40} />
                </div>
              </div>
              <h1 className="app-title">Ipon365</h1>
              <p className="app-subtitle">Your daily savings companion</p>
            </div>

            {emailSent ? (
              <div className="success-state">
                <div className="success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Check your email!</h2>
                <p>We've sent a confirmation link to</p>
                <p className="email-highlight">{email}</p>
                <p className="small-text">Click the link to verify your account, then come back to log in.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEmailSent(false);
                    setAuthView('login');
                    setEmail('');
                    setPassword('');
                  }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <>
                {/* Tabs */}
                <div className="auth-tabs">
                  <button 
                    className={`tab ${authView === 'login' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthView('login');
                      setAuthError(null);
                    }}
                  >
                    Login
                  </button>
                  <button 
                    className={`tab ${authView === 'signup' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthView('signup');
                      setAuthError(null);
                    }}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Form */}
                <div className="form-container">
                  <div className="input-group">
                    <Mail className="input-icon" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="input-field"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    />
                  </div>

                  <div className="input-group">
                    <Lock className="input-icon" size={20} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input-field"
                      minLength={6}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                    />
                  </div>

                  {authView === 'signup' && (
                    <p className="helper-text">Password must be at least 6 characters</p>
                  )}

                  {authError && (
                    <div className="error-box">
                      <span>⚠️</span> {authError}
                    </div>
                  )}

                  <button 
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={authLoading || !email || !password}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="btn-icon spin" size={20} />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {authView === 'login' ? 'Login' : 'Create Account'}
                        <ArrowRight className="btn-icon" size={20} />
                      </>
                    )}
                  </button>
                </div>

                {/* Footer */}
                <div className="auth-footer">
                  {authView === 'login' ? (
                    <p>
                      Don't have an account?{' '}
                      <button 
                        className="link-btn"
                        onClick={() => {
                          setAuthView('signup');
                          setAuthError(null);
                        }}
                      >
                        Sign up free
                      </button>
                    </p>
                  ) : (
                    <p>
                      Already have an account?{' '}
                      <button 
                        className="link-btn"
                        onClick={() => {
                          setAuthView('login');
                          setAuthError(null);
                        }}
                      >
                        Login here
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

            {/* Footer copyright */}
            <div className="auth-footer-note">
                Created by DrewKees. All rights reserved.
            </div>
        </div>
      </div>
    );
  }

  // Logged in view - Return null to let parent component handle the main app
  // This component only handles authentication
  return null;
}

const styles = `

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  /* Auth Page */
  .auth-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  /* Animated Background */
  .bg-animation {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .coin {
    position: absolute;
    font-size: 32px;
    color: rgba(255, 255, 255, 0.1);
    animation: float 15s infinite ease-in-out;
  }

   .auth-footer-note {
    text-align: center;
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 16px;
  }
  .coin-1 { top: 10%; left: 10%; animation-delay: 0s; }
  .coin-2 { top: 20%; right: 15%; animation-delay: 2s; }
  .coin-3 { bottom: 30%; left: 20%; animation-delay: 4s; }
  .coin-4 { top: 60%; right: 25%; animation-delay: 1s; }
  .coin-5 { bottom: 10%; right: 10%; animation-delay: 3s; }
  .coin-6 { top: 40%; left: 5%; animation-delay: 5s; }

  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-30px) rotate(180deg); }
  }

  /* Auth Container */
  .auth-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 440px;
  }

  .auth-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Logo Section */
  .logo-section {
    padding: 48px 32px 32px;
    text-align: center;
    background: linear-gradient(180deg, #f8f9ff 0%, white 100%);
  }

  .logo-wrapper {
    display: inline-block;
    position: relative;
    margin-bottom: 16px;
  }

  .piggy-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
    animation: bounce 2s infinite;
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  .app-title {
    font-size: 32px;
    font-weight: 800;
    color: #1a1a1a;
    margin-bottom: 8px;
    letter-spacing: -0.5px;
  }

  .app-subtitle {
    font-size: 15px;
    color: #6b7280;
    font-weight: 500;
  }

  /* Tabs */
  .auth-tabs {
    display: flex;
    border-bottom: 2px solid #f3f4f6;
    background: white;
  }

  .tab {
    flex: 1;
    padding: 18px;
    background: none;
    border: none;
    font-size: 16px;
    font-weight: 600;
    color: #9ca3af;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;
  }

  .tab.active {
    color: #667eea;
  }

  .tab.active::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 3px 3px 0 0;
  }

  /* Form */
  .form-container {
    padding: 32px;
  }

  .input-group {
    position: relative;
    margin-bottom: 20px;
  }

  .input-icon {
    position: absolute;
    left: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    pointer-events: none;
  }

  .input-field {
    width: 100%;
    padding: 14px 16px 14px 48px;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 15px;
    transition: all 0.3s;
    background: #f9fafb;
  }

  .input-field:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
  }

  .helper-text {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
  }

  .error-box {
    background: #fee2e2;
    color: #991b1b;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 14px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Buttons */
  .btn {
    width: 100%;
    padding: 14px 24px;
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-icon {
    flex-shrink: 0;
  }

  .btn-icon.spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* Footer */
  .auth-footer {
    padding: 24px 32px;
    background: #f9fafb;
    text-align: center;
    border-top: 1px solid #e5e7eb;
  }

  .auth-footer p {
    font-size: 14px;
    color: #6b7280;
  }

  .link-btn {
    background: none;
    border: none;
    color: #667eea;
    font-weight: 600;
    cursor: pointer;
    text-decoration: underline;
    transition: color 0.3s;
  }

  .link-btn:hover {
    color: #764ba2;
  }

  /* Success State */
  .success-state {
    padding: 48px 32px;
    text-align: center;
  }

  .success-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    margin: 0 auto 24px;
    animation: scaleIn 0.5s ease-out;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  .success-state h2 {
    font-size: 24px;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .success-state p {
    color: #6b7280;
    margin-bottom: 8px;
    line-height: 1.6;
  }

  .email-highlight {
    font-weight: 600;
    color: #667eea;
    margin-bottom: 16px;
  }

  .small-text {
    font-size: 13px;
    margin-bottom: 24px;
  }

  /* Feature Cards */
  .features {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 24px;
  }

  .feature-card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 20px 12px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .feature-icon {
    font-size: 32px;
    margin-bottom: 8px;
  }

  .feature-card h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 4px;
  }

  .feature-card p {
    font-size: 12px;
    color: #6b7280;
  }

  /* Loading */
  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
  }

  .spinner {
    width: 48px;
    height: 48px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  /* Responsive */
  @media (max-width: 640px) {
    .features {
      grid-template-columns: 1fr;
    }

    .auth-card {
      border-radius: 20px;
    }

    .logo-section {
      padding: 36px 24px 24px;
    }

    .app-title {
      font-size: 28px;
    }

    .form-container {
      padding: 24px;
    }
  }
`;