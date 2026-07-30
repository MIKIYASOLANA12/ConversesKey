import Link from "next/link";
import { Mic, Globe, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer id="footer" className="border-t border-border/60">
      <div className="container mx-auto px-4 py-12 md:px-6">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary via-[var(--accent-2)] to-accent">
                <Mic className="h-3.5 w-3.5 text-primary-foreground" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base font-semibold text-foreground">
                ConverseKey
              </span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Natural, human, voice-first conversations with AI.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Product
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><a href="#features" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#how-it-works" className="text-muted-foreground hover:text-foreground">How it Works</a></li>
                <li><a href="#demo" className="text-muted-foreground hover:text-foreground">Demo</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Company
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li><a href="#faq" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Privacy</Link></li>
                <li><Link href="#" className="text-muted-foreground hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Connect
              </h4>
              <ul className="flex flex-col gap-2 text-sm">
                <li>
                  <a href="#" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Globe className="h-3.5 w-3.5" /> GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                    <Mail className="h-3.5 w-3.5" /> Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-6 text-xs text-muted-foreground md:flex-row">
          <p>&copy; 2026 MIKIYAS OLANA. All Rights Reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground">Privacy</Link>
            <Link href="#" className="hover:text-foreground">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
