'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FolderClosed, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut,
  Plus,
  Search,
  Star,
  LayoutTemplate,
  ChevronDown,
  Key
} from 'lucide-react';
import { ROUTES } from '@/config/routes';
import { logoutAction } from '@/server/actions/auth.actions';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export function Sidebar() {
  const pathname = usePathname();

  const mainNavigation = [
    { name: 'Dashboard', href: ROUTES.dashboard, icon: MessageSquare },
    { name: 'Projects', href: ROUTES.projects, icon: FolderClosed },
  ];

  const secondaryNavigation = [
    { name: 'Search', href: ROUTES.search, icon: Search, shortcut: '⌘K' },
    { name: 'Favorites', href: ROUTES.favorites, icon: Star },
    { name: 'Templates', href: ROUTES.templates, icon: LayoutTemplate },
  ];

  const footerNavigation = [
    { name: 'Settings', href: ROUTES.settings, icon: Settings },
    { name: 'Profile', href: ROUTES.profile, icon: User },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r aura-glass shadow-lg">
      {/* Logo & Workspace Switcher */}
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between px-2">
          <Link href={ROUTES.dashboard} className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg transition-transform group-hover:scale-110">
              <Key className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight">ConverseKey</span>
          </Link>
        </div>

        <Button variant="outline" className="w-full justify-between gap-2 border-border/50 bg-secondary/30 px-3 hover:bg-secondary/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-5 w-5 rounded bg-accent shrink-0" />
            <span className="truncate text-xs font-medium">Personal Workspace</span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </Button>

        <Button className="w-full justify-start gap-2 shadow-lg aura-shadow-md" size="sm">
          <Plus className="h-4 w-4" />
          <span>New Conversation</span>
        </Button>
      </div>

      <Separator className="bg-border/50" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all",
                  isActive
                    ? "bg-secondary text-secondary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span>{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div>
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
            Library
          </h3>
          <nav className="space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/40 hover:text-foreground"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                  <span>{item.name}</span>
                </div>
                {item.shortcut && (
                  <span className="text-[10px] font-mono text-muted-foreground/50">{item.shortcut}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div>
          <h3 className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2">
            Recent Projects
          </h3>
          <div className="px-3 py-1 text-xs text-muted-foreground/60 italic">
            No projects yet
          </div>
        </div>
      </div>

      <Separator className="bg-border/50" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        {footerNavigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-secondary/40 hover:text-foreground"
          >
            <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            <span>{item.name}</span>
          </Link>
        ))}
        <form action={logoutAction as unknown as string} className="pt-2">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 px-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            size="sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
