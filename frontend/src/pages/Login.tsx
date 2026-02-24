import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Loader2, Mail, Lock, User, Wrench, Shield, Eye, EyeOff } from 'lucide-react';
import { authApi } from '../lib/api';
import { useTheme } from '../lib/ThemeContext';

type RoleTab = 'Customer' | 'Worker' | 'Manager';

/* ── Reusable input with icon (flex layout — no absolute positioning) ── */
function InputGroup({
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled,
  dark = false,
}: {
  icon: typeof Mail;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled?: boolean;
  dark?: boolean;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: '#93c5fd', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' }}
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
        disabled={disabled}
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

/* ── Password input with eye toggle ── */
function PasswordInputGroup({
  icon: Icon,
  value,
  onChange,
  placeholder,
  dark = false,
}: {
  icon: typeof Lock;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  dark?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <motion.div
      whileHover={{ scale: 1.02, borderColor: '#93c5fd', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' }}
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
  );
}

export default function Login() {
  const navigate = useNavigate();
  const { prefs } = useTheme();
  const dark = prefs.darkMode;
  const [tab, setTab] = useState<RoleTab>('Customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [custEmail, setCustEmail] = useState('');
  const [custOtp, setCustOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const [workerEmail, setWorkerEmail] = useState('');
  const [workerPassword, setWorkerPassword] = useState('');

  const [mgrUsername, setMgrUsername] = useState('');
  const [mgrPassword, setMgrPassword] = useState('');

  const handleSuccess = (data: { token: string; user: Record<string, unknown> }) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    navigate('/');
  };

  const requestOtp = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      await authApi.customerRequestOtp(custEmail);
      setOtpSent(true);
      setSuccess('OTP sent to your email!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const verifyOtp = async () => {
    setLoading(true); setError(''); setSuccess('');
    try {
      const res = await authApi.customerVerifyOtp(custEmail, custOtp);
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const workerLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await authApi.workerLogin(workerEmail, workerPassword);
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const managerLogin = async () => {
    setLoading(true); setError('');
    try {
      const res = await authApi.managerLogin(mgrUsername, mgrPassword);
      handleSuccess(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  const tabList: { key: RoleTab; label: string; icon: typeof Car }[] = [
    { key: 'Customer', label: 'Customer', icon: User },
    { key: 'Worker', label: 'Worker', icon: Wrench },
    { key: 'Manager', label: 'Manager', icon: Shield },
  ];

  const colors: Record<RoleTab, { gradient: string; btn: string; shadow: string }> = {
    Customer: { gradient: 'from-blue-600 via-blue-700 to-indigo-800', btn: 'from-blue-600 to-indigo-700', shadow: 'shadow-blue-500/30' },
    Worker:   { gradient: 'from-amber-500 via-amber-600 to-orange-700', btn: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30' },
    Manager:  { gradient: 'from-violet-600 via-purple-700 to-indigo-800', btn: 'from-violet-600 to-purple-700', shadow: 'shadow-violet-500/30' },
  };
  const c = colors[tab];

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${c.gradient} transition-all duration-500`}
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
              className={`bg-gradient-to-br ${c.btn} ${c.shadow}`}
              style={{ width: 64, height: 64, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}
            >
              <Car style={{ width: 36, height: 36, color: '#fff' }} />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: dark ? '#f1f5f9' : '#111827' }}>Welcome Back</h1>
            <p style={{ fontSize: 14, color: dark ? '#94a3b8' : '#6b7280', marginTop: 4 }}>Sign in to Garage Services</p>
          </div>

          {/* Role Tabs */}
          <div style={{ display: 'flex', gap: 4, background: dark ? '#1e293b' : '#f3f4f6', padding: 4, borderRadius: 12, marginBottom: 24 }}>
            {tabList.map(t => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 0',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: tab === t.key ? (dark ? '#334155' : '#fff') : 'transparent',
                  color: tab === t.key ? (dark ? '#f1f5f9' : '#111827') : (dark ? '#94a3b8' : '#6b7280'),
                  boxShadow: tab === t.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                <t.icon style={{ width: 16, height: 16 }} /> {t.label}
              </button>
            ))}
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
            {success && (
              <motion.div
                key="suc"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{ marginBottom: 16, padding: 12, background: dark ? 'rgba(6,78,59,0.3)' : '#ecfdf5', border: `1px solid ${dark ? 'rgba(52,211,153,0.3)' : '#a7f3d0'}`, borderRadius: 12, fontSize: 14, color: dark ? '#34d399' : '#059669' }}
              >{success}</motion.div>
            )}
          </AnimatePresence>

          {/* ── Customer Tab ── */}
          {tab === 'Customer' && (
            <motion.div key="cust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Email Address</label>
                <InputGroup icon={Mail} type="email" value={custEmail} onChange={setCustEmail} placeholder="Enter your email" disabled={otpSent} dark={dark} />
              </div>

              {otpSent && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Enter OTP</label>
                  <motion.div
                    whileHover={{ scale: 1.02, borderColor: '#93c5fd', boxShadow: '0 0 0 3px rgba(59,130,246,0.1)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ borderRadius: 12, border: `1px solid ${dark ? '#475569' : '#e5e7eb'}` }}
                  >
                    <input
                      type="text"
                      value={custOtp}
                      onChange={e => setCustOtp(e.target.value)}
                      maxLength={6}
                      style={{
                        width: '100%',
                        padding: '10px 16px',
                        borderRadius: 12,
                        border: 'none',
                        backgroundColor: dark ? 'rgba(30,41,59,0.7)' : 'rgba(249,250,251,0.5)',
                        outline: 'none',
                        textAlign: 'center',
                        color: dark ? '#f1f5f9' : '#111827',
                        fontSize: 20,
                        letterSpacing: '0.5em',
                        fontWeight: 700,
                      }}
                      placeholder="------"
                    />
                  </motion.div>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={otpSent ? verifyOtp : requestOtp}
                disabled={loading || !custEmail}
                className={`w-full bg-gradient-to-r ${c.btn} disabled:opacity-50`}
                style={{ padding: '12px 0', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {otpSent ? 'Verify & Sign In' : 'Send OTP'}
              </motion.button>

              {otpSent && (
                <button
                  onClick={() => { setOtpSent(false); setCustOtp(''); setError(''); setSuccess(''); }}
                  style={{ width: '100%', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
                >Change email</button>
              )}
            </motion.div>
          )}

          {/* ── Worker Tab ── */}
          {tab === 'Worker' && (
            <motion.div key="worker" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Email</label>
                <InputGroup icon={Mail} type="email" value={workerEmail} onChange={setWorkerEmail} placeholder="Your work email" dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Password</label>
                <PasswordInputGroup icon={Lock} value={workerPassword} onChange={setWorkerPassword} placeholder="Your password" dark={dark} />
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={workerLogin}
                disabled={loading || !workerEmail || !workerPassword}
                className={`w-full bg-gradient-to-r ${c.btn} disabled:opacity-50`}
                style={{ padding: '12px 0', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Sign In as Worker
              </motion.button>
              <p style={{ textAlign: 'center', fontSize: 14, color: dark ? '#94a3b8' : '#6b7280' }}>
                New worker?{' '}
                <Link to="/register" style={{ color: dark ? '#fbbf24' : '#d97706', fontWeight: 600 }}>Register here</Link>
              </p>
            </motion.div>
          )}

          {/* ── Manager Tab ── */}
          {tab === 'Manager' && (
            <motion.div key="mgr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Username</label>
                <InputGroup icon={Shield} value={mgrUsername} onChange={setMgrUsername} placeholder="Manager username" dark={dark} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: dark ? '#cbd5e1' : '#374151', marginBottom: 6 }}>Password</label>
                <PasswordInputGroup icon={Lock} value={mgrPassword} onChange={setMgrPassword} placeholder="Manager password" dark={dark} />
              </div>
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.2)' }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                onClick={managerLogin}
                disabled={loading || !mgrUsername || !mgrPassword}
                className={`w-full bg-gradient-to-r ${c.btn} disabled:opacity-50`}
                style={{ padding: '12px 0', borderRadius: 12, color: '#fff', fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Sign In as Manager
              </motion.button>
              <p style={{ textAlign: 'center', fontSize: 12, color: dark ? '#64748b' : '#9ca3af', marginTop: 8 }}>Manager accounts are pre-configured by admin</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
