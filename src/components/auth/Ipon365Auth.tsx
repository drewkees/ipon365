import React, { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Mail, Lock, Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function Ipon365Auth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authView, setAuthView] = useState('login');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Email suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [emailWarning, setEmailWarning] = useState(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Popular email providers
  const emailDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'protonmail.com',
    'aol.com',
    'mail.com'
  ];

  // Get email suggestions based on current input
  const getEmailSuggestions = () => {
    if (!email || !email.includes('@')) return [];
    
    const [localPart, domainPart] = email.split('@');
    if (!localPart) return [];
    
    // If domain part is empty or incomplete, suggest all domains
    if (!domainPart || domainPart.length === 0) {
      return emailDomains.map(domain => `${localPart}@${domain}`);
    }
    
    // Filter domains that match the typed domain part
    const matchingDomains = emailDomains.filter(domain => 
      domain.toLowerCase().startsWith(domainPart.toLowerCase())
    );
    
    return matchingDomains.map(domain => `${localPart}@${domain}`);
  };

  const suggestions = getEmailSuggestions();

  // Handle email input change
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    
    // Check for common typos
    const hasTypo = validateEmailTypos(value);
    
    // Show suggestions if there's an @ symbol and no typo detected
    if (value.includes('@') && !hasTypo) {
      setShowSuggestions(true);
      setSelectedSuggestionIndex(-1);
    } else {
      setShowSuggestions(false);
    }
  };

  // Validate common email typos
  const validateEmailTypos = (email) => {
    if (!email.includes('@')) {
      setEmailWarning(null);
      return false;
    }

    const commonTypos = [
      { wrong: '.con', correct: '.com', message: 'Did you mean .com instead of .con?' },
      { wrong: '.cmo', correct: '.com', message: 'Did you mean .com instead of .cmo?' },
      { wrong: '.ocm', correct: '.com', message: 'Did you mean .com instead of .ocm?' },
      { wrong: '.comm', correct: '.com', message: 'Did you mean .com instead of .comm?' },
      { wrong: 'gmial', correct: 'gmail', message: 'Did you mean gmail instead of gmial?' },
      { wrong: 'gmai.com', correct: 'gmail.com', message: 'Did you mean gmail.com?' },
      { wrong: 'yahooo', correct: 'yahoo', message: 'Did you mean yahoo instead of yahooo?' },
      { wrong: 'hotmial', correct: 'hotmail', message: 'Did you mean hotmail instead of hotmial?' },
      { wrong: 'outlok', correct: 'outlook', message: 'Did you mean outlook instead of outlok?' },
    ];

    const lowerEmail = email.toLowerCase();
    
    for (const typo of commonTypos) {
      if (lowerEmail.includes(typo.wrong)) {
        const correctedEmail = email.replace(new RegExp(typo.wrong, 'gi'), typo.correct);
        setEmailWarning({
          message: typo.message,
          correctedEmail: correctedEmail
        });
        return true;
      }
    }

    setEmailWarning(null);
    return false; 
  };

  // Apply suggested email correction
  const applySuggestion = (correctedEmail) => {
    setEmail(correctedEmail);
    setEmailWarning(null);
    inputRef.current?.focus();
  };

  // Handle suggestion selection
  const selectSuggestion = (suggestion) => {
    setEmail(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') handleSubmit(e);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else {
          handleSubmit(e);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      case 'Tab':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          selectSuggestion(suggestions[selectedSuggestionIndex]);
        } else if (suggestions.length > 0) {
          e.preventDefault();
          selectSuggestion(suggestions[0]);
        }
        break;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleReset = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setResetEmailSent(true);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

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
      const redirectUrl = window.location.origin;
      
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
      } else if (authView === 'reset') {
        handleReset();
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
            ) : resetEmailSent ? (
              <div className="success-state">
                <div className="success-icon">
                  <CheckCircle2 size={48} />
                </div>
                <h2>Reset link sent!</h2>
                <p>We've sent a password reset link to</p>
                <p className="email-highlight">{email}</p>
                <p className="small-text">Click the link in your email to reset your password.</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setResetEmailSent(false);
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
                {/* Tabs - only show for login/signup */}
                {authView !== 'reset' && (
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
                )}

                {/* Reset Password Header */}
                {authView === 'reset' && (
                  <div className="reset-header">
                    <button 
                      className="back-btn"
                      onClick={() => {
                        setAuthView('login');
                        setAuthError(null);
                        setPassword('');
                      }}
                    >
                      <ArrowLeft size={20} />
                    </button>
                    <h2>Reset Password</h2>
                  </div>
                )}

                {/* Form */}
                <div className="form-container">
                  {authView === 'reset' && (
                    <p className="reset-description">
                      Enter your email address and we'll send you a link to reset your password.
                    </p>
                  )}

                  <div className="input-group" style={{ position: 'relative' }}>
                    <Mail className="input-icon" size={20} />
                    <input
                      ref={inputRef}
                      type="email"
                      value={email}
                      onChange={handleEmailChange}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter your email"
                      className="input-field"
                      autoComplete="off"
                    />
                    
                    {/* Email Typo Warning */}
                    {emailWarning && !showSuggestions && (
                      <div className="email-warning">
                        <span className="warning-icon">💡</span>
                        <span className="warning-text">{emailWarning.message}</span>
                        <button
                          type="button"
                          className="fix-btn"
                          onClick={() => applySuggestion(emailWarning.correctedEmail)}
                        >
                          Fix it
                        </button>
                      </div>
                    )}
                    
                    {/* Email Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                      <div ref={suggestionsRef} className="suggestions-dropdown">
                        {suggestions.map((suggestion, index) => (
                          <div
                            key={suggestion}
                            className={`suggestion-item ${index === selectedSuggestionIndex ? 'selected' : ''}`}
                            onClick={() => selectSuggestion(suggestion)}
                            onMouseEnter={() => setSelectedSuggestionIndex(index)}
                          >
                            <Mail size={16} className="suggestion-icon" />
                            <span className="suggestion-text">{suggestion}</span>
                          </div>
                        ))}
                        <div className="suggestions-hint">
                          Use ↑↓ to navigate, Tab or Enter to select
                        </div>
                      </div>
                    )}
                  </div>

                  {authView !== 'reset' && (
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
                  )}

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
                    disabled={authLoading || !email || (authView !== 'reset' && !password)}
                  >
                    {authLoading ? (
                      <>
                        <Loader2 className="btn-icon spin" size={20} />
                        Please wait...
                      </>
                    ) : (
                      <>
                        {authView === 'login' && 'Login'}
                        {authView === 'signup' && 'Create Account'}
                        {authView === 'reset' && 'Send Reset Link'}
                        <ArrowRight className="btn-icon" size={20} />
                      </>
                    )}
                  </button>

                  {authView === 'login' && (
                    <div className="forgot-password-container">
                      <button 
                        className="forgot-password-btn"
                        onClick={() => {
                          setAuthView('reset');
                          setAuthError(null);
                          setPassword('');
                        }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer */}
                {authView !== 'reset' && (
                  <div className="auth-footer">
                    {authView === 'login' ? (
                      <p>
                        Don't have an account?{' '}
                        <button 
                          className="link-btn"
                          onClick={() => {
                            setAuthView('login');
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
                )}
              </>
            )}
          </div>

          {/* Footer copyright */}
          <div className="auth-footer-note">
            Created by drewkees. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

  // Logged in view - Return null to let parent component handle the main app
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

  /* Reset Header */
  .reset-header {
    padding: 24px 32px;
    background: white;
    border-bottom: 2px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .back-btn {
    background: #f3f4f6;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    color: #6b7280;
  }

  .back-btn:hover {
    background: #e5e7eb;
    color: #1a1a1a;
  }

  .reset-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
  }

  /* Form */
  .form-container {
    padding: 32px;
  }

  .reset-description {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.6;
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
    z-index: 1;
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

  /* Email Suggestions */
  .suggestions-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    z-index: 1000;
    overflow: hidden;
    animation: slideDown 0.2s ease-out;
  }

  /* Email Typo Warning */
  .email-warning {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
    border: 2px solid #fbbf24;
    border-radius: 12px;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
    animation: slideDown 0.2s ease-out;
    box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
    z-index: 999;
  }

  .warning-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .warning-text {
    flex: 1;
    font-size: 13px;
    color: #78350f;
    font-weight: 500;
  }

  .fix-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .fix-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .suggestion-item {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
    border-bottom: 1px solid #f3f4f6;
  }

  .suggestion-item:last-of-type {
    border-bottom: none;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: linear-gradient(90deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  }

  .suggestion-icon {
    color: #667eea;
    flex-shrink: 0;
  }

  .suggestion-text {
    font-size: 14px;
    color: #1a1a1a;
    font-weight: 500;
  }

  .suggestions-hint {
    padding: 8px 16px;
    font-size: 11px;
    color: #9ca3af;
    background: #f9fafb;
    border-top: 1px solid #f3f4f6;
    text-align: center;
  }

  .helper-text {
    font-size: 13px;
    color: #6b7280;
    margin-bottom: 20px;
  }

  .forgot-password-container {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }

  .forgot-password-btn {
    background: none;
    border: none;
    color: #667eea;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: color 0.3s;
  }

  .forgot-password-btn:hover {
    color: #764ba2;
    text-decoration: underline;
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

    .reset-header {
      padding: 20px 24px;
    }

    .suggestions-dropdown {
      max-height: 240px;
      overflow-y: auto;
    }
  }
`;