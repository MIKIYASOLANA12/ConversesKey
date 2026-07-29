'use client';

import { 
  Menu, 
  Search, 
  Bell, 
  Share2, 
  ChevronDown, 
  Sparkles,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';
import { ThemeToggle } from './ThemeToggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { AI_MODELS, DEFAULT_MODEL } from '@/config/ai';
import { useState } from 'react';

export function Navbar({ userEmail }: { userEmail?: string }) {
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b aura-glass px-4 lg:px-6">
      <Sheet>
        <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">Access the main sections of ConverseKey</SheetDescription>
          <Sidebar />
        </SheetContent>
      </Sheet>
      
      {/* Search Shortcut - Left on Desktop */}
      <div className="hidden md:flex flex-1 items-center">
        <Button 
          variant="outline" 
          className="h-9 w-64 justify-between border-border/50 bg-secondary/30 px-3 text-muted-foreground hover:bg-secondary/50"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="text-sm font-normal">Search conversations...</span>
          </div>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </div>

      {/* Model Selector - Center */}
      <div className="flex-1 flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="sm" className="gap-2 font-medium bg-secondary/30 border border-border/30 px-3 hover:bg-secondary/50 transition-all" />}>
            <Sparkles className="h-4 w-4 text-primary" />
            <span>{AI_MODELS[selectedModel].name}</span>
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" className="w-56 aura-glass">
            <DropdownMenuLabel>AI Model</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(AI_MODELS).map((model) => (
              <DropdownMenuItem 
                key={model.id} 
                onClick={() => setSelectedModel(model.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {model.id === 'gpt-4o' ? <Sparkles className="h-4 w-4 text-primary" /> : <Zap className="h-4 w-4 text-accent" />}
                  <span>{model.name}</span>
                </div>
                {selectedModel === model.id && <div className="h-2 w-2 rounded-full bg-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="flex flex-1 items-center justify-end gap-2 md:gap-4">
        <Button variant="ghost" size="icon" className="hidden sm:flex text-muted-foreground hover:text-foreground">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-primary" />
        </Button>
        
        <div className="h-6 w-px bg-border/50 mx-1 hidden sm:block" />

        <ThemeToggle />
        <Avatar className="h-8 w-8 ring-2 ring-primary/10 transition-all hover:ring-primary/30">
          <AvatarImage src="" alt={userEmail ?? 'User'} />
          <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
            {userEmail?.charAt(0).toUpperCase() ?? 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
