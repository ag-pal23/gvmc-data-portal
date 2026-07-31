'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, RefreshCw, Send, AlertTriangle, ArrowLeft, ArrowRight } from 'lucide-react';
import styles from './LoginPortal.module.css';

interface LoginPortalProps {
  onLoginSuccess: () => void;
}

// Helpers to generate captcha
function generateCaptchaText(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like O, I, 1, 0
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Helpers to generate random OTP code
function generateOtpCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function LoginPortal({ onLoginSuccess }: LoginPortalProps) {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  
  // Credentials Step States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [credentialsError, setCredentialsError] = useState('');

  // OTP Step States
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize Captcha
  useEffect(() => {
    setCaptchaCode(generateCaptchaText());
  }, []);

  // OTP Countdown Timer
  useEffect(() => {
    if (step !== 'otp' || otpTimer <= 0) return;
    const interval = setInterval(() => {
      setOtpTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [step, otpTimer]);

  const handleRefreshCaptcha = (e: React.MouseEvent) => {
    e.preventDefault();
    setCaptchaCode(generateCaptchaText());
    setCaptchaInput('');
    setCredentialsError('');
  };

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentialsError('');

    if (!identifier || !password) {
      setCredentialsError('Please fill in all fields.');
      return;
    }

    if (captchaInput.toUpperCase() !== captchaCode) {
      setCredentialsError('Incorrect Captcha code. Please try again.');
      setCaptchaCode(generateCaptchaText());
      setCaptchaInput('');
      return;
    }

    // Credentials & Captcha Validated! Proceed to OTP step
    const newOtp = generateOtpCode();
    setGeneratedOtp(newOtp);
    setOtp(Array(6).fill(''));
    setOtpTimer(30);
    setOtpError('');
    setStep('otp');
  };

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-focus next box
    if (cleanVal && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = (e: React.MouseEvent) => {
    e.preventDefault();
    const newOtp = generateOtpCode();
    setGeneratedOtp(newOtp);
    setOtp(Array(6).fill(''));
    setOtpTimer(30);
    setOtpError('');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    const enteredCode = otp.join('');

    if (enteredCode.length < 6) {
      setOtpError('Please enter all 6 digits.');
      return;
    }

    if (enteredCode !== generatedOtp) {
      setOtpError('Incorrect verification code. Please check and try again.');
      return;
    }

    // OTP Verified! Complete login
    onLoginSuccess();
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logoIcon}>
            <Shield size={22} />
          </div>
          <h1 className={styles.title}>
            {step === 'credentials' ? 'Secure Gateway' : 'Identity Verification'}
          </h1>
          <p className={styles.subtitle}>
            {step === 'credentials' 
              ? 'GVMC Open Data Intelligence Platform' 
              : 'Enter verification code to establish session'}
          </p>
        </div>

        {step === 'credentials' ? (
          <form className={styles.form} onSubmit={handleCredentialsSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="identifier">Username, Phone or Email</label>
              <input
                id="identifier"
                className={styles.input}
                type="text"
                placeholder="e.g. citizen@gvmc.gov.in"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {/* Captcha Section */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="captcha">Security Captcha</label>
              <div className={styles.captchaRow}>
                <div className={styles.captchaBox}>
                  <span className={styles.captchaText}>{captchaCode}</span>
                  <button 
                    className={styles.captchaRefresh} 
                    onClick={handleRefreshCaptcha}
                    title="Refresh Captcha"
                    type="button"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                <input
                  id="captcha"
                  className={styles.input}
                  type="text"
                  placeholder="Enter characters"
                  value={captchaInput}
                  onChange={e => setCaptchaInput(e.target.value)}
                  maxLength={5}
                  required
                />
              </div>
            </div>

            {credentialsError && (
              <div className={styles.error} role="alert">
                <AlertTriangle size={14} /> {credentialsError}
              </div>
            )}

            <button className={styles.submitBtn} type="submit">
              Sign In <ArrowRight size={16} />
            </button>
          </form>
        ) : (
          <form className={styles.form} onSubmit={handleOtpVerify}>
            {/* Mock OTP Delivery Simulation */}
            <div className={styles.mockBanner}>
              <span style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Sparkles size={12} /> Verification Code Dispatched
              </span>
              <span>GVMC Email verification OTP: <b>{generatedOtp}</b></span>
            </div>

            <p className={styles.otpInstructions}>
              We have dispatched a 6-digit verification code to <b>{identifier}</b>. Please input it below.
            </p>

            <div className={styles.otpRow} role="group" aria-label="OTP digit inputs">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={el => { otpRefs.current[idx] = el; }}
                  className={styles.otpInput}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(idx, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(idx, e)}
                  aria-label={`Digit ${idx + 1}`}
                  required
                />
              ))}
            </div>

            <div className={styles.otpTimerRow}>
              <span>
                {otpTimer > 0 
                  ? `Resend available in ${otpTimer}s` 
                  : 'Didn\'t receive code?'}
              </span>
              <button
                className={styles.resendBtn}
                disabled={otpTimer > 0}
                onClick={handleResendOtp}
                type="button"
              >
                Resend Code
              </button>
            </div>

            {otpError && (
              <div className={styles.error} role="alert">
                <AlertTriangle size={14} /> {otpError}
              </div>
            )}

            <button className={styles.submitBtn} type="submit">
              Verify & Enter Platform <Send size={14} />
            </button>

            <button 
              className={styles.backBtn} 
              type="button" 
              onClick={() => setStep('credentials')}
            >
              <ArrowLeft size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Back to login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
