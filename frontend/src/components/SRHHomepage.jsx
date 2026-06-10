import { useState, useEffect, useRef } from 'react';
import './SRHHomepage.css';
import logo from '../assets/Logo.png';

const API_BASE_URL = 'http://localhost:8080';
const SIDEBAR_ITEMS = [
  { label: 'Dashboard', icon: '⬡', active: true },
  { label: 'People', icon: '◈' },
  { label: 'Projects', icon: '◇' },
  { label: 'Clients', icon: '○' },
  { label: 'Interviews', icon: '◫' },
  { label: 'Audit Log', icon: '≡' },
];

const EMPLOYEES = [
  {
    name: 'Aryan Mehta',
    skills: 'React, Node.js',
    score: 92,
    status: 'bench',
    days: '14d',
  },
  {
    name: 'Priya Sharma',
    skills: 'Java, Spring Boot',
    score: 87,
    status: 'shortlisted',
    days: '8d',
  },
  {
    name: 'Rahul Nair',
    skills: 'Python, ML',
    score: 81,
    status: 'bench',
    days: '22d',
  },
  {
    name: 'Sneha Iyer',
    skills: 'React, TypeScript',
    score: 76,
    status: 'allocated',
    days: '—',
  },
];

const FEATURES = [
  {
    icon: '🔍',
    color: 'cyan',
    title: 'Skill-Based Search',
    desc: 'Multi-criteria Atlas Search with filters for skill, department, location, and availability. Returns paginated, ranked results instantly.',
  },
  {
    icon: '📊',
    color: 'gold',
    title: 'Composite Ranking',
    desc: 'Candidates scored by skill match (60%), bench duration (30%), and performance rating (10%). Elimination of guesswork in allocation decisions.',
  },
  {
    icon: '🔄',
    color: 'blue',
    title: 'Requirement Lifecycle',
    desc: 'State machine: OPEN → INTERVIEW_SCHEDULED → IN_PROGRESS → FULFILLED → CLOSED. Server-side validation with full audit trail.',
  },
  {
    icon: '🏗️',
    color: 'cyan',
    title: 'Project Management',
    desc: 'CRUD projects and clients, associate requirements, map employees to roles. Real-time headcount and fulfilment tracking per project.',
  },
  {
    icon: '📋',
    color: 'gold',
    title: 'Interview Scheduling',
    desc: 'Multi-round interview management linked to requirements. Track pass/fail per round, compute overall status, support external candidates.',
  },
  {
    icon: '🛡️',
    color: 'blue',
    title: 'Audit & Security',
    desc: 'Every state change logged with actor ID, timestamp, and old/new values. JWT + Spring Security 6 with BCrypt and role-based access.',
  },
];

