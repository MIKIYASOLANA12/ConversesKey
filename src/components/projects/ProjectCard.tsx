import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Folder } from 'lucide-react';
import { ROUTES } from '@/config/routes';

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    createdAt: Date;
    color: string | null;
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={ROUTES.project(project.id)}>
      <Card className="hover:bg-muted/50 transition-colors h-full">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div 
              className="flex items-center justify-center h-8 w-8 rounded-md"
              style={{ backgroundColor: project.color ? `${project.color}20` : 'rgba(59, 130, 246, 0.2)' }}
            >
              <Folder 
                className="h-4 w-4" 
                style={{ color: project.color || '#3b82f6' }}
              />
            </div>
            <span className="truncate">{project.name}</span>
          </CardTitle>
          <CardDescription>
            Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground flex items-center justify-between">
            <span>0 conversations</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
