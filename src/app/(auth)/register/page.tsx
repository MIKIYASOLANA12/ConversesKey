import { RegisterForm } from '@/components/auth/RegisterForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register - ConverseKey',
  description: 'Create a new ConverseKey account',
};

export default function RegisterPage() {
  return (
    <div className="flex w-full flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">ConverseKey</h1>
      </div>
      <RegisterForm />
    </div>
  );
}
