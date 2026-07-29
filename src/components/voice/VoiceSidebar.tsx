import { PERSONALITIES, PersonalityId } from '@/config/personalities';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';
import { ChevronRight, History, FolderKanban, Users } from 'lucide-react';

export function VoiceSidebar({ currentPersonalityId }: { currentPersonalityId: string }) {
  const router = useRouter();

  return (
    <div className="w-64 h-full hidden lg:flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-md">
      <div className="p-4 border-b border-border/40">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Personalities
        </h3>
      </div>
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {Object.values(PERSONALITIES).map((p) => (
            <Button
              key={p.id}
              variant={currentPersonalityId === p.id ? 'secondary' : 'ghost'}
              className="w-full justify-start text-sm"
              onClick={() => router.push(`/call/${p.id}`)}
            >
              <span className="mr-2">{p.avatar}</span>
              {p.name}
              {currentPersonalityId === p.id && <ChevronRight className="ml-auto w-4 h-4" />}
            </Button>
          ))}
        </div>

        <div className="mt-6 mb-2 px-2">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
            <History className="w-4 h-4" />
            Recent History
          </h3>
        </div>
        <div className="space-y-1 px-2 text-xs text-muted-foreground">
          <p className="p-2 bg-muted/30 rounded-md">Interview Prep - 2 days ago</p>
          <p className="p-2 bg-muted/30 rounded-md">Pep Talk - 5 days ago</p>
        </div>

        <div className="mt-6 mb-2 px-2">
          <h3 className="font-semibold text-sm flex items-center gap-2 text-muted-foreground">
            <FolderKanban className="w-4 h-4" />
            Projects
          </h3>
        </div>
        <div className="space-y-1 px-2 text-xs text-muted-foreground">
          <p className="p-2 border border-dashed border-border rounded-md text-center">No projects yet</p>
        </div>
      </ScrollArea>
    </div>
  );
}
