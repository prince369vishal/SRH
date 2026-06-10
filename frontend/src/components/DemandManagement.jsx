import { useState, useEffect, useCallback } from 'react';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getMatchingEmployees,
  assignEmployees,
} from '../api/projectApi';

const BADGE_COLORS = [
  '#E8F4FD,#1A6FA8',
  '#FEF3E2,#B45309',
  '#EDFAF4,#166534',
  '#FDF2F8,#9D174D',
  '#EEF2FF,#4338CA',
  '#FFF7ED,#C2410C',
];
function skillColor(skill) {
  let h = 0;
  for (let i = 0; i < skill.length; i++)
    h = (h * 31 + skill.charCodeAt(i)) >>> 0;
  const [bg, text] = BADGE_COLORS[h % BADGE_COLORS.length].split(',');
  return { bg, text };
}

const SkillBadge = ({ skill }) => {
  const { bg, text } = skillColor(skill.trim());
  return (
    <span
      style={{
        background: bg,
        color: text,
        padding: '2px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        display: 'inline-block',
        margin: '2px 3px',
      }}
    >
      {skill.trim()}
    </span>
  );
};

const StatusPill = ({ status }) => {
  const colors = {
    OPEN: { bg: '#DCFCE7', text: '#166534' },
    IN_PROGRESS: { bg: '#FEF9C3', text: '#854D0E' },
    CLOSED: { bg: '#F1F5F9', text: '#64748B' },
  };
  const { bg, text } = colors[status] || colors.OPEN;
  return (
    <span
      style={{
        background: bg,
        color: text,
        padding: '3px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.5,
      }}
    >
      {status}
    </span>
  );
};

const emptyReq = () => ({
  roleName: '',
  requiredSkills: '',
  minExperienceYears: 0,
  numberOfPeople: 1,
});

function ProjectForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [requirements, setRequirements] = useState(
    initial?.requirements?.length
      ? initial.requirements.map((r) => ({
          roleName: r.roleName,
          requiredSkills: r.requiredSkills,
          minExperienceYears: r.minExperienceYears,
          numberOfPeople: r.numberOfPeople,
        }))
      : [emptyReq()],
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateReq = (i, field, val) =>
    setRequirements((prev) =>
      prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)),
    );

  const handleSubmit = async () => {
    if (!name.trim()) return setError('Project name is required.');
    if (
      requirements.some((r) => !r.roleName.trim() || !r.requiredSkills.trim())
    )
      return setError(
        'Each requirement needs a role name and at least one skill.',
      );
    setSaving(true);
    setError('');
    try {
      await onSave({ name, description, requirements });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.formCard}>
      <h2 style={S.formTitle}>{initial ? 'Edit Project' : 'New Project'}</h2>
      {error && <div style={S.errorBanner}>{error}</div>}

      <label style={S.label}>Project Name *</label>
      <input
        style={S.input}
        placeholder="e.g. E-Commerce Platform Rebuild"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label style={S.label}>Description</label>
      <textarea
        style={{ ...S.input, height: 80, resize: 'vertical' }}
        placeholder="Brief overview..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <h3
          style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1E293B' }}
        >
          Requirements ({requirements.length})
        </h3>
        <button
          style={S.addReqBtn}
          onClick={() => setRequirements((p) => [...p, emptyReq()])}
        >
          + Add Requirement
        </button>
      </div>

      {requirements.map((req, i) => (
        <div key={i} style={S.reqBlock}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <span style={{ fontWeight: 600, color: '#475569', fontSize: 13 }}>
              Requirement #{i + 1}
            </span>
            {requirements.length > 1 && (
              <button
                style={S.removeBtn}
                onClick={() =>
                  setRequirements((p) => p.filter((_, idx) => idx !== i))
                }
              >
                Remove
              </button>
            )}
          </div>
          <div style={S.reqGrid}>
            <div>
              <label style={S.label}>Role / Position *</label>
              <input
                style={S.input}
                placeholder="e.g. Backend Developer"
                value={req.roleName}
                onChange={(e) => updateReq(i, 'roleName', e.target.value)}
              />
            </div>
            <div>
              <label style={S.label}>Required Skills * (comma-separated)</label>
              <input
                style={S.input}
                placeholder="e.g. Java, Spring Boot"
                value={req.requiredSkills}
                onChange={(e) => updateReq(i, 'requiredSkills', e.target.value)}
              />
            </div>
            <div>
              <label style={S.label}>Min. Experience (years)</label>
              <input
                style={S.input}
                type="number"
                min={0}
                value={req.minExperienceYears}
                onChange={(e) =>
                  updateReq(
                    i,
                    'minExperienceYears',
                    parseInt(e.target.value) || 0,
                  )
                }
              />
            </div>
            <div>
              <label style={S.label}>Number of People</label>
              <input
                style={S.input}
                type="number"
                min={1}
                value={req.numberOfPeople}
                onChange={(e) =>
                  updateReq(i, 'numberOfPeople', parseInt(e.target.value) || 1)
                }
              />
            </div>
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
        <button style={S.primaryBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving…' : initial ? 'Update Project' : 'Create Project'}
        </button>
        <button style={S.ghostBtn} onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function MatchPanel({ projectId, requirement, onAssigned }) {
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMatchingEmployees(projectId, requirement.id);
      setMatches(data);
      if (requirement.assignedEmployeeIds) {
        setSelected(
          new Set(requirement.assignedEmployeeIds.split(',').map(Number)),
        );
      }
    } catch {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, requirement.id, requirement.assignedEmployeeIds]);

  const toggle = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      await assignEmployees(projectId, requirement.id, [...selected]);
      setDone(true);
      onAssigned();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={S.matchPanel}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontWeight: 700, color: '#1E293B', fontSize: 14 }}>
            {requirement.roleName}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
            {requirement.numberOfPeople} needed ·{' '}
            {requirement.minExperienceYears}+ yrs
          </div>
        </div>
        {matches === null && !loading && (
          <button style={S.matchBtn} onClick={loadMatches}>
            Find Matches
          </button>
        )}
      </div>

      <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap' }}>
        {requirement.requiredSkills.split(',').map((s) => (
          <SkillBadge key={s} skill={s} />
        ))}
      </div>

      {loading && <div style={S.muted}>Searching…</div>}

      {matches !== null && !loading && (
        <>
          {matches.length === 0 ? (
            <div style={S.emptyMatch}>
              No employees match all required skills.
            </div>
          ) : (
            <>
              <div
                style={{
                  fontSize: 12,
                  color: '#64748B',
                  marginTop: 10,
                  marginBottom: 6,
                }}
              >
                {matches.length} matching employee
                {matches.length !== 1 ? 's' : ''} — select to assign
              </div>
              <div style={S.matchGrid}>
                {matches.map((emp) => {
                  const isSelected = selected.has(emp.id);
                  return (
                    <div
                      key={emp.id}
                      style={{
                        ...S.empCard,
                        ...(isSelected ? S.empCardSelected : {}),
                      }}
                      onClick={() => toggle(emp.id)}
                    >
                      <div style={S.avatar}>
                        {emp.name.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 13,
                            color: '#1E293B',
                          }}
                        >
                          {emp.name}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748B' }}>
                          {emp.experienceYears} yrs experience
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {emp.skills
                            ?.split(',')
                            .slice(0, 3)
                            .map((s) => (
                              <SkillBadge key={s} skill={s} />
                            ))}
                        </div>
                      </div>
                      {isSelected && <span style={S.checkmark}>✓</span>}
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button
                  style={S.primaryBtn}
                  onClick={save}
                  disabled={saving || selected.size === 0}
                >
                  {saving
                    ? 'Saving…'
                    : `Assign ${selected.size} employee${selected.size !== 1 ? 's' : ''}`}
                </button>
                {done && (
                  <span
                    style={{
                      alignSelf: 'center',
                      color: '#166534',
                      fontSize: 13,
                      fontWeight: 600,
                    }}
                  >
                    ✓ Saved
                  </span>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ProjectDetail({ project, onBack, onEdit, onDeleted, onRefresh }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteProject(project.id);
      onDeleted();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
          flexWrap: 'wrap',
        }}
      >
        <button style={S.backBtn} onClick={onBack}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              flexWrap: 'wrap',
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: '#0F172A',
              }}
            >
              {project.name}
            </h2>
            <StatusPill status={project.status} />
          </div>
          {project.description && (
            <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
              {project.description}
            </p>
          )}
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            Created by {project.createdBy} ·{' '}
            {new Date(project.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </div>
        </div>
        <button style={S.editBtn} onClick={onEdit}>
          Edit
        </button>
        {!confirmDelete ? (
          <button style={S.dangerBtn} onClick={() => setConfirmDelete(true)}>
            Delete
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#DC2626' }}>Sure?</span>
            <button
              style={S.dangerBtn}
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? '…' : 'Yes, delete'}
            </button>
            <button style={S.ghostBtn} onClick={() => setConfirmDelete(false)}>
              No
            </button>
          </div>
        )}
      </div>

      <h3
        style={{
          margin: '0 0 14px',
          fontSize: 16,
          fontWeight: 700,
          color: '#1E293B',
        }}
      >
        Requirements & Employee Matching
      </h3>

      {project.requirements.length === 0 ? (
        <div style={S.emptyState}>No requirements added to this project.</div>
      ) : (
        project.requirements.map((req) => (
          <MatchPanel
            key={req.id}
            projectId={project.id}
            requirement={req}
            onAssigned={onRefresh}
          />
        ))
      )}
    </div>
  );
}

function ProjectList({ projects, onSelect, onCreate }) {
  return (
    <div>
      <div style={S.listHeader}>
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 22,
              fontWeight: 800,
              color: '#0F172A',
            }}
          >
            Demand Management
          </h2>
          <p style={{ margin: '4px 0 0', color: '#64748B', fontSize: 14 }}>
            Create projects, define hiring requirements, match employees.
          </p>
        </div>
        <button style={S.primaryBtn} onClick={onCreate}>
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div style={S.emptyState}>
          No projects yet. Create your first project to start hiring.
        </div>
      ) : (
        <div style={S.cardGrid}>
          {projects.map((p) => (
            <div key={p.id} style={S.projectCard} onClick={() => onSelect(p)}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: '#1E293B',
                    lineHeight: 1.3,
                  }}
                >
                  {p.name}
                </span>
                <StatusPill status={p.status} />
              </div>
              {p.description && (
                <p
                  style={{
                    margin: '0 0 10px',
                    color: '#64748B',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}
                >
                  {p.description}
                </p>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 'auto',
                }}
              >
                <div style={{ display: 'flex', gap: 14 }}>
                  <div style={S.stat}>
                    <span style={S.statNum}>{p.requirements.length}</span>
                    <span style={S.statLabel}>Roles</span>
                  </div>
                  <div style={S.stat}>
                    <span style={S.statNum}>
                      {p.requirements.reduce(
                        (sum, r) => sum + r.numberOfPeople,
                        0,
                      )}
                    </span>
                    <span style={S.statLabel}>People needed</span>
                  </div>
                </div>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>
                  {new Date(p.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DemandManagement({ currentUser, onBack, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllProjects();
      setProjects(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refreshSelected = async () => {
    const fresh = await getAllProjects();
    setProjects(fresh);
    if (selected) setSelected(fresh.find((p) => p.id === selected.id) || null);
  };

  const handleCreate = async (data) => {
    await createProject(data);
    await load();
    setView('list');
  };
  const handleUpdate = async (data) => {
    await updateProject(selected.id, data);
    await load();
    setView('list');
  };
  const handleDeleted = async () => {
    await load();
    setSelected(null);
    setView('list');
  };

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#F8FAFC',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            border: '3px solid #E2E8F0',
            borderTopColor: '#3B82F6',
          }}
        />
        <span style={{ color: '#94A3B8', fontSize: 14, marginTop: 12 }}>
          Loading projects…
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F8FAFC',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Top nav bar */}
      <div
        style={{
          background: '#0F172A',
          padding: '0 32px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            ← Home
          </button>
          <span style={{ color: '#334155', fontSize: 14 }}>|</span>
          <span style={{ color: '#E2E8F0', fontSize: 14, fontWeight: 600 }}>
            Demand Management
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: '#64748B', fontSize: 13 }}>
            {currentUser?.email}
          </span>
          <button
            onClick={onLogout}
            style={{
              background: 'none',
              border: '1px solid #334155',
              color: '#94A3B8',
              borderRadius: 8,
              padding: '6px 14px',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 16px' }}>
        {view === 'list' && (
          <ProjectList
            projects={projects}
            onSelect={(p) => {
              setSelected(p);
              setView('detail');
            }}
            onCreate={() => setView('create')}
          />
        )}
        {view === 'create' && (
          <ProjectForm onSave={handleCreate} onCancel={() => setView('list')} />
        )}
        {view === 'edit' && selected && (
          <ProjectForm
            initial={selected}
            onSave={handleUpdate}
            onCancel={() => setView('detail')}
          />
        )}
        {view === 'detail' && selected && (
          <ProjectDetail
            project={selected}
            onBack={() => {
              setSelected(null);
              setView('list');
            }}
            onEdit={() => setView('edit')}
            onDeleted={handleDeleted}
            onRefresh={refreshSelected}
          />
        )}
      </div>
    </div>
  );
}

const S = {
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 28,
    flexWrap: 'wrap',
    gap: 12,
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
    gap: 16,
  },
  projectCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: '20px 20px 16px',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 140,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  stat: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: 20, fontWeight: 800, color: '#3B82F6', lineHeight: 1 },
  statLabel: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  emptyState: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 15,
    padding: '48px 24px',
    background: '#FFFFFF',
    borderRadius: 14,
    border: '1px dashed #E2E8F0',
  },
  formCard: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 14,
    padding: 28,
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
  },
  formTitle: {
    margin: '0 0 20px',
    fontSize: 20,
    fontWeight: 800,
    color: '#0F172A',
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: '#475569',
    marginBottom: 4,
    marginTop: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  input: {
    width: '100%',
    padding: '9px 12px',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    fontSize: 14,
    color: '#1E293B',
    background: '#F8FAFC',
    outline: 'none',
    boxSizing: 'border-box',
  },
  reqBlock: {
    background: '#F8FAFC',
    border: '1.5px solid #E2E8F0',
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 10,
  },
  reqGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' },
  addReqBtn: {
    background: '#EFF6FF',
    color: '#2563EB',
    border: '1.5px solid #BFDBFE',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
  },
  errorBanner: {
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    color: '#DC2626',
    borderRadius: 8,
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 12,
  },
  primaryBtn: {
    background: '#2563EB',
    color: '#FFF',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  ghostBtn: {
    background: 'none',
    color: '#64748B',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    padding: '9px 18px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  editBtn: {
    background: '#F1F5F9',
    color: '#334155',
    border: '1.5px solid #E2E8F0',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  dangerBtn: {
    background: '#FEF2F2',
    color: '#DC2626',
    border: '1.5px solid #FECACA',
    borderRadius: 8,
    padding: '7px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    padding: '6px 0',
    whiteSpace: 'nowrap',
  },
  matchPanel: {
    background: '#FFFFFF',
    border: '1.5px solid #E2E8F0',
    borderRadius: 12,
    padding: '16px 18px',
    marginBottom: 12,
  },
  matchBtn: {
    background: '#EFF6FF',
    color: '#2563EB',
    border: '1.5px solid #BFDBFE',
    borderRadius: 8,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  matchGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 10,
    marginTop: 4,
  },
  empCard: {
    border: '2px solid #E2E8F0',
    borderRadius: 10,
    padding: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    background: '#FAFAFA',
    position: 'relative',
  },
  empCardSelected: { borderColor: '#3B82F6', background: '#EFF6FF' },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: '50%',
    background: '#DBEAFE',
    color: '#1D4ED8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 15,
    flexShrink: 0,
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 10,
    color: '#2563EB',
    fontWeight: 800,
    fontSize: 14,
  },
  emptyMatch: { color: '#94A3B8', fontSize: 13, padding: '10px 0 4px' },
  muted: { color: '#94A3B8', fontSize: 13, marginTop: 8 },
};
