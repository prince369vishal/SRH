import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

describe('App authentication flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows the login form with the seeded admin credentials', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'Sign in to SRH Portal' })).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('admin@example.com');
    expect(screen.getByLabelText('Password')).toHaveValue('admin123');
  });

  it('stores successful login data and opens the dashboard', async () => {
    const user = userEvent.setup();
    const auth = { token: 'jwt-token', role: 'ADMIN', email: 'admin@example.com' };
    fetch.mockResolvedValue({ ok: true, json: async () => auth });

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('admin@example.com')).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'admin123' }),
    });
    expect(JSON.parse(localStorage.getItem('srhAuth'))).toEqual(auth);
  });

  it('shows a useful error when login is rejected', async () => {
    const user = userEvent.setup();
    fetch.mockResolvedValue({ ok: false });

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Login failed. Check your email and password.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeEnabled();
  });

  it('restores a stored session and clears it on logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'srhAuth',
      JSON.stringify({ token: 'saved-token', role: 'EMPLOYEE', email: 'person@example.com' }),
    );

    render(<App />);
    expect(screen.getByText('person@example.com')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    await waitFor(() => expect(localStorage.getItem('srhAuth')).toBeNull());
    expect(screen.getByRole('heading', { name: 'Sign in to SRH Portal' })).toBeInTheDocument();
  });
});
