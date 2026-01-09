import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { PiggyBank, Lock, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    checkResetToken();
  }, []);

  const checkResetToken = async () => {
    try {
      // Check if there's a valid session from the reset link
      const { data: { session } } = await supabase.auth.getSession();
      
      // Check URL hash for recovery type
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      
      if ((type === 'recovery' && accessToken) || session) {
        setIsValidToken(true);
      } else {
        setAuthError('Invalid or expired reset link. Please request a new one.');
      }
    } catch (err) {
      setAuthError('Error validating reset link.');
    } finally {
      setCheckingToken(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      if (newPassword.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Update the user's password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      // Sign out after successful password reset
      await supabase.auth.signOut();
      
      // Redirect to login page or show success
      alert('Password updated successfully! Redirecting to login...');
      window.location.href = '/'; // Change this to your login route
      
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="auth-page">
        <style>{styles}</style>
        <div className="loading-container">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
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
            <div className="logo-section">
              <div className="logo-wrapper">
                <div className="piggy-icon">
                  <PiggyBank size={40} />
                </div>
              </div>
              <h1 className="app-title">Ipon365</h1>
              <p className="app-subtitle">Your daily savings companion</p>
            </div>

            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h2>Invalid Reset Link</h2>
              <p>{authError}</p>
              <button 
                className="btn btn-primary"
                onClick={() => window.location.href = '/'}
              >
                Back to Login
              </button>
            </div>
          </div>

          <div className="auth-footer-note">
            Created by drewkees. All rights reserved.
          </div>
        </div>
      </div>
    );
  }

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

          {/* Update Password Header */}
          <div className="reset-header">
            <div className="success-icon-small">
              <CheckCircle2 size={24} />
            </div>
            <h2>Set New Password</h2>
          </div>

          {/* Update Password Form */}
          <div className="form-container">
            <p className="reset-description">
              Enter your new password below. Make sure it's at least 6 characters long.
            </p>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="input-field"
                minLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleResetPassword(e)}
              />
            </div>

            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="input-field"
                minLength={6}
                onKeyDown={(e) => e.key === 'Enter' && handleResetPassword(e)}
              />
            </div>

            <p className="helper-text">Password must be at least 6 characters</p>

            {authError && (
              <div className="error-box">
                <span>⚠️</span> {authError}
              </div>
            )}

            <button 
              className="btn btn-primary"
              onClick={handleResetPassword}
              disabled={authLoading || !newPassword || !confirmPassword || newPassword.length < 6}
            >
              {authLoading ? (
                <>
                  <Loader2 className="btn-icon spin" size={20} />
                  Updating...
                </>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="btn-icon" size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer copyright */}
        <div className="auth-footer-note">
          Created by drewkees. All rights reserved.
        </div>
      </div>
    </div>
  );
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

  /* Reset Header */
  .reset-header {
    padding: 24px 32px;
    background: white;
    border-bottom: 2px solid #f3f4f6;
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .success-icon-small {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
  }

  .reset-header h2 {
    font-size: 20px;
    font-weight: 700;
    color: #1a1a1a;
  }

  /* Error State */
  .error-state {
    padding: 48px 32px;
    text-align: center;
  }

  .error-icon {
    font-size: 64px;
    margin-bottom: 24px;
  }

  .error-state h2 {
    font-size: 24px;
    color: #1a1a1a;
    margin-bottom: 12px;
  }

  .error-state p {
    color: #6b7280;
    margin-bottom: 24px;
    line-height: 1.6;
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
  }
`;