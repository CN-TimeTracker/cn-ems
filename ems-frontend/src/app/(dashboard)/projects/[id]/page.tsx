'use client';

import { useProject } from '@/hooks';
import { useTasks } from '@/hooks';
import { useParams, useRouter } from 'next/navigation';
import { ProjectStatus } from '@/types';
import { ArrowLeft, Calendar, Building2, User } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import TaskCard from '@/components/tasks/TaskCard';
import { formatAppDate } from '@/lib/dateUtils';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: tasks, isLoading: tasksLoading } = useTasks({ projectId: id });

  if (projectLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!project) return <div className="text-center py-20 text-gray-400">Project not found.</div>;

  const isOverdue = new Date(project.deadline) < new Date() && project.status === ProjectStatus.Active;

  return (
    <div>
      {/* Back */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to projects
      </button>

      {/* Project header card */}
      <div className="card mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="page-title">{project.name}</h1>
              <Badge variant={project.status === ProjectStatus.Active ? 'success' : 'default'}>
                {project.status}
              </Badge>
              {isOverdue && <Badge variant="danger">Overdue</Badge>}
            </div>
            {project.description && (
              <p className="text-gray-500 text-sm mt-2 max-w-2xl">{project.description}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Client</p>
              <p className="font-medium text-gray-800">{project.clientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Start date</p>
              <p className="font-medium text-gray-800">{formatAppDate(project.startDate)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-400">Deadline</p>
              <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-gray-800'}`}>
                {formatAppDate(project.deadline)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <h2 className="section-title mb-4">Tasks ({tasks?.length ?? 0})</h2>
      {tasksLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !tasks?.length ? (
        <div className="text-center py-10 text-sm text-gray-400">No tasks for this project yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} isAdmin={false} onEdit={() => {}} onDelete={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}