const ROLE_OPTIONS = ['EMPLOYEE', 'OPERATOR', 'PROJECT_ADMIN', 'ADMIN'];
const DEFAULT_EMPLOYEE_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
};

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('visible');
          obs.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function RevealDiv({ children, className = '', delay = 0, style = {} }) {
  const ref = useReveal();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}s`, ...style }}
    >
      {children}
    </div>
  );
}

export default function SRHHomepage({ currentUser, onLogout, onGoToDemand }) {
  const [activeNav, setActiveNav] = useState('People');
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [employeeStatus, setEmployeeStatus] = useState('');
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const isAdmin = currentUser?.role === 'ADMIN';

  function updateEmployeeForm(field, value) {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateEmployee(event) {
    event.preventDefault();
    setEmployeeStatus('');
    setIsSavingEmployee(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/employees`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser?.token}`,
        },
        body: JSON.stringify(employeeForm),
      });
      if (!response.ok)
        throw new Error(
          'Could not add employee. Check your admin login and form values.',
        );
      const createdEmployee = await response.json();
      setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
      setEmployeeStatus(`${createdEmployee.name} was added successfully.`);
    } catch (error) {
      setEmployeeStatus(error.message || 'Could not add employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  }

  return (
    <>
      <div className="srh-root">
        {/* NAV */}
        <nav>
          <div className="nav-logo">
            <div className="nav-logo-mark">
              <img src={logo} alt="Company Logo" />
            </div>
            Smart Resource Hiring
          </div>
          <div className="nav-links">
            {['Features', 'How it works', 'Roles', 'Architecture'].map((l) => (
              <a key={l} href="#">
                {l}
              </a>
            ))}
          </div>
          <div className="nav-actions">
            <span className="nav-user">{currentUser?.email}</span>
            <button className="btn-ghost" onClick={onLogout}>
              Sign out
            </button>
            {isAdmin ? (
              <>
                <button className="btn-ghost" onClick={onGoToDemand}>
                  Demand Management
                </button>
                <button
                  className="btn-primary"
                  onClick={() => setShowEmployeeForm(true)}
                >
                  + Add Employee
                </button>
              </>
            ) : (
              <button className="btn-primary">Get started →</button>
            )}
          </div>
        </nav>

        {/* HERO */}
        <section className="hero">
          <div className="hero-bg-orb orb-1" />
          <div className="hero-bg-orb orb-2" />
          <div className="hero-bg-orb orb-3" />

          <div className="hero-badge">
            <div className="badge-dot" />
            Smart Resource Hiring V.1.0.0
          </div>

          <h1 className="hero-title">
            <span className="accent"> AI-Powered</span>
            <br />
            Smart Hiring System
            <span className="accent-gold"></span>
          </h1>
          <p className="hero-paragraph">
            Smart Hiring Resource enables organizations to efficiently manage
            hiring, staffing, and resource allocation from <br /> requirement
            creation to project fulfillment.
          </p>

          {/* DASHBOARD PREVIEW */}
          <div className="preview-section">
            <div className="preview-frame">
              <div className="preview-bar">
                <div
                  className="preview-dot"
                  style={{ background: '#ff5f57' }}
                />
                <div
                  className="preview-dot"
                  style={{ background: '#febc2e' }}
                />
                <div
                  className="preview-dot"
                  style={{ background: '#28c840' }}
                />
                <span className="preview-bar-title">
                  srh.enterprise.io/people
                </span>
              </div>
              <div className="preview-body">
                <div className="preview-sidebar">
                  <div className="sidebar-logo">
                    <div className="sidebar-logo-mark">S</div>
                    SRH Portal
                  </div>
                  <div className="sidebar-section">Main</div>
                  {SIDEBAR_ITEMS.map((item) => (
                    <div
                      key={item.label}
                      className={`sidebar-item ${activeNav === item.label || (item.active && activeNav === 'People') ? 'active' : ''}`}
                      onClick={() => setActiveNav(item.label)}
                    >
                      <span style={{ fontSize: 15 }}>{item.icon}</span>
                      {item.label}
                    </div>
                  ))}
                </div>

                <div className="preview-main">
                  <div className="preview-topbar">
                    <div className="preview-topbar-title">People View</div>
                    <div className="preview-topbar-right">
                      <button className="mini-btn" type="button">
                        Filter
                      </button>
                      <button className="mini-btn" type="button">
                        Export
                      </button>
                      {isAdmin && (
                        <button
                          className="mini-btn accent"
                          type="button"
                          onClick={() => setShowEmployeeForm(true)}
                        >
                          + Add Employee
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="preview-content">
                    <div className="metrics-row">
                      <div className="metric-card cyan">
                        <div className="metric-label">On Bench</div>
                        <div className="metric-value">24</div>
                        <div className="metric-sub">Available now</div>
                      </div>
                      <div className="metric-card gold">
                        <div className="metric-label">Shortlisted</div>
                        <div className="metric-value">8</div>
                        <div className="metric-sub">In consideration</div>
                      </div>
                      <div className="metric-card green">
                        <div className="metric-label">Allocated</div>
                        <div className="metric-value">61</div>
                        <div className="metric-sub">Active on projects</div>
                      </div>
                      <div className="metric-card">
                        <div className="metric-label">Fulfilment Rate</div>
                        <div className="metric-value">94%</div>
                        <div className="metric-sub">Last 30 days</div>
                      </div>
                    </div>

                    <div className="table-section">
                      <div className="table-header">
                        <span className="table-title">Ranked Candidates</span>
                        <span className="table-badge">
                          React · 3+ yrs · Bangalore
                        </span>
                      </div>
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Skills</th>
                            <th>Match Score</th>
                            <th>Bench</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {EMPLOYEES.map((e, i) => (
                            <tr key={i}>
                              <td
                                style={{
                                  color: 'var(--text)',
                                  fontWeight: 500,
                                }}
                              >
                                {e.name}
                              </td>
                              <td>{e.skills}</td>
                              <td>
                                <div className="rank-score">
                                  <span
                                    style={{
                                      color: 'var(--text)',
                                      fontWeight: 600,
                                      fontSize: 13,
                                    }}
                                  >
                                    {e.score}%
                                  </span>
                                  <div className="score-bar-wrap">
                                    <div
                                      className="score-bar"
                                      style={{ width: `${e.score}%` }}
                                    />
                                  </div>
                                </div>
                              </td>
                              <td>{e.days}</td>
                              <td>
                                <span
                                  className={`status-pill ${e.status === 'bench' ? 'status-bench' : e.status === 'allocated' ? 'status-alloc' : 'status-short'}`}
                                >
                                  {e.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* FEATURES */}
      <section className="section">
        <RevealDiv>
          <div className="section-tag">Capabilities</div>
          <h2 className="section-title">
            Everything you need to staff smarter
          </h2>
          <p className="section-desc">
            From profile ingestion to project closure — every step of the
            staffing lifecycle in one auditable platform.
          </p>
        </RevealDiv>
        <RevealDiv delay={0.1}>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card">
                <div className={`feature-icon ${f.color}`}>{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </RevealDiv>
      </section>

      {/* RANKING */}
      <section className="ranking-section">
        <div
          style={{
            maxWidth: 960,
            margin: '0 auto',
            display: 'flex',
            gap: 80,
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >
          <RevealDiv style={{ flex: '0 0 auto', maxWidth: 420 }}>
            <div className="section-tag">Ranking Engine</div>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              Objective scoring, every time
            </h2>
            <p className="section-desc" style={{ marginBottom: 0 }}>
              No more gut-feel hiring decisions. The composite ranking formula
              ensures the most available, best-matched candidate rises to the
              top automatically.
            </p>
          </RevealDiv>
          <RevealDiv delay={0.15} style={{ flex: 1, minWidth: 300 }}>
            <div className="ranking-card">
              <div
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'var(--text)',
                  marginBottom: 4,
                }}
              >
                Composite Score Formula
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                Applied to every candidate for a requirement
              </div>
              <div className="formula">
                Score =<br />
                &nbsp;&nbsp;skill_match% &nbsp;× 0.6 +<br />
                &nbsp;&nbsp;bench_days_norm × 0.3 +<br />
                &nbsp;&nbsp;perf_rating &nbsp;&nbsp;&nbsp;× 0.1
              </div>
              <div className="weight-bars">
                {[
                  { label: 'Skill match %', pct: 60, color: 'var(--cyan)' },
                  { label: 'Bench duration', pct: 30, color: 'var(--gold)' },
                  {
                    label: 'Performance rating',
                    pct: 10,
                    color: 'var(--blue-light)',
                  },
                ].map((w, i) => (
                  <div key={i} className="weight-item">
                    <div className="weight-label">{w.label}</div>
                    <div className="weight-track">
                      <div
                        className="weight-fill"
                        style={{ width: `${w.pct}%`, background: w.color }}
                      />
                    </div>
                    <div className="weight-pct">{w.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </RevealDiv>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="cta-glow" />
        <RevealDiv>
          <h2 className="cta-title">Ready to staff your projects smarter?</h2>
          <p className="cta-sub">
            Join teams already using SRH to eliminate staffing chaos.
          </p>
          <div className="cta-actions">
            <button className="btn-hero">Get started for free →</button>
            <button className="btn-hero-outline">View documentation</button>
          </div>
        </RevealDiv>
      </section>

      {/* ADD EMPLOYEE MODAL */}
      {isAdmin && showEmployeeForm && (
        <div className="employee-modal-backdrop">
          <div
            className="employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
          >
            <div className="employee-modal-header">
              <div>
                <div className="employee-modal-kicker">Admin Action</div>
                <h2 id="employee-form-title">Add Employee</h2>
              </div>
              <button
                className="employee-close"
                type="button"
                onClick={() => setShowEmployeeForm(false)}
                aria-label="Close"
              >
                X
              </button>
            </div>

            <form className="employee-form" onSubmit={handleCreateEmployee}>
              <label className="employee-field">
                <span>Name</span>
                <input
                  value={employeeForm.name}
                  onChange={(e) => updateEmployeeForm('name', e.target.value)}
                  required
                />
              </label>
              <label className="employee-field">
                <span>Email</span>
                <input
                  type="email"
                  value={employeeForm.email}
                  onChange={(e) => updateEmployeeForm('email', e.target.value)}
                  required
                />
              </label>
              <label className="employee-field">
                <span>Password</span>
                <input
                  type="password"
                  value={employeeForm.password}
                  onChange={(e) =>
                    updateEmployeeForm('password', e.target.value)
                  }
                  required
                />
              </label>
              <label className="employee-field">
                <span>Role</span>
                <select
                  value={employeeForm.role}
                  onChange={(e) => updateEmployeeForm('role', e.target.value)}
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </label>

              {employeeStatus && (
                <div className="employee-form-status">{employeeStatus}</div>
              )}

              <div className="employee-form-actions">
                <button
                  className="btn-ghost"
                  type="button"
                  onClick={() => setShowEmployeeForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-primary"
                  type="submit"
                  disabled={isSavingEmployee}
                >
                  {isSavingEmployee ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="footer-left">
          © 2026 Smart Resource Hiring — Enterprise Resource Management Portal
        </div>
        <div className="footer-links">
          {['Privacy', 'Terms', 'Documentation', 'Support'].map((l) => (
            <a key={l} href="#">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </>
  );
}
