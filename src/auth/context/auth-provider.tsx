'use client';

import { createClient } from '@/utils/supabase/client';
import { useSetState } from '@/hooks/use-set-state';
import { useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { AuthContext } from './auth-context';

import type { AuthState } from '../types';
import { toast } from 'sonner';
import { paths } from '@/routes/paths';
import axios from '@/utils/axios';
// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });
  const router = useRouter();

  const checkUserSession = useCallback(async () => {
    const supabase = createClient();
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        setState({ user: null, loading: false });
        console.error(error);
        throw error;
      }

      if (session) {
        const accessToken = session?.access_token;

        // const { data: userData } = await supabase
        //   .from('users')
        //   .select('*')
        //   .eq('id', session?.user.id)
        //   .single();

        // if (userData.status) {
        setState({ user: { ...session, ...session?.user }, loading: false });
        axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        // } else {
        //   toast("Please contact administrator to get the access.");
        //   router.push(paths.auth.login);
        //   throw { message: "Please contact administrator to get the access." };
        // }
      } else {
        setState({ user: null, loading: false });
        delete axios.defaults.headers.common.Authorization;
      }
    } catch (error) {
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user?.id,
            accessToken: state.user?.access_token,
            displayName: `${state.user?.user_metadata.name}`,
            role: state.user?.role ?? 'admin',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return (
    <AuthContext.Provider value={memoizedValue}>
      {children}
    </AuthContext.Provider>
  );
}
