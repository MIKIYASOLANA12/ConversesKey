'use client';

import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);
  const isCallPage = pathname?.startsWith('/call/');

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? undefined);
    });
  }, []);

  return (
    <AppShell 
      userEmail={userEmail} 
      hideSidebar={isCallPage} 
      hideNavbar={isCallPage}
    >
      {children}
    </AppShell>
  );
}
