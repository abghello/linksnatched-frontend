import { GuestGuard } from '@/auth/guard';
import { RegisterForm } from '@/components/auth/register-form';

export default function RegisterPage() {
  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <GuestGuard>
        <RegisterForm />
      </GuestGuard>
    </div>
  );
}
