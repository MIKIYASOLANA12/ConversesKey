'use client';

import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { cn } from '@/lib/utils';

export function AppShell({ 
  children,
  userEmail,
  hideSidebar = false,
  hideNavbar = false
}: { 
  children: React.ReactNode;
  userEmail?: string;
  hideSidebar?: boolean;
  hideNavbar?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-background font-sans antialiased selection:bg-primary/20">
      {/* Fixed Desktop Sidebar */}
      {!hideSidebar && (
        <aside className="hidden md:flex h-screen sticky top-0 z-50">
          <Sidebar />
        </aside>
      )}

      <div className="flex flex-1 flex-col min-w-0">
        {!hideNavbar && <Navbar userEmail={userEmail} />}

        <main className="flex-1 relative overflow-y-auto">
          {/* Main content container with max-width for focus */}
          <div className={cn(
            "mx-auto h-full",
            !hideSidebar && "w-full max-w-7xl px-4 py-6 md:px-8",
            hideSidebar && "w-full h-full"
          )}>
            {children}
          </div>
        </main>
      </div>
...

      {/* Right Property Panel (Future) */}
      {/* <aside className="hidden xl:block w-80 border-l aura-glass h-screen sticky top-0">
        <div className="p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">Context</h3>
        </div>
      </aside> */}
    </div>
  );
}
