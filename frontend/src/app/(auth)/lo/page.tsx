'use client';

import { useEffect } from 'react';
import { signOut } from '@/auth/context/action';
import { useRouter } from '@/routes/hooks';
import { useAuthContext } from '@/auth/hooks';
import { AuthGuard } from '@/auth/guard';

export default function LoginPage() {
  const router = useRouter();
  const { checkUserSession } = useAuthContext();

  useEffect(() => {
    const handleExtensionLogout = async () => {
      await signOut();

      await checkUserSession?.();

      router.refresh();
    };

    handleExtensionLogout();
  }, []);

  return <AuthGuard>Auth Logout</AuthGuard>;
}
