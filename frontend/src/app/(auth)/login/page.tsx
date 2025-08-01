import { LoginForm } from '@/components/auth/login-form';
import { GuestGuard } from '@/auth/guard';

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <GuestGuard>
        <LoginForm />
      </GuestGuard>
    </div>
  );
}
