'use client';

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
import { paths } from '@/routes/paths';
import { Loader2Icon, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { RegisterFormSchema, RegisterFormValues } from '@/types/zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

export function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const defaultValues: Partial<RegisterFormValues> = {
    email: '',
  };
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: RegisterFormValues) => {
    const { email } = data;
    setIsLoading(true);
    const response = await fetch('/api/stripe/create-customer', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    const { customer } = await response.json();
    localStorage.setItem('checkoutCompletionExperiment', 'test');
    const signupSecret = 'hUs81xocLJ0eAacLuzwBiAZRQ4lukRKN';
    const params = new URLSearchParams();
    params.set('email', email);
    params.set('billing', 'month');
    params.set('customerId', customer.id);
    params.set('signupSecret', signupSecret);
    router.replace(`${paths.checkout}?${params.toString()}`);
    setIsLoading(false);
  };

  return (
    <Card className='w-full max-w-md shadow-2xl border-0'>
      <CardHeader className='space-y-1 text-center'>
        <div className='w-12 h-12 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
          <User className='w-6 h-6 text-white' />
        </div>
        <CardTitle className='text-2xl font-bold'>Create account</CardTitle>
        <CardDescription className=''>
          Sign up to get started with your account
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

            <Button
              type='submit'
              className='w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium'
              disabled={isLoading}
            >
              {isLoading && <Loader2Icon className='animate-spin' />}
              Sign up with email
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className='flex flex-col space-y-4'>
        {/* <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>
        <div className="gap-3 w-full">
          <Button variant="outline" className="h-12 w-full bg-transparent">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 48 48"
              width="48px"
              height="48px"
            >
              <path
                fill="#FFC107"
                d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
              />
              <path
                fill="#FF3D00"
                d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
              />
              <path
                fill="#4CAF50"
                d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
              />
              <path
                fill="#1976D2"
                d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
              />
            </svg>
            Google
          </Button>
        </div> */}
        <p className='text-center text-sm'>
          Already have an account?{' '}
          <Link
            href={paths.auth.login}
            className='text-blue-600 hover:text-blue-500 font-medium'
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
