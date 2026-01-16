'use client';

import { paths } from '@/routes/paths';
import { Spinner } from '@/components/custom/loading';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from '@/routes/hooks';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export function AuthGuard({ children }: Props) {
  const router = useRouter();

  const pathname = usePathname();

  const searchParams = useSearchParams();

  const { user, authenticated, loading } = useAuthContext();

  const [isChecking, setIsChecking] = useState<boolean>(true);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams!.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  const checkPermissions = async (): Promise<void> => {
    if (loading) {
      return;
    }

    if (!authenticated) {
      const signInPath = {
        supabase: paths.auth.login,
      };
      const href = `${signInPath.supabase}?${createQueryString(
        'returnTo',
        pathname ?? '/'
      )}`;

      router.replace(href);
      return;
    } else {
      const stripePaymentLink = localStorage.getItem('stripePaymentLink');
      if (stripePaymentLink && user?.email) {
        localStorage.removeItem('stripePaymentLink');
        router.push(stripePaymentLink + `?prefilled_email=${user?.email}`);
        return;
      }
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticated, loading]);

  if (isChecking) {
    return <Spinner />;
  }

  return <>{children}</>;
}
