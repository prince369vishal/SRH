import { useEffect, useMemo, useState } from 'react';
import './SRHHomepage.css';
import logo from '../assets/Logo.png';
import { API_BASE_URL } from '../config.js';

const ROLE_OPTIONS = ['EMPLOYEE', 'OPERATOR', 'PROJECT_ADMINISTRATOR', 'ADMIN'];
const EMPLOYEE_STATUS_OPTIONS = ['ON_BENCH', 'SHORTLISTED', 'ALLOCATED'];
const PROJECT_STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'FULFILLED', 'CLOSED'];

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
  joiningDate: '',
  location: '',
  managerId: '',
  experienceYears: '',
  benchStartDate: '',
  status: 'ON_BENCH',
  active: true,
  firstLogin: true,
  skillsText: '',
  certificationsText: '',
  projectHistoryText: '',
};

const DEFAULT_PROJECT_FORM = {
  projectName: '',
  description: '',
  requiredSkillsText: '',
  requiredExperience: '',
  numberOfResourcesRequired: 1,
  department: '',
  location: '',
  status: 'OPEN',
};

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

function bearerHeaders(token) {
  return { Authorization: `Bearer ${token}` };
}

function fullName(employee) {
  return [employee?.firstName, employee?.lastName].filter(Boolean).join(' ') || '-';
}

function listToText(items, key) {
  return (items || []).map((item) => item?.[key]).filter(Boolean).join(', ');
}

function projectSkillsToText(skills) {
  return (skills || []).filter(Boolean).join(', ');
}

function splitText(value) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function textToSkills(value) {
  return splitText(value).map((skillName) => ({ skillName }));
}

function textToCertifications(value) {
  return splitText(value).map((certificationName) => ({ certificationName }));
}

function textToProjectHistory(value) {
  return splitText(value).map((projectName) => ({ projectName }));
}

function nullable(value) {
  return value === '' || value === null || value === undefined ? null : value;
}

function employeeToForm(employee) {
  return {
    ...DEFAULT_EMPLOYEE_FORM,
    employeeCode: employee?.employeeCode || '',
    firstName: employee?.firstName || '',
    lastName: employee?.lastName || '',
    email: employee?.email || '',
    password: '',
    role: employee?.role === 'PROJECT_ADMIN' ? 'PROJECT_ADMINISTRATOR' : employee?.role || 'EMPLOYEE',
    phoneNumber: employee?.phoneNumber || '',
    department: employee?.department || '',
    designation: employee?.designation || '',
    joiningDate: employee?.joiningDate || '',
    location: employee?.location || '',
    managerId: employee?.managerId || '',
    experienceYears: employee?.experienceYears || '',
    benchStartDate: employee?.benchStartDate || '',
    status: employee?.status || 'ON_BENCH',
    active: employee?.active ?? true,
    firstLogin: employee?.firstLogin ?? true,
    skillsText: listToText(employee?.skills, 'skillName'),
    certificationsText: listToText(employee?.certifications, 'certificationName'),
    projectHistoryText: listToText(employee?.projectHistory, 'projectName'),
  };
}

function projectToForm(project) {
  return {
    ...DEFAULT_PROJECT_FORM,
    projectName: project?.projectName || '',
    description: project?.description || '',
    requiredSkillsText: projectSkillsToText(project?.requiredSkills),
    requiredExperience: project?.requiredExperience || '',
    numberOfResourcesRequired: project?.numberOfResourcesRequired || 1,
    department: project?.department || '',
    location: project?.location || '',
    status: project?.status || 'OPEN',
  };
}

