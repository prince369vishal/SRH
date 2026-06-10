import { useEffect, useMemo, useState } from 'react';
import './SRHHomepage.css';
import logo from '../assets/Logo.png';
import { API_BASE_URL } from '../config.js';

const ROLE_OPTIONS = ['EMPLOYEE', 'OPERATOR', 'PROJECT_ADMIN', 'ADMIN'];
const DEFAULT_EMPLOYEE_FORM = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  phoneNumber: '',
  department: '',
  designation: '',
  location: '',
  status: 'ON_BENCH',
};

const DEFAULT_EDIT_FORM = {
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'EMPLOYEE',
  phoneNumber: '',
  department: '',
  designation: '',
  location: '',
  status: 'ON_BENCH',
  skillsText: '',
  certificationsText: '',
};

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function fullName(employee) {
  return [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || '-';
}

function listToText(items, key) {
  return (items || []).map((item) => item?.[key]).filter(Boolean).join(', ');
}

function textToSkills(value) {
  return value
    .split(',')
    .map((skillName) => skillName.trim())
    .filter(Boolean)
    .map((skillName) => ({ skillName }));
}

function textToCertifications(value) {
  return value
    .split(',')
    .map((certificationName) => certificationName.trim())
    .filter(Boolean)
    .map((certificationName) => ({ certificationName }));
}

function employeeToEditForm(employee) {
  return {
    ...DEFAULT_EDIT_FORM,
    employeeCode: employee?.employeeCode || '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    role: employee?.role || 'EMPLOYEE',
    phoneNumber: employee?.phoneNumber || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    location: employee?.location || '',
    status: employee?.status || 'ON_BENCH',
    skillsText: listToText(employee?.skills, 'skillName'),
    certificationsText: listToText(employee?.certifications, 'certificationName'),
  };
}

export default function SRHHomepage({ currentUser, onLogout }) {
  const isPrivileged = ['ADMIN', 'PROJECT_ADMIN', 'OPERATOR'].includes(currentUser?.role);
  const landingView = currentUser?.role === 'PROJECT_ADMIN' ? 'Projects' : isPrivileged ? 'People' : 'Profile';
  const [activeNav, setActiveNav] = useState(landingView);
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EDIT_FORM);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const visibleEmployees = useMemo(() => {
    if (isPrivileged) return employees;
    return profile ? [profile] : [];
  }, [employees, isPrivileged, profile]);

  const metrics = useMemo(() => ({
    bench: visibleEmployees.filter((employee) => employee.status === 'ON_BENCH').length,
    shortlisted: visibleEmployees.filter((employee) => employee.status === 'SHORTLISTED').length,
    allocated: visibleEmployees.filter((employee) => employee.status === 'ALLOCATED').length,
    total: visibleEmployees.length,
  }), [visibleEmployees]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setStatus('');

      try {
        const profileResponse = await fetch(`${API_BASE_URL}/api/employees/me`, {
          headers: authHeaders(currentUser?.token),
        });

        if (!profileResponse.ok) {
          throw new Error('Session expired or profile access denied.');
        }

        setProfile(await profileResponse.json());

        if (isPrivileged) {
          const employeesResponse = await fetch(`${API_BASE_URL}/api/admin/employees`, {
            headers: authHeaders(currentUser?.token),
          });

          if (!employeesResponse.ok) {
            throw new Error('Employee list access denied for this role.');
          }

          setEmployees(await employeesResponse.json());
        }
      } catch (error) {
        setStatus(error.message || 'Could not load employee data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [currentUser?.token, isPrivileged]);

  function updateEmployeeForm(field, value) {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function openEditEmployee(employee) {
    setEditingEmployee(employee);
    setEditForm(employeeToEditForm(employee));
  }

  async function handleCreateEmployee(event) {
    event.preventDefault();
    setStatus('');
    setIsSavingEmployee(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        method: 'POST',
        headers: authHeaders(currentUser?.token),
        body: JSON.stringify(employeeForm),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not add employee.');
      }

      const createdEmployee = await response.json();
      setEmployees((current) => [createdEmployee, ...current]);
      setEmployeeForm(DEFAULT_EMPLOYEE_FORM);
      setShowEmployeeForm(false);
      setStatus(`${fullName(createdEmployee)} was added successfully.`);
    } catch (error) {
      setStatus(error.message || 'Could not add employee.');
    } finally {
      setIsSavingEmployee(false);
    }
  }

  async function handleUpdateEmployee(event) {
    event.preventDefault();
    if (!editingEmployee) return;

    setStatus('');
    setIsSavingEdit(true);

    const isOwnProfile = editingEmployee.id === profile?.id;
    const selfServicePayload = {
      phoneNumber: editForm.phoneNumber,
      location: editForm.location,
      skills: textToSkills(editForm.skillsText),
      certifications: textToCertifications(editForm.certificationsText),
    };

    const managedPayload = {
      employeeCode: editForm.employeeCode,
      firstName: editForm.firstName,
      lastName: editForm.lastName,
      email: editForm.email,
      role: editForm.role,
      phoneNumber: editForm.phoneNumber,
      department: editForm.department,
      designation: editForm.designation,
      location: editForm.location,
      status: editForm.status,
      skills: textToSkills(editForm.skillsText),
      certifications: textToCertifications(editForm.certificationsText),
    };

    if (editForm.password.trim()) {
      managedPayload.password = editForm.password.trim();
    }

    try {
      const response = await fetch(
        isPrivileged && !isOwnProfile
          ? `${API_BASE_URL}/api/admin/employees/${editingEmployee.id}`
          : `${API_BASE_URL}/api/employees/me`,
        {
          method: 'PUT',
          headers: authHeaders(currentUser?.token),
          body: JSON.stringify(isPrivileged && !isOwnProfile ? managedPayload : selfServicePayload),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not update employee.');
      }

      const updatedEmployee = await response.json();
      if (updatedEmployee.id === profile?.id) {
        setProfile(updatedEmployee);
      }
      setEmployees((current) => current.map((employee) => (
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      )));
      setEditingEmployee(null);
      setEditForm(DEFAULT_EDIT_FORM);
      setStatus(`${fullName(updatedEmployee)} was updated successfully.`);
    } catch (error) {
      setStatus(error.message || 'Could not update employee.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  return (
    <div className="srh-root app-shell">
      <nav>
        <div className="nav-logo">
          <div className="nav-logo-mark">
            <img src={logo} alt="Company Logo" />
          </div>
          Smart Resource Hiring
        </div>
        <div className="nav-links">
          {['People', 'Projects', 'Clients', 'Interviews'].map((item) => (
            <a key={item} href="#" onClick={(event) => { event.preventDefault(); setActiveNav(item); }}>
              {item}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <span className="nav-user">{currentUser?.email} · {currentUser?.role}</span>
          <button className="btn-ghost" onClick={onLogout}>Sign out</button>
          {isPrivileged ? (
            <button className="btn-primary" onClick={() => setShowEmployeeForm(true)}>+ Add Employee</button>
          ) : (
            <button className="btn-primary" onClick={() => setActiveNav('Profile')}>My Profile</button>
          )}
        </div>
      </nav>

      <main className="workspace">
        <aside className="preview-sidebar workspace-sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">S</div>
            SRH Portal
          </div>
          <div className="sidebar-section">Workspace</div>
          {['Profile', 'People', 'Projects', 'Clients', 'Interviews', 'Audit Log'].map((item) => (
            <button
              key={item}
              className={`sidebar-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
              type="button"
            >
              <span>{item.slice(0, 1)}</span>
              {item}
            </button>
          ))}
        </aside>

        <section className="workspace-main">
          <div className="preview-topbar">
            <div>
              <div className="preview-topbar-title">
                {activeNav === 'Projects' ? 'Project View' : activeNav === 'Profile' ? 'Employee Profile' : 'People View'}
              </div>
              <div className="workspace-subtitle">
                {isPrivileged
                  ? 'Admin, project admin, and operator roles can manage employee data.'
                  : 'Employees can view their own profile and update allowed fields only.'}
              </div>
            </div>
            <div className="preview-topbar-right">
              {isPrivileged ? <button className="mini-btn" type="button">Filter</button> : null}
              {isPrivileged ? <button className="mini-btn" type="button">Export</button> : null}
            </div>
          </div>

          <div className="preview-content workspace-content">
            <div className="metrics-row">
              <div className="metric-card cyan">
                <div className="metric-label">On Bench</div>
                <div className="metric-value">{metrics.bench}</div>
                <div className="metric-sub">Available now</div>
              </div>
              <div className="metric-card gold">
                <div className="metric-label">Shortlisted</div>
                <div className="metric-value">{metrics.shortlisted}</div>
                <div className="metric-sub">In consideration</div>
              </div>
              <div className="metric-card green">
                <div className="metric-label">Allocated</div>
                <div className="metric-value">{metrics.allocated}</div>
                <div className="metric-sub">Active projects</div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Profiles</div>
                <div className="metric-value">{metrics.total}</div>
                <div className="metric-sub">{isPrivileged ? 'Visible records' : 'Your account'}</div>
              </div>
            </div>

            {status ? <div className="employee-form-status">{status}</div> : null}

            {activeNav === 'Projects' ? (
              <div className="empty-state">
                <h2>Project workspace</h2>
                <p>Project routing is ready for project administrators. Project CRUD can be connected after the project entities are added.</p>
              </div>
            ) : (
              <div className="table-section">
                <div className="table-header">
                  <span className="table-title">{isPrivileged && activeNav !== 'Profile' ? 'Employees' : 'My Profile'}</span>
                  <span className="table-badge">{isLoading ? 'Loading' : `${visibleEmployees.length} record(s)`}</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Department</th>
                      <th>Location</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleEmployees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.employeeCode}</td>
                        <td style={{ color: 'var(--text)', fontWeight: 600 }}>{fullName(employee)}</td>
                        <td>{employee.email}</td>
                        <td>{employee.department || '-'}</td>
                        <td>{employee.location || '-'}</td>
                        <td>{employee.role}</td>
                        <td>
                          <span className={`status-pill ${employee.status === 'ON_BENCH' ? 'status-bench' : employee.status === 'ALLOCATED' ? 'status-alloc' : 'status-short'}`}>
                            {employee.status}
                          </span>
                        </td>
                        <td>
                          <button className="mini-btn" type="button" onClick={() => openEditEmployee(employee)}>
                            Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {isPrivileged && showEmployeeForm ? (
        <div className="employee-modal-backdrop">
          <div className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
            <div className="employee-modal-header">
              <div>
                <div className="employee-modal-kicker">Admin Action</div>
                <h2 id="employee-form-title">Add Employee</h2>
              </div>
              <button className="employee-close" type="button" onClick={() => setShowEmployeeForm(false)} aria-label="Close add employee form">
                X
              </button>
            </div>

            <form className="employee-form" onSubmit={handleCreateEmployee}>
              <label className="employee-field">
                <span>Employee Code</span>
                <input value={employeeForm.employeeCode} onChange={(event) => updateEmployeeForm('employeeCode', event.target.value)} required />
              </label>
              <label className="employee-field">
                <span>First Name</span>
                <input value={employeeForm.firstName} onChange={(event) => updateEmployeeForm('firstName', event.target.value)} required />
              </label>
              <label className="employee-field">
                <span>Last Name</span>
                <input value={employeeForm.lastName} onChange={(event) => updateEmployeeForm('lastName', event.target.value)} required />
              </label>
              <label className="employee-field">
                <span>Email</span>
                <input type="email" value={employeeForm.email} onChange={(event) => updateEmployeeForm('email', event.target.value)} required />
              </label>
              <label className="employee-field">
                <span>Temporary Password</span>
                <input type="password" value={employeeForm.password} onChange={(event) => updateEmployeeForm('password', event.target.value)} required minLength={6} />
              </label>
              <label className="employee-field">
                <span>Role</span>
                <select value={employeeForm.role} onChange={(event) => updateEmployeeForm('role', event.target.value)}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className="employee-field">
                <span>Department</span>
                <input value={employeeForm.department} onChange={(event) => updateEmployeeForm('department', event.target.value)} />
              </label>
              <label className="employee-field">
                <span>Designation</span>
                <input value={employeeForm.designation} onChange={(event) => updateEmployeeForm('designation', event.target.value)} />
              </label>
              <label className="employee-field">
                <span>Location</span>
                <input value={employeeForm.location} onChange={(event) => updateEmployeeForm('location', event.target.value)} />
              </label>

              <div className="employee-form-actions">
                <button className="btn-ghost" type="button" onClick={() => setShowEmployeeForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={isSavingEmployee}>
                  {isSavingEmployee ? 'Saving...' : 'Save Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editingEmployee ? (
        <div className="employee-modal-backdrop">
          <div className="employee-modal employee-modal-wide" role="dialog" aria-modal="true" aria-labelledby="employee-edit-title">
            <div className="employee-modal-header">
              <div>
                <div className="employee-modal-kicker">
                  {isPrivileged && editingEmployee.id !== profile?.id ? 'Managed Edit' : 'Self Service'}
                </div>
                <h2 id="employee-edit-title">Edit Employee</h2>
              </div>
              <button className="employee-close" type="button" onClick={() => setEditingEmployee(null)} aria-label="Close edit employee form">
                X
              </button>
            </div>

            <form className="employee-form employee-form-grid" onSubmit={handleUpdateEmployee}>
              <label className="employee-field">
                <span>Employee Code</span>
                <input value={editForm.employeeCode} onChange={(event) => updateEditForm('employeeCode', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} required />
              </label>
              <label className="employee-field">
                <span>First Name</span>
                <input value={editForm.firstName} onChange={(event) => updateEditForm('firstName', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} required />
              </label>
              <label className="employee-field">
                <span>Last Name</span>
                <input value={editForm.lastName} onChange={(event) => updateEditForm('lastName', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} required />
              </label>
              <label className="employee-field">
                <span>Email</span>
                <input type="email" value={editForm.email} onChange={(event) => updateEditForm('email', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} required />
              </label>
              <label className="employee-field">
                <span>Phone</span>
                <input value={editForm.phoneNumber} onChange={(event) => updateEditForm('phoneNumber', event.target.value)} />
              </label>
              <label className="employee-field">
                <span>Location</span>
                <input value={editForm.location} onChange={(event) => updateEditForm('location', event.target.value)} />
              </label>
              <label className="employee-field">
                <span>Department</span>
                <input value={editForm.department} onChange={(event) => updateEditForm('department', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} />
              </label>
              <label className="employee-field">
                <span>Designation</span>
                <input value={editForm.designation} onChange={(event) => updateEditForm('designation', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id} />
              </label>
              <label className="employee-field">
                <span>Role</span>
                <select value={editForm.role} onChange={(event) => updateEditForm('role', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id}>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </label>
              <label className="employee-field">
                <span>Status</span>
                <select value={editForm.status} onChange={(event) => updateEditForm('status', event.target.value)} disabled={!isPrivileged || editingEmployee.id === profile?.id}>
                  {['ON_BENCH', 'SHORTLISTED', 'ALLOCATED'].map((employeeStatus) => (
                    <option key={employeeStatus} value={employeeStatus}>{employeeStatus}</option>
                  ))}
                </select>
              </label>
              <label className="employee-field">
                <span>Skills</span>
                <input value={editForm.skillsText} onChange={(event) => updateEditForm('skillsText', event.target.value)} placeholder="Java, React, PostgreSQL" />
              </label>
              <label className="employee-field">
                <span>Certifications</span>
                <input value={editForm.certificationsText} onChange={(event) => updateEditForm('certificationsText', event.target.value)} placeholder="AWS, Scrum Master" />
              </label>
              {isPrivileged && editingEmployee.id !== profile?.id ? (
                <label className="employee-field">
                  <span>Reset Password</span>
                  <input type="password" value={editForm.password} onChange={(event) => updateEditForm('password', event.target.value)} minLength={6} placeholder="Leave blank to keep existing" />
                </label>
              ) : null}

              <div className="employee-form-actions employee-form-actions-wide">
                <button className="btn-ghost" type="button" onClick={() => setEditingEmployee(null)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={isSavingEdit}>
                  {isSavingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
