'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';

import { LogOut } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { buttonVariants } from './ui/button';
import Link from 'next/link';
import { useAuthContext } from '@/auth/hooks/use-auth-context';
import { signOut } from '@/auth/context';
import { useLoadingCallback } from 'react-loading-hook';
import { useRouter } from 'next/navigation';
import { getUser } from '@/actions/users';
import { IUser } from '@/types';
import { useEffect, useState } from 'react';

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: '/',
    label: 'Home',
  },
  {
    href: '#team',
    label: 'Team',
  },
  {
    href: '#testimonials',
    label: 'Testimonials',
  },
];

export const Navbar = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { authenticated, checkUserSession, user } = useAuthContext();
  const router = useRouter();
  const [handleLogout, isLogoutLoading] = useLoadingCallback(async () => {
    await signOut();
    await checkUserSession?.();
    router.refresh();
  });

  const [userData, setUserData] = useState<IUser | null>(null);
  useEffect(() => {
    if (user) {
      const fetchUser = async () => {
        const { data } = await getUser(user?.id);
        setUserData(data);
      };

      fetchUser();
    }
  }, [user?.id]);

  useEffect(() => {
    if (userData?.plan === 'premium') {
      setIsSubscribed(true);
    }
    if (userData?.role === 'admin') {
      setIsAdmin(true);
    }
  }, [userData]);

  return (
    <header
      className='sticky border-b-[1px] top-0 z-40 w-full  dark:border-b-slate-700 overflow-x-hidden
			bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60
		'
    >
      <NavigationMenu className='mx-auto'>
        <NavigationMenuList className='container min-h-14 w-screen flex justify-between '>
          <NavigationMenuItem className='font-bold md:flex hidden'>
            <a
              rel='noreferrer noopener'
              href='/'
              className='ml-2 font-bold text-xl flex'
            >
              <span className='uppercase bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-transparent bg-clip-text'>
                🚀 Linksnatched
              </span>
            </a>
          </NavigationMenuItem>

          <nav className='md:flex gap-2'>
            {routeList.map((route: RouteProps, i) => (
              <Link
                rel='noreferrer noopener'
                href={route.href}
                key={i}
                className={`text-[17px] ${buttonVariants({
                  variant: 'ghost',
                })}`}
              >
                {route.label}
              </Link>
            ))}
            {authenticated && isSubscribed && (
              <Link
                rel='noreferrer noopener'
                href={process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL_URL!}
                target='_blank'
                className={`text-[17px] ${buttonVariants({
                  variant: 'ghost',
                })}`}
              >
                Billing Portal
              </Link>
            )}
            {authenticated && isAdmin && (
              <Link
                rel='noreferrer noopener'
                href='/users'
                className={`text-[17px] ${buttonVariants({
                  variant: 'ghost',
                })}`}
              >
                Users
              </Link>
            )}
          </nav>

          <div className='hidden md:flex gap-2'>
            {authenticated && (
              <Link
                rel='noreferrer noopener'
                href='#'
                onClick={handleLogout}
                className={`border ${buttonVariants({ variant: 'secondary' })}`}
              >
                Logout
                <LogOut className='w-4 h-4 ml-2' />
              </Link>
            )}

            {!authenticated && (
              <Link
                rel='noreferrer noopener'
                href='/auth/login'
                className={`border ${buttonVariants({ variant: 'secondary' })}`}
              >
                Login
              </Link>
            )}

            {/* {authenticated && isSubscribed && (
              <Link
                rel='noreferrer noopener'
                href='/premium'
                // shining animated button with purple gradient
                className={`border bg-gradient-to-r from-[#667EEA] to-[#764BA2] text-white ${buttonVariants(
                  {
                    variant: 'secondary',
                  }
                )}`}
              >
                Premium ✨
              </Link>
            )} */}

            <ModeToggle />
          </div>
        </NavigationMenuList>
      </NavigationMenu>
    </header>
  );
};
