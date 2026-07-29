import { LoginForm } from '@/components/auth/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - ConverseKey',
  description: 'Login to your ConverseKey account',
};

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">ConverseKey</h1>
      </div>
      <LoginForm />
    </div>
  );
}
