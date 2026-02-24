import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, User, Phone, Wrench, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

type Step = 'form' | 'verify' | 'done';

/* ── Reusable input with icon (flex layout — no absolute positioning) ── */
function InputGroup({
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  dark = false,
}: {
  icon: typeof Mail;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  dark?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: '#fbbf24', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        borderRadius: 12,
        border: `1px solid ${dark ? '#475569' : '#e5e7eb'}`,
        backgroundColor: dark ? 'rgba(30,41,59,0.7)' : 'rgba(249,250,251,0.5)',
      }}
    >
      <Icon style={{ width: 20, height: 20, flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          outline: 'none',
          border: 'none',
          fontSize: 14,
          color: dark ? '#f1f5f9' : '#111827',
          lineHeight: '20px',
        }}
      />
    </motion.div>
  );
}

/* ── Password strength helper ── */
function getStrength(pw: string) {
  if (!pw) return { label: '', color: '#e5e7eb', pct: 0, bars: 0 };
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (s <= 2) return { label: 'Weak', color: '#ef4444', pct: 33, bars: 1 };
  if (s <= 3) return { label: 'Medium', color: '#f59e0b', pct: 66, bars: 2 };
  return { label: 'Strong', color: '#10b981', pct: 100, bars: 3 };
}

/* ── Password input with eye toggle + optional strength meter ── */
function PasswordInputGroup({
  icon: Icon,
  value,
  onChange,
  placeholder,
  showStrength = false,
  dark = false,
}: {
  icon: typeof Lock;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  showStrength?: boolean;
  dark?: boolean;
}) {
  const [show, setShow] = useState(false);
  const strength = getStrength(value);
  return (
    <div>
      <motion.div
        whileHover={{ scale: 1.02, borderColor: '#fbbf24', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: 12,
          border: `1px solid ${dark ? '#475569' : '#e5e7eb'}`,
          backgroundColor: dark ? 'rgba(30,41,59,0.7)' : 'rgba(249,250,251,0.5)',
        }}
      >
        <Icon style={{ width: 20, height: 20, flexShrink: 0, color: dark ? '#64748b' : '#9ca3af' }} />
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            outline: 'none',
            border: 'none',
            fontSize: 14,
            color: dark ? '#f1f5f9' : '#111827',
            lineHeight: '20px',
          }}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          tabIndex={-1}
        >
          {show
            ? <EyeOff style={{ width: 18, height: 18, color: dark ? '#64748b' : '#9ca3af' }} />
            : <Eye style={{ width: 18, height: 18, color: dark ? '#64748b' : '#9ca3af' }} />}
        </button>
      </motion.div>
      {showStrength && value && (
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {[1, 2, 3].map(i => (
              <motion.div
                key={i}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: i <= strength.bars ? 1 : 1 }}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i <= strength.bars ? strength.color : (dark ? '#334155' : '#e5e7eb'),
                  transition: 'background-color 0.3s',
                }}
              />
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: 12, fontWeight: 600, color: strength.color, margin: 0 }}
          >
            {strength.label}
          </motion.p>
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { prefs } = useTheme();
  const dark = prefs.darkMode;
  const [step, setStep] = useState<Step>('form');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');

  const handleRegister = async () => {
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await authApi.workerRegister({ email, password, fullName, phone });
      setStep('verify');
      setSuccess('Verification OTP sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleVerify = async () => {
    setLoading(true); setError('');
    try {
      await authApi.workerVerifyOtp(email, otp);
      setStep('done');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally { setLoading(false); }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700"
      style={{ padding: 20, overflow: 'hidden' }}
    >
      {/* Background blurs */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -160, right: -160, width: 320, height: 320, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
        <div style={{ position: 'absolute', bottom: -160, left: -160, width: 320, height: 320, background: 'rgba(255,255,255,0.1)', borderRadius: '50%', filter: 'blur(48px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', width: '100%', maxWidth: 420 }}
      >
        <div
          style={{
            background: dark ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: 24,
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            padding: '32px 28px',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div
              className="bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/30"
              style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
            >
              <Wrench style={{ width: 36, height: 36, color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: dark ? '#f1f5f9' : '#111827' }}>Worker Registration</h1>
            <p style={{ fontSize: 14, color: dark ? '#94a3b8' : '#6b7280', marginTop: 4 }}>Join our garage service team</p>
          </div>

          {/* Alert messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key="err"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: 16, padding: 12, background: dark ? 'rgba(127,29,29,0.3)' : '#fef2f2', border: `1px solid ${dark ? 'rgba(248,113,113,0.3)' : '#fecaca'}`, borderRadius: 12, fontSize: 14, color: dark ? '#f87171' : '#dc2626' }}
              >{error}</motion.div>
            )}
            {success && step !== 'done' && (
              <motion.div
                key="suc"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: 16, padding: 12, background: dark ? 'rgba(6,78,59,0.3)' : '#ecfdf5', border: `1px solid ${dark ? 'rgba(52,211,153,0.3)' : '#a7f3d0'}`, borderRadius: 12, fontSize: 14, color: dark ? '#34d399' : '#059669' }}
              >{success}</motion.div>
            )}
          </AnimatePresence>

          {/* ── Registration Form ── */}
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Full Name</label>
                <InputGroup icon={User} value={fullName} onChange={setFullName} placeholder="Your full name" dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Email</label>
                <InputGroup icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Your email address" dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Phone</label>
                <InputGroup icon={Phone} type="tel" value={phone} onChange={setPhone} placeholder="Your phone number" dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Password</label>
                <PasswordInputGroup icon={Lock} value={password} onChange={setPassword} placeholder="Min. 6 characters" showStrength dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Confirm Password</label>
                <PasswordInputGroup icon={Lock} value={confirmPassword} onChange={setConfirmPassword} placeholder="Repeat password" dark={dark} />
              </div>

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={handleRegister}
                disabled={loading || !fullName || !email || !password || !confirmPassword}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50"
                style={{ padding: '12px 0', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Register
              </motion.button>
            </motion.div>
          )}

          {/* ── OTP Verification ── */}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 14, color: dark ? '#94a3b8' : '#4b5563', textAlign: 'center' }}>
                Enter the 6-digit OTP sent to <span style={{ fontWeight: 600, color: dark ? '#f1f5f9' : '#111827' }}>{email}</span>
              </p>
              <motion.div
                whileHover={{ scale: 1.02, borderColor: '#fbbf24', boxShadow: '0 0 0 3px rgba(245,158,11,0.1)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                style={{ borderRadius: 12, border: `1px solid ${dark ? '#475569' : '#e5e7eb'}` }}
              >
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: 'none',
                    backgroundColor: dark ? 'rgba(30,41,59,0.7)' : 'rgba(249,250,251,0.5)',
                    color: dark ? '#f1f5f9' : '#111827',
                    outline: 'none',
                    textAlign: 'center',
                    fontSize: 20,
                    letterSpacing: '0.5em',
                    fontWeight: 700,
                  }}
                  placeholder="------"
                />
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 disabled:opacity-50"
                style={{ padding: '12px 0', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Verify Email
              </motion.button>
            </motion.div>
          )}

          {/* ── Done ── */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
              <CheckCircle style={{ width: 64, height: 64, color: '#10b981' }} />
              <h2 style={{ fontSize: 20, fontWeight: 700, color: dark ? '#f1f5f9' : '#111827' }}>Email Verified!</h2>
              <p style={{ fontSize: 14, color: dark ? '#94a3b8' : '#4b5563' }}>Your registration is pending manager approval. You will receive an email once approved.</p>
              <Link
                to="/login"
                className="bg-gradient-to-r from-amber-500 to-orange-600"
                style={{ display: 'inline-block', marginTop: 8, padding: '12px 24px', borderRadius: 12, color: '#fff', fontWeight: 600, textDecoration: 'none', transition: 'opacity 0.2s' }}
              >
                Back to Login
              </Link>
            </motion.div>
          )}

          {step !== 'done' && (
            <p style={{ textAlign: 'center', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280', marginTop: 16 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: dark ? '#fbbf24' : '#d97706', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
            </p>
          )}

          <p style={{ textAlign: 'center', fontSize: 12, color: dark ? '#64748b' : '#9ca3af', marginTop: 12 }}>
            Only workers need to register. Customers sign in via email OTP.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