function toEmployeePayload(form, includePassword = true) {
  const payload = {
    employeeCode: form.employeeCode,
    firstName: form.firstName,
    lastName: form.lastName,
    email: form.email,
    role: form.role,
    phoneNumber: form.phoneNumber,
    department: form.department,
    designation: form.designation,
    joiningDate: nullable(form.joiningDate),
    location: form.location,
    managerId: nullable(form.managerId),
    experienceYears: nullable(form.experienceYears),
    benchStartDate: nullable(form.benchStartDate),
    active: form.active,
    skills: textToSkills(form.skillsText),
    certifications: textToCertifications(form.certificationsText),
    projectHistory: textToProjectHistory(form.projectHistoryText),
  };

  if (form.role !== 'PROJECT_ADMINISTRATOR' && form.role !== 'PROJECT_ADMIN') {
    payload.status = form.status;
  }

  if (includePassword || form.password.trim()) {
    payload.password = form.password.trim();
  }

  return payload;
}

function toSelfServicePayload(form) {
  return {
    phoneNumber: form.phoneNumber,
    location: form.location,
    experienceYears: nullable(form.experienceYears),
    skills: textToSkills(form.skillsText),
    certifications: textToCertifications(form.certificationsText),
  };
}

function toProjectPayload(form) {
  return {
    projectName: form.projectName,
    description: form.description,
    requiredSkills: splitText(form.requiredSkillsText),
    requiredExperience: nullable(form.requiredExperience),
    numberOfResourcesRequired: Number(form.numberOfResourcesRequired),
    department: form.department,
    location: form.location,
    status: form.status,
  };
}

