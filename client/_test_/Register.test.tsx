import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Register from '@/pages/auth/Register';

const mocks = vi.hoisted(() => ({
  register: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ register: mocks.register }),
}));

vi.mock('@/components/common/toast/useToast', () => ({
  useToast: () => ({
    success: mocks.toastSuccess,
    error: mocks.toastError,
  }),
}));

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.register.mockResolvedValue(undefined);
  });

  it('submits the selected user role with the registration details', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

    expect((screen.getByLabelText('Account role') as HTMLSelectElement).value).toBe('user');
    expect(screen.getByRole('option', { name: 'User' })).toBeTruthy();
    expect(screen.queryByRole('option', { name: 'Admin' })).toBeNull();

    fireEvent.change(screen.getByLabelText('Full name'), {
      target: { value: 'Alex Example' },
    });
    fireEvent.change(screen.getByLabelText('Email address'), {
      target: { value: 'alex@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.change(screen.getByLabelText('Confirm password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create Account' }));

    await waitFor(() => {
      expect(mocks.register).toHaveBeenCalledWith({
        name: 'Alex Example',
        email: 'alex@example.com',
        role: 'user',
        password: 'password123',
      });
    });
  });
});
