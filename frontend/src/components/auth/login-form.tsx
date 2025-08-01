'use client';

import type React from 'react';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail } from 'lucide-react';
import { paths } from '@/routes/paths';

import { signInWithMagicLink } from '@/auth/context';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, LoginFormValues } from '@/types/zod';
import { toast } from 'sonner';
import { Loader2Icon } from 'lucide-react';

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmPage, setIsConfirmPage] = useState(false);

  const defaultValues: Partial<LoginFormValues> = {
    email: '',
  };

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: LoginFormValues) => {
    const { email } = data;

    setIsLoading(true);
    try {
      const { error } = await signInWithMagicLink({
        email,
      });

      if (error) {
        toast.error('Failed to sign in, please try again');
      }
      setIsConfirmPage(true);
      toast.success('Confirmation link sent to your email');
    } catch (error: any) {
      // Extract error code if available
      const errorCode =
        error?.code || error?.status || error?.statusCode || 'UNKNOWN_ERROR';
      console.log('errorCode->', errorCode);
      // Handle specific error codes
      if (errorCode === 'over_email_send_rate_limit') {
        toast.error('Please try again in 1 minute');
      } else if (errorCode === 'otp_disabled') {
        toast.error('Invalid email address. Please check and try again');
      } else {
        toast.error('Failed to sign in, please try again');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmationLink = async () => {
    setIsLoading(true);

    try {
      const { error } = await signInWithMagicLink({
        email: form.getValues('email'),
      });
      if (error) {
        toast.error('Failed to resend confirmation link');
      }
      setIsConfirmPage(true);
      toast.success('Resent confirmation link to your email');
    } catch (error: any) {
      // Extract error code if available
      const errorCode =
        error?.code || error?.status || error?.statusCode || 'UNKNOWN_ERROR';

      // Handle specific error codes
      if (errorCode === 'over_email_send_rate_limit') {
        toast.error('Please try again in 1 minute');
      } else if (errorCode === 'INVALID_EMAIL') {
        toast.error('Invalid email address. Please check and try again');
      } else {
        toast.error('Failed to resend confirmation link');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isConfirmPage) {
    return (
      <Card className='w-full max-w-md shadow-2xl border-0 backdrop-blur-sm'>
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
            onClick={handleResendConfirmationLink}
            disabled={isLoading}
          >
            {isLoading && <Loader2Icon className='animate-spin' />}
            Resend confirmation link
          </Button>
        </CardContent>
        <CardFooter className='flex flex-col space-y-4'>
          <p className='text-center text-sm text-gray-600'>
            {"Don't have an account? "}
            <Link
              href={paths.auth.signUp}
              className='text-blue-600 hover:text-blue-500 font-medium'
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className='w-full max-w-md shadow-2xl border-0 backdrop-blur-sm'>
      <CardHeader className='space-y-1 text-center'>
        <div className='w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
          <Lock className='w-6 h-6 text-white' />
        </div>
        <CardTitle className='text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text'>
          Welcome back
        </CardTitle>
        <CardDescription className=''>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type='email'
                      autoCapitalize='none'
                      autoComplete='email'
                      autoCorrect='off'
                      placeholder='Enter your email'
                      className='h-11'
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <input
                  id='remember'
                  type='checkbox'
                  className='rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                />
                <Label htmlFor='remember' className='text-sm text-gray-600'>
                  Remember me
                </Label>
              </div>
              {/* <Link
                href='/auth/forgot-password'
                className='text-sm text-blue-600 hover:text-blue-500 font-medium'
              >
                Forgot password?
              </Link> */}
            </div>
            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium'
              disabled={isLoading}
            >
              {isLoading && <Loader2Icon className='animate-spin' />}
              Sign in
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-4'>
        {/* <div className='relative w-full'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-white px-2 text-gray-500'>
              Or continue with
            </span>
          </div>
        </div>
        <div className='gap-3 w-full'>
          <Button variant='outline' className='h-12 w-full bg-transparent'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 48 48'
              width='48px'
              height='48px'
            >
              <path
                fill='#FFC107'
                d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'
              />
              <path
                fill='#FF3D00'
                d='M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'
              />
              <path
                fill='#4CAF50'
                d='M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z'
              />
              <path
                fill='#1976D2'
                d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'
              />
            </svg>
            Google
          </Button>
        </div> */}
        <p className='text-center text-sm text-gray-600'>
          {"Don't have an account? "}
          <Link
            href={paths.auth.signUp}
            className='text-blue-600 hover:text-blue-500 font-medium'
          >
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
