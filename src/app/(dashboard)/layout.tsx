'use client';

import { redirect, usePathname } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { ROUTES } from '@/config/routes';
import { AppShell } from '@/components/layout/AppShell';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isCallPage = pathname?.startsWith('/call/');

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        redirect(ROUTES.login);
      }
      setUser(user);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;

  return (
    <AppShell 
      userEmail={user?.email} 
      hideSidebar={isCallPage} 
      hideNavbar={isCallPage}
    >
      {children}
    </AppShell>
  );
}