export default function SRHHomepage({ currentUser, onLogout, onGoToDemand }) {
  const role = currentUser?.role === 'PROJECT_ADMIN' ? 'PROJECT_ADMINISTRATOR' : currentUser?.role;
  const isAdmin = role === 'ADMIN';
  const isOperator = role === 'OPERATOR';
  const isProjectAdministrator = role === 'PROJECT_ADMINISTRATOR';
  const canManageEmployees = isAdmin;
  const canViewEmployees = isAdmin || isOperator;
  const canImportEmployees = isOperator;
  const canManageDemand = isProjectAdministrator;
  const landingView = canManageDemand ? 'Demand' : canViewEmployees ? 'People' : 'Profile';

  const [activeNav, setActiveNav] = useState(landingView);
  const [profile, setProfile] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [employeeForm, setEmployeeForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editForm, setEditForm] = useState(DEFAULT_EMPLOYEE_FORM);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectForm, setProjectForm] = useState(DEFAULT_PROJECT_FORM);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingEmployee, setIsSavingEmployee] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (canManageDemand && onGoToDemand) {
      onGoToDemand();
    }
  }, [canManageDemand, onGoToDemand]);

  const navItems = useMemo(() => [
    'Profile',
    ...(canViewEmployees ? ['People'] : []),
    ...(canManageDemand ? ['Demand'] : []),
    ...(canImportEmployees ? ['Bulk Import'] : []),
  ], [canImportEmployees, canManageDemand, canViewEmployees]);

  const visibleEmployees = useMemo(() => {
    if (canViewEmployees) return employees;
    return profile ? [profile] : [];
  }, [employees, canViewEmployees, profile]);

  const metrics = useMemo(() => ({
    bench: visibleEmployees.filter((employee) => employee.status === 'ON_BENCH').length,
    shortlisted: visibleEmployees.filter((employee) => employee.status === 'SHORTLISTED').length,
    allocated: visibleEmployees.filter((employee) => employee.status === 'ALLOCATED').length,
    total: visibleEmployees.length,
    demand: projects.length,
  }), [projects.length, visibleEmployees]);

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

        if (canViewEmployees) {
          const employeesResponse = await fetch(`${API_BASE_URL}/api/admin/employees`, {
            headers: authHeaders(currentUser?.token),
          });

          if (!employeesResponse.ok) {
            throw new Error('Employee list access denied for this role.');
          }

          setEmployees(await employeesResponse.json());
        }

        if (canManageDemand) {
          const projectsResponse = await fetch(`${API_BASE_URL}/api/demands/projects`, {
            headers: authHeaders(currentUser?.token),
          });

          if (!projectsResponse.ok) {
            throw new Error('Demand management access denied for this role.');
          }

          setProjects(await projectsResponse.json());
        }
      } catch (error) {
        setStatus(error.message || 'Could not load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [canManageDemand, canViewEmployees, currentUser?.token]);

  function updateEmployeeForm(field, value) {
    setEmployeeForm((current) => ({ ...current, [field]: value }));
  }

  function updateEditForm(field, value) {
    setEditForm((current) => ({ ...current, [field]: value }));
  }

  function updateProjectForm(field, value) {
    setProjectForm((current) => ({ ...current, [field]: value }));
  }

  function openEditEmployee(employee) {
    setEditingEmployee(employee);
    setEditForm(employeeToForm(employee));
  }

  function openCreateProject() {
    setEditingProject(null);
    setProjectForm(DEFAULT_PROJECT_FORM);
    setShowProjectForm(true);
  }

  function openEditProject(project) {
    setEditingProject(project);
    setProjectForm(projectToForm(project));
    setShowProjectForm(true);
  }

  async function handleCreateEmployee(event) {
    event.preventDefault();
    setStatus('');
    setIsSavingEmployee(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        method: 'POST',
        headers: authHeaders(currentUser?.token),
        body: JSON.stringify(toEmployeePayload(employeeForm)),
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

    const isOwnProfile = editingEmployee.id === profile?.id;
    if (!canManageEmployees && !isOwnProfile) return;
    const useManagedEndpoint = canManageEmployees;

    setStatus('');
    setIsSavingEdit(true);

    try {
      const response = await fetch(
        useManagedEndpoint
          ? `${API_BASE_URL}/api/admin/employees/${editingEmployee.id}`
          : `${API_BASE_URL}/api/employees/me`,
        {
          method: 'PUT',
          headers: authHeaders(currentUser?.token),
          body: JSON.stringify(useManagedEndpoint ? toEmployeePayload(editForm, false) : toSelfServicePayload(editForm)),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not update employee.');
      }

      const updatedEmployee = await response.json();
      if (updatedEmployee.id === profile?.id) setProfile(updatedEmployee);
      setEmployees((current) => current.map((employee) => (
        employee.id === updatedEmployee.id ? updatedEmployee : employee
      )));
      setEditingEmployee(null);
      setEditForm(DEFAULT_EMPLOYEE_FORM);
      setStatus(`${fullName(updatedEmployee)} was updated successfully.`);
    } catch (error) {
      setStatus(error.message || 'Could not update employee.');
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleSaveProject(event) {
    event.preventDefault();
    setStatus('');
    setIsSavingProject(true);

    try {
      const response = await fetch(
        editingProject
          ? `${API_BASE_URL}/api/demands/projects/${editingProject.id}`
          : `${API_BASE_URL}/api/demands/projects`,
        {
          method: editingProject ? 'PUT' : 'POST',
          headers: authHeaders(currentUser?.token),
          body: JSON.stringify(toProjectPayload(projectForm)),
        },
      );

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not save project demand.');
      }

      const savedProject = await response.json();
      setProjects((current) => (
        editingProject
          ? current.map((project) => (project.id === savedProject.id ? savedProject : project))
          : [savedProject, ...current]
      ));
      setShowProjectForm(false);
      setEditingProject(null);
      setProjectForm(DEFAULT_PROJECT_FORM);
      setStatus(`${savedProject.projectName} demand was saved.`);
    } catch (error) {
      setStatus(error.message || 'Could not save project demand.');
    } finally {
      setIsSavingProject(false);
    }
  }

  async function handleDeleteProject(project) {
    setStatus('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/demands/projects/${project.id}`, {
        method: 'DELETE',
        headers: authHeaders(currentUser?.token),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not delete project demand.');
      }

      setProjects((current) => current.filter((item) => item.id !== project.id));
      setStatus(`${project.projectName} demand was deleted.`);
    } catch (error) {
      setStatus(error.message || 'Could not delete project demand.');
    }
  }

  async function handleImportEmployees(event) {
    event.preventDefault();
    if (!importFile) {
      setStatus('Choose a CSV or Excel file first.');
      return;
    }

    setStatus('');
    setIsImporting(true);

    try {
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await fetch(`${API_BASE_URL}/api/operator/employees/import`, {
        method: 'POST',
        headers: bearerHeaders(currentUser?.token),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Could not import employees.');
      }

      const result = await response.json();
      setShowImportForm(false);
      setImportFile(null);
      setStatus(`Imported ${result.importedCount} employee(s). Skipped ${result.skippedCount}. ${result.errors?.join(' ') || ''}`);

      const employeesResponse = await fetch(`${API_BASE_URL}/api/admin/employees`, {
        headers: authHeaders(currentUser?.token),
      });
      if (!employeesResponse.ok) {
        throw new Error('Imported employees, but could not refresh employee list.');
      }

      setEmployees(await employeesResponse.json());
      setActiveNav('People');
    } catch (error) {
      setStatus(error.message || 'Could not import employees.');
    } finally {
      setIsImporting(false);
    }
  }

  function renderPeopleTable() {
    const employeesForTable = activeNav === 'Profile' && profile ? [profile] : visibleEmployees;

    return (
      <div className="table-section">
        <div className="table-header">
          <span className="table-title">{activeNav === 'Profile' ? 'My Profile' : 'Employees'}</span>
          <span className="table-badge">{isLoading ? 'Loading' : `${employeesForTable.length} record(s)`}</span>
        </div>
        <table className="data-table employee-data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Designation</th>
              <th>Location</th>
              <th>Manager</th>
              <th>Experience</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {employeesForTable.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.employeeCode}</td>
                <td style={{ color: 'var(--text)', fontWeight: 600 }}>{fullName(employee)}</td>
                <td>{employee.email}</td>
                <td>{employee.department || '-'}</td>
                <td>{employee.designation || '-'}</td>
                <td>{employee.location || '-'}</td>
                <td>{employee.managerId || '-'}</td>
                <td>{employee.experienceYears || '-'}</td>
                <td>{employee.role}</td>
                <td>
                  <span className={`status-pill ${employee.status === 'ON_BENCH' ? 'status-bench' : employee.status === 'ALLOCATED' ? 'status-alloc' : 'status-short'}`}>
                    {employee.status}
                  </span>
                </td>
                <td>
                  <button className="mini-btn" type="button" onClick={() => openEditEmployee(employee)}>
                    {canManageEmployees || employee.id === profile?.id ? 'Edit' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  function renderDemandTable() {
    return (
      <div className="table-section">
        <div className="table-header">
          <span className="table-title">Demand Projects</span>
          <span className="table-badge">{isLoading ? 'Loading' : `${projects.length} project(s)`}</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Skills</th>
              <th>Experience</th>
              <th>Resources</th>
              <th>Department</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td style={{ color: 'var(--text)', fontWeight: 600 }}>{project.projectName}</td>
                <td>{projectSkillsToText(project.requiredSkills) || '-'}</td>
                <td>{project.requiredExperience || '-'}</td>
                <td>{project.numberOfResourcesRequired}</td>
                <td>{project.department || '-'}</td>
                <td>{project.location || '-'}</td>
                <td><span className="status-pill status-short">{project.status}</span></td>
                <td>
                  <button className="mini-btn" type="button" onClick={() => openEditProject(project)}>Edit</button>
                  <button className="mini-btn danger" type="button" onClick={() => handleDeleteProject(project)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          {navItems.map((item) => (
            <a key={item} href="#" onClick={(event) => { event.preventDefault(); setActiveNav(item); }}>
              {item}
            </a>
          ))}
        </div>
        <div className="nav-actions">
          <span className="nav-user">{currentUser?.email} · {role}</span>
          <button className="btn-ghost" onClick={onLogout}>Sign out</button>
          {canManageDemand ? <button className="btn-primary" onClick={onGoToDemand || openCreateProject}>+ Create Project</button> : null}
          {canImportEmployees ? <button className="btn-ghost" onClick={() => setShowImportForm(true)}>Bulk Import</button> : null}
          {canManageEmployees ? (
            <button className="btn-primary" onClick={() => setShowEmployeeForm(true)}>+ Add Employee</button>
          ) : null}
        </div>
      </nav>

      <main className="workspace">
        <aside className="preview-sidebar workspace-sidebar">
          <div className="sidebar-logo">
            <div className="sidebar-logo-mark">S</div>
            SRH Portal
          </div>
          <div className="sidebar-section">Workspace</div>
          {navItems.map((item) => (
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
                {activeNav === 'Demand' ? 'Demand Management' : activeNav === 'Bulk Import' ? 'Bulk Import' : activeNav === 'Profile' ? 'Employee Profile' : 'People Dashboard'}
              </div>
              <div className="workspace-subtitle">
                {isAdmin
                  ? 'ADMIN can manually add and edit employee profiles.'
                  : isOperator
                    ? 'OPERATOR can bulk import and view employees.'
                    : isProjectAdministrator
                      ? 'PROJECT_ADMINISTRATOR can create and manage project demand.'
                      : 'Employees can view their profile and update allowed fields.'}
              </div>
            </div>
            <div className="preview-topbar-right">
              {canManageDemand && activeNav === 'Demand' ? <button className="mini-btn accent" type="button" onClick={openCreateProject}>New Demand</button> : null}
              {canImportEmployees && activeNav === 'Bulk Import' ? <button className="mini-btn accent" type="button" onClick={() => setShowImportForm(true)}>Upload File</button> : null}
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
                <div className="metric-label">{canManageDemand ? 'Demands' : 'Profiles'}</div>
                <div className="metric-value">{canManageDemand ? metrics.demand : metrics.total}</div>
                <div className="metric-sub">{canManageDemand ? 'Open workspace' : 'Visible records'}</div>
              </div>
            </div>

            {status ? <div className="employee-form-status">{status}</div> : null}

            {activeNav === 'Demand' && canManageDemand ? renderDemandTable() : null}
            {activeNav === 'Bulk Import' && canImportEmployees ? (
              <div className="empty-state">
                <h2>Bulk employee import</h2>
                <p>Upload a CSV or Excel file with employeeCode, email, password, role, firstName, lastName, department, designation, joiningDate, location, managerId, phoneNumber, status, skills, and experienceYears.</p>
                <button className="btn-primary import-inline-btn" type="button" onClick={() => setShowImportForm(true)}>Upload Import File</button>
              </div>
            ) : null}
            {(activeNav === 'People' || activeNav === 'Profile') ? renderPeopleTable() : null}
          </div>
        </section>
      </main>

      {canManageEmployees && showEmployeeForm ? (
        <EmployeeModal
          title="Add Employee"
          kicker="Manual Entry"
          form={employeeForm}
          onChange={updateEmployeeForm}
          onSubmit={handleCreateEmployee}
          onClose={() => setShowEmployeeForm(false)}
          isSaving={isSavingEmployee}
          submitLabel="Save Employee"
          canManageAllFields
          requirePassword
        />
      ) : null}

      {editingEmployee ? (
        <EmployeeModal
          title={canManageEmployees ? 'Edit Employee' : 'Employee Profile'}
          kicker={canManageEmployees ? 'Managed Edit' : editingEmployee.id === profile?.id ? 'Self Service' : 'View Only'}
          form={editForm}
          onChange={updateEditForm}
          onSubmit={handleUpdateEmployee}
          onClose={() => setEditingEmployee(null)}
          isSaving={isSavingEdit}
          submitLabel="Save Changes"
          canManageAllFields={canManageEmployees}
          readOnly={!canManageEmployees && editingEmployee.id !== profile?.id}
        />
      ) : null}

      {showProjectForm ? (
        <ProjectModal
          form={projectForm}
          isSaving={isSavingProject}
          isEditing={Boolean(editingProject)}
          onChange={updateProjectForm}
          onSubmit={handleSaveProject}
          onClose={() => { setShowProjectForm(false); setEditingProject(null); }}
        />
      ) : null}

      {showImportForm && canImportEmployees ? (
        <div className="employee-modal-backdrop">
          <div className="employee-modal" role="dialog" aria-modal="true" aria-labelledby="import-title">
            <div className="employee-modal-header">
              <div>
                <div className="employee-modal-kicker">Operator Action</div>
                <h2 id="import-title">Bulk Import Employees</h2>
              </div>
              <button className="employee-close" type="button" onClick={() => setShowImportForm(false)} aria-label="Close import form">X</button>
            </div>
            <form className="employee-form" onSubmit={handleImportEmployees}>
              <label className="employee-field">
                <span>CSV or Excel file</span>
                <input type="file" accept=".csv,.xlsx,.xls" onChange={(event) => setImportFile(event.target.files?.[0] || null)} required />
              </label>
              <div className="employee-form-actions">
                <button className="btn-ghost" type="button" onClick={() => setShowImportForm(false)}>Cancel</button>
                <button className="btn-primary" type="submit" disabled={isImporting}>{isImporting ? 'Importing...' : 'Import Employees'}</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmployeeModal({
  title,
  kicker,
  form,
  onChange,
  onSubmit,
  onClose,
  isSaving,
  submitLabel,
  canManageAllFields,
  readOnly = false,
  requirePassword = false,
}) {
  const lockManagedFields = !canManageAllFields;
  const disableAll = readOnly;
  const isEmployee = form.role === 'EMPLOYEE';
  const showEmployeeStatus = isEmployee;

  return (
    <div className="employee-modal-backdrop">
      <div className="employee-modal employee-modal-wide" role="dialog" aria-modal="true" aria-labelledby="employee-form-title">
        <div className="employee-modal-header">
          <div>
            <div className="employee-modal-kicker">{kicker}</div>
            <h2 id="employee-form-title">{title}</h2>
          </div>
          <button className="employee-close" type="button" onClick={onClose} aria-label="Close employee form">X</button>
        </div>

        <form className="employee-form employee-form-grid" onSubmit={onSubmit}>
          <label className="employee-field">
            <span>Role</span>
            <select value={form.role} onChange={(event) => onChange('role', event.target.value)} disabled={disableAll || lockManagedFields}>
              {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </label>
          <Field label="Employee Code" value={form.employeeCode} onChange={(value) => onChange('employeeCode', value)} disabled={disableAll || lockManagedFields} required />
          <Field label="First Name" value={form.firstName} onChange={(value) => onChange('firstName', value)} disabled={disableAll || lockManagedFields} required />
          <Field label="Last Name" value={form.lastName} onChange={(value) => onChange('lastName', value)} disabled={disableAll || lockManagedFields} required />
          <Field label="Email" type="email" value={form.email} onChange={(value) => onChange('email', value)} disabled={disableAll || lockManagedFields} required />
          <Field label="Phone Number" value={form.phoneNumber} onChange={(value) => onChange('phoneNumber', value)} disabled={disableAll} />
          <Field label="Department" value={form.department} onChange={(value) => onChange('department', value)} disabled={disableAll || lockManagedFields} />
          <Field label="Designation" value={form.designation} onChange={(value) => onChange('designation', value)} disabled={disableAll || lockManagedFields} />
          <Field label="Joining Date" type="date" value={form.joiningDate} onChange={(value) => onChange('joiningDate', value)} disabled={disableAll || lockManagedFields} />
          <Field label="Location" value={form.location} onChange={(value) => onChange('location', value)} disabled={disableAll} />
          <Field label="Experience Years" type="number" step="0.1" value={form.experienceYears} onChange={(value) => onChange('experienceYears', value)} disabled={disableAll} />

          {isEmployee ? (
            <>
              <Field label="Manager ID" type="number" value={form.managerId} onChange={(value) => onChange('managerId', value)} disabled={disableAll || lockManagedFields} />
              <Field label="Bench Start Date" type="date" value={form.benchStartDate} onChange={(value) => onChange('benchStartDate', value)} disabled={disableAll || lockManagedFields} />
              {showEmployeeStatus ? (
                <label className="employee-field">
                  <span>Status</span>
                  <select value={form.status} onChange={(event) => onChange('status', event.target.value)} disabled={disableAll || lockManagedFields}>
                    {EMPLOYEE_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </label>
              ) : null}
              <Field label="Skills" value={form.skillsText} onChange={(value) => onChange('skillsText', value)} placeholder="Java, React, PostgreSQL" disabled={disableAll} />
              <Field label="Certifications" value={form.certificationsText} onChange={(value) => onChange('certificationsText', value)} placeholder="AWS, Scrum Master" disabled={disableAll} />
              <Field label="Project History" value={form.projectHistoryText} onChange={(value) => onChange('projectHistoryText', value)} placeholder="Billing App, CRM Migration" disabled={disableAll || lockManagedFields} />
            </>
          ) : null}
          {canManageAllFields ? (
            <Field label={requirePassword ? 'Temporary Password' : 'Reset Password'} type="password" value={form.password} onChange={(value) => onChange('password', value)} minLength={6} required={requirePassword} placeholder={requirePassword ? '' : 'Leave blank to keep existing'} />
          ) : null}

          {canManageAllFields ? (
            <label className="employee-field employee-toggle">
              <span>Active Account</span>
              <input type="checkbox" checked={form.active} onChange={(event) => onChange('active', event.target.checked)} />
            </label>
          ) : null}

          <div className="employee-form-actions employee-form-actions-wide">
            <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
            {!readOnly ? (
              <button className="btn-primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : submitLabel}</button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

function ProjectModal({ form, isSaving, isEditing, onChange, onSubmit, onClose }) {
  return (
    <div className="employee-modal-backdrop">
      <div className="employee-modal employee-modal-wide" role="dialog" aria-modal="true" aria-labelledby="project-form-title">
        <div className="employee-modal-header">
          <div>
            <div className="employee-modal-kicker">Demand Management</div>
            <h2 id="project-form-title">{isEditing ? 'Edit Project Demand' : 'Create Project Demand'}</h2>
          </div>
          <button className="employee-close" type="button" onClick={onClose} aria-label="Close project form">X</button>
        </div>

        <form className="employee-form employee-form-grid" onSubmit={onSubmit}>
          <Field label="Project Name" value={form.projectName} onChange={(value) => onChange('projectName', value)} required />
          <Field label="Required Experience" type="number" step="0.1" value={form.requiredExperience} onChange={(value) => onChange('requiredExperience', value)} />
          <label className="employee-field employee-field-wide">
            <span>Description</span>
            <textarea value={form.description} onChange={(event) => onChange('description', event.target.value)} />
          </label>
          <Field label="Required Skills" value={form.requiredSkillsText} onChange={(value) => onChange('requiredSkillsText', value)} placeholder="Java, Spring Boot, React" />
          <Field label="Number of Resources Required" type="number" min="1" value={form.numberOfResourcesRequired} onChange={(value) => onChange('numberOfResourcesRequired', value)} required />
          <Field label="Department" value={form.department} onChange={(value) => onChange('department', value)} />
          <Field label="Location" value={form.location} onChange={(value) => onChange('location', value)} />
          <label className="employee-field">
            <span>Status</span>
            <select value={form.status} onChange={(event) => onChange('status', event.target.value)}>
              {PROJECT_STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
            </select>
          </label>

          <div className="employee-form-actions employee-form-actions-wide">
            <button className="btn-ghost" type="button" onClick={onClose}>Cancel</button>
            <button className="btn-primary" type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Demand'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, disabled, ...props }) {
  return (
    <label className="employee-field">
      <span>{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} disabled={disabled} {...props} />
    </label>
  );
}


