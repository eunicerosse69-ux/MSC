import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [loginType, setLoginType] = useState('customer');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [customerMessage, setCustomerMessage] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirm, setRegisterConfirm] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If navigated from the admin shortcut, show admin PIN form
    if (location.state && location.state.admin) {
      setLoginType('admin');
    } else {
      setLoginType('customer');
    }
  }, [location]);

  const handleAdminSubmit = (event) => {
    event.preventDefault();
    if (pin.trim() === '1202') {
      navigate('/admin');
    } else {
      setLoginError('Invalid PIN');
    }
  };

  const handleCustomerSubmit = (event) => {
    event.preventDefault();
    setCustomerMessage('');

    if (!customerEmail.trim() || !customerPassword.trim()) {
      setCustomerMessage('Please enter your email and password.');
      return;
    }

    // Validate against registered users stored in localStorage
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find((u) => u.email === customerEmail && u.password === customerPassword);
    if (!user) {
      setCustomerMessage('Invalid email or password.');
      return;
    }

    // Save current user and navigate home with welcome state
    const currentUser = { name: user.name, email: user.email };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    navigate('/', { state: { customerWelcome: true, customerName: user.name } });
  };

  const handleRegister = (event) => {
    event.preventDefault();
    setRegisterMessage('');

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim() || !registerConfirm.trim()) {
      setRegisterMessage('Please complete all registration fields.');
      return;
    }

    if (registerPassword !== registerConfirm) {
      setRegisterMessage('Passwords do not match.');
      return;
    }

    // Save user credentials exactly as entered (simple localStorage-backed registry)
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    // Prevent duplicate emails
    const exists = users.find((u) => u.email === registerEmail);
    if (exists) {
      setRegisterMessage('An account with that email already exists.');
      return;
    }

    users.push({ name: registerName.trim(), email: registerEmail.trim(), password: registerPassword });
    localStorage.setItem('users', JSON.stringify(users));

    // After successful registration, switch to Login mode and prefill the email
    setRegisterName('');
    setRegisterPassword('');
    setRegisterConfirm('');
    setRegisterEmail('');
    setMode('login');
    setLoginType('customer');
    setCustomerEmail(registerEmail.trim());
    setCustomerPassword('');
    setCustomerMessage('Registration successful — please sign in.');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#a8bedf' }}>
      <div style={{ width: '100%', maxWidth: 500, background: '#f8fafc', borderRadius: 16, boxShadow: '0 20px 50px rgba(0,0,0,0.08)', padding: 32 }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setLoginError('');
              setRegisterMessage('');
              setCustomerMessage('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: mode === 'login' ? '2px solid #f5821e' : '1px solid #cbd5e1',
              background: mode === 'login' ? '#fff7eb' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setLoginError('');
              setRegisterMessage('');
              setCustomerMessage('');
            }}
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: mode === 'register' ? '2px solid #f5821e' : '1px solid #cbd5e1',
              background: mode === 'register' ? '#fff7eb' : '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Register
          </button>
        </div>

        {/* Admin login is available only via the admin shortcut link; no toggle here */}

        <h2 style={{ marginBottom: 10, color: '#0f1724' }}>
          {mode === 'register'
            ? 'Create Account'
            : loginType === 'admin'
              ? 'Admin Access'
              : 'Customer Login'}
        </h2>
        <p style={{ marginBottom: 24, color: '#475569' }}>
          {mode === 'register'
            ? 'Create a customer account to access tracking and service features.'
            : loginType === 'admin'
              ? 'Enter your secure 4-digit admin PIN to access the admin dashboard.'
              : 'Sign in with your customer email and password.'}
        </p>

        {mode === 'login' ? (
          loginType === 'admin' ? (
            <form onSubmit={handleAdminSubmit}>
              <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>PIN</label>
              <input
                value={pin}
                onChange={(e) => { setPin(e.target.value); setLoginError(''); }}
                type="password"
                maxLength={4}
                inputMode="numeric"
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
              />
              {loginError ? <div style={{ marginBottom: 12, color: '#b91c1c' }}>{loginError}</div> : null}
              <button type="submit" style={{ width: '100%', background: '#f5821e', color: '#1c0101', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Open Admin
              </button>
            </form>
          ) : (
            <form onSubmit={handleCustomerSubmit}>
              <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Email</label>
              <input
                value={customerEmail}
                onChange={(e) => { setCustomerEmail(e.target.value); setCustomerMessage(''); }}
                type="email"
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
              />
              <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Password</label>
              <input
                value={customerPassword}
                onChange={(e) => { setCustomerPassword(e.target.value); setCustomerMessage(''); }}
                type="password"
                style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
              />
              {customerMessage ? <div style={{ marginBottom: 12, color: '#b91c1c' }}>{customerMessage}</div> : null}
              <button type="submit" style={{ width: '100%', background: '#0f1724', color: '#ffffff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Login as Customer
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleRegister}>
            <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Full name</label>
            <input
              value={registerName}
              onChange={(e) => setRegisterName(e.target.value)}
              type="text"
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Email</label>
            <input
              value={registerEmail}
              onChange={(e) => setRegisterEmail(e.target.value)}
              type="email"
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Password</label>
            <input
              value={registerPassword}
              onChange={(e) => setRegisterPassword(e.target.value)}
              type="password"
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
            />
            <label style={{ display: 'block', marginBottom: 8, color: '#334155', fontWeight: 600 }}>Confirm password</label>
            <input
              value={registerConfirm}
              onChange={(e) => setRegisterConfirm(e.target.value)}
              type="password"
              style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', marginBottom: 14, fontSize: 16 }}
            />
            {registerMessage ? <div style={{ marginBottom: 12, color: registerMessage.startsWith('Registration complete') ? '#166534' : '#b91c1c' }}>{registerMessage}</div> : null}
            <button type="submit" style={{ width: '100%', background: '#0f1724', color: '#ffffff', border: 'none', borderRadius: 10, padding: 14, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Create Account
            </button>
          </form>
        )}

        <div style={{ marginTop: 18, fontSize: 13, color: '#64748b' }}>
          {mode === 'login'
            ? 'Not registered yet? Switch to Register.'
            : 'After registering, return to Login and sign in as a customer.'}
        </div>
      </div>
    </div>
  );
}
