'use client';

import { AuthGuard } from '@/auth/guard';
import { Navbar } from '@/components/Navbar';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <AuthGuard>
      <Navbar />
      <section className='w-full flex flex-col overflow-hidden'>
        {children}
      </section>
    </AuthGuard>
  );
}
