import { Personality } from '@/config/personalities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PersonalityCardProps {
  personality: Personality;
}

export function PersonalityCard({ personality }: PersonalityCardProps) {
  const Icon = personality.icon;

  return (
    <Card 
      className="group relative overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 aura-glass border-border/40"
      style={{ '--hover-color': personality.color } as any}
    >
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ backgroundColor: personality.color }}
      />
      
      <CardHeader className="relative">
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110"
            style={{ backgroundColor: personality.color }}
          >
            <Icon className="h-6 w-6" />
          </div>
          <span className="text-4xl">{personality.avatar}</span>
        </div>
        <CardTitle className="text-xl font-bold">{personality.name}</CardTitle>
        <CardDescription className="text-primary/70 font-medium">
          {personality.role}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {personality.description}
        </p>
        
        <Button 
          className="w-full gap-2 shadow-lg aura-shadow-md transition-all group-hover:scale-[1.02]"
          style={{ backgroundColor: personality.color }}
        >
          <Mic className="h-4 w-4" />
          <span>Call {personality.name}</span>
        </Button>
      </CardContent>
    </Card>
  );
}
