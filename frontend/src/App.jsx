import { useState } from 'react';
import SRHHomepage from './components/SRHHomepage.jsx';
import './components/SRHHomepage.css';

const API_BASE_URL = 'http://localhost:8080';

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Check your email and password.');
      }

      const data = await response.json();
      localStorage.setItem('srhAuth', JSON.stringify(data));
      onLogin(data);
    } catch (error) {
      setStatus(error.message || 'Could not connect to the backend.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <div className="auth-kicker">Smart Resource Hiring</div>
          <h1 className="auth-title">Sign in to SRH Portal</h1>
          <p className="auth-copy">
            Use the backend running on localhost:8080 to receive a JWT and open
            the resource dashboard.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>

          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          {status ? <div className="auth-error">{status}</div> : null}

          <button className="auth-submit" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}

export default function App() {
  const [auth, setAuth] = useState(() => {
    const savedAuth = localStorage.getItem('srhAuth');
    return savedAuth ? JSON.parse(savedAuth) : null;
  });

  function handleLogout() {
    localStorage.removeItem('srhAuth');
    setAuth(null);
  }

  if (!auth?.token) {
    return <LoginPage onLogin={setAuth} />;
  }

  return <SRHHomepage currentUser={auth} onLogout={handleLogout} />;
}
