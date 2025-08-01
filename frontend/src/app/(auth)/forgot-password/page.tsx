import { GuestGuard } from "@/auth/guard";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <GuestGuard>
        <ForgotPasswordForm />
      </GuestGuard>
    </div>
  );
}
