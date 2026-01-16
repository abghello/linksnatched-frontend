'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';
import { useRouter } from '@/routes/hooks';
import { paths } from '@/routes/paths';

export function SuccessClient({ status }: { status: string }) {
  const router = useRouter();

  return (
    <Card className='w-full max-w-md shadow-2xl border-0 backdrop-blur-sm m-auto'>
      <CardHeader className='space-y-1 text-center'>
        <div className='w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
          <Mail className='w-6 h-6 text-white' />
        </div>
        <CardTitle className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text'>
          Confirm your email
        </CardTitle>
        <CardDescription className=''>
          Please check your email for a confirmation link.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          type='button'
          className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium'
          onClick={() => {
            router.push(paths.auth.login);
          }}
        >
          Go to Login Page
        </Button>
      </CardContent>
      <CardFooter className='flex flex-col space-y-4'>
        {/* <p className='text-center text-sm text-gray-600'>
          {"Don't have an account? "}
          <Link
            href={paths.auth.signUp}
            className='text-blue-600 hover:text-blue-500 font-medium'
          >
            Sign up
          </Link>
        </p> */}
      </CardFooter>
    </Card>
  );
}
