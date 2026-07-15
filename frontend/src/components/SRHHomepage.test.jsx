import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import SRHHomepage from './SRHHomepage.jsx';

const admin = { token: 'admin-token', role: 'ADMIN', email: 'admin@example.com' };
const employee = { token: 'employee-token', role: 'EMPLOYEE', email: 'employee@example.com' };

describe('SRHHomepage', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows admin actions only to admins', () => {
    const { rerender } = render(<SRHHomepage currentUser={employee} onLogout={vi.fn()} />);

    expect(screen.queryByRole('button', { name: '+ Add Employee' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Get started →' })).toBeInTheDocument();

    rerender(<SRHHomepage currentUser={admin} onLogout={vi.fn()} />);
    expect(screen.getAllByRole('button', { name: '+ Add Employee' })).toHaveLength(2);
  });

  it('calls the logout handler', async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(<SRHHomepage currentUser={employee} onLogout={onLogout} />);

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('opens and closes the employee form', async () => {
    const user = userEvent.setup();
    render(<SRHHomepage currentUser={admin} onLogout={vi.fn()} />);

    await user.click(screen.getAllByRole('button', { name: '+ Add Employee' })[0]);
    expect(screen.getByRole('dialog', { name: 'Add Employee' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close add employee form' }));
    expect(screen.queryByRole('dialog', { name: 'Add Employee' })).not.toBeInTheDocument();
  });

  it('submits a new employee with the admin bearer token', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'New Person' }),
    });
    render(<SRHHomepage currentUser={admin} onLogout={vi.fn()} />);

    await user.click(screen.getAllByRole('button', { name: '+ Add Employee' })[0]);
    await user.type(screen.getByLabelText('Name'), 'New Person');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.selectOptions(screen.getByLabelText('Role'), 'PROJECT_ADMIN');
    await user.click(screen.getByRole('button', { name: 'Save Employee' }));

    expect(await screen.findByText('New Person was added successfully.')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/employees', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer admin-token',
      },
      body: JSON.stringify({
        name: 'New Person',
        email: 'new@example.com',
        password: 'secret',
        role: 'PROJECT_ADMIN',
      }),
    });
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('shows an employee creation error and re-enables saving', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({ ok: false });
    render(<SRHHomepage currentUser={admin} onLogout={vi.fn()} />);

    await user.click(screen.getAllByRole('button', { name: '+ Add Employee' })[0]);
    await user.type(screen.getByLabelText('Name'), 'New Person');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Save Employee' }));

    expect(
      await screen.findByText('Could not add employee. Check your admin login and form values.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save Employee' })).toBeEnabled();
  });
});
