import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/config/routes';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/20">
      <header className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-xl font-bold tracking-tight">ConverseKey</span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href={ROUTES.login}>
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href={ROUTES.register}>
            <Button>Get Started</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center space-y-10 px-4 py-32 text-center md:px-6 lg:py-48">
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Your Professional <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                AI Workspace
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-lg text-muted-foreground md:text-xl/relaxed">
              Stop losing context in endless chat threads. Organize your AI interactions
              into dedicated projects, search past conversations, and pick up exactly
              where you left off.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link href={ROUTES.register}>
              <Button size="lg" className="h-12 px-8 text-base shadow-lg transition-transform hover:scale-105">
                Start for free
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Explore features
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row md:px-6">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ConverseKey. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">Terms</Link>
            <Link href="#" className="hover:underline">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
