import { createContext, useEffect, useMemo, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../lib/api/auth.api';
import type { AuthContextType, LoginRequest, User } from '@/types/auth';

const authQueryKey = ['auth', 'current-user'] as const;

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const queryClient = useQueryClient();

  const { data: user = null, isLoading } = useQuery<User | null>({
    queryKey: authQueryKey,
    queryFn: async () => {
      try {
        return await getCurrentUser();
      } catch (error) {
        // A 401 means there is no active authenticated session.
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return null;
        }

        throw error;
      }
    },
    retry: false,
    staleTime: 30_000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Create session and receive the authentication cookie.
      await loginUser(credentials);

      // Retrieve the authenticated user using the cookie.
      const currentUser = await getCurrentUser();

      if (!currentUser?.id) {
        throw new Error('Unable to retrieve authenticated user profile.');
      }

      return currentUser;
    },

    onSuccess: async (currentUser) => {
      await queryClient.cancelQueries({
        queryKey: authQueryKey,
      });

      queryClient.setQueryData(authQueryKey, currentUser);
    },
  });

  const registerMutation = useMutation({
    mutationFn: registerUser,
  });

  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: async () => {
      await queryClient.cancelQueries({ queryKey: authQueryKey });
      queryClient.setQueryData(authQueryKey, null);
    },
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      queryClient.setQueryData(authQueryKey, null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [queryClient]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),

      login: async (credentials: LoginRequest) => {
        await loginMutation.mutateAsync(credentials);
      },

      register: (payload) => registerMutation.mutateAsync(payload),

      logout: () => logoutMutation.mutateAsync(),
    }),
    [user, isLoading, loginMutation, registerMutation, logoutMutation],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
