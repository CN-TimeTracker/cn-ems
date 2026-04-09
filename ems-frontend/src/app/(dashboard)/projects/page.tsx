'use client';

import { useState } from 'react';
import { useAllProjects, useAssignedProjects, useDeleteProject, useProjectRemainingHours } from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole, ProjectStatus, Project } from '@/types';
import { Plus, Pencil, Trash2, Calendar, Building2, Clock, Hourglass, Users } from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ProjectModal from '@/components/projects/ProjectModal';
import { formatAppDate } from '@/lib/dateUtils';

function ProjectRemaining({ projectId }: { projectId: string }) {
  const { data: remaining, isLoading } = useProjectRemainingHours(projectId);

  if (isLoading || !remaining) return <div className="w-24 h-4 bg-gray-100 animate-pulse rounded" />;

  const percentage = remaining.allocated > 0 ? (remaining.spent / remaining.allocated) * 100 : 0;
  const isOver = remaining.remaining < 0;

  return (
    <div className="w-full min-w-[140px] max-w-[200px]">
      <div className="flex items-center justify-between text-[15px] mb-1">
        <span className="text-gray-500 font-medium">
          {remaining.spent.toFixed(1)}h / {remaining.allocated}h
        </span>
        <span className={`font-bold ${isOver ? 'text-red-500' : 'text-primary'}`}>
          {isOver ? 'Over budget' : `${remaining.remaining.toFixed(1)}h left`}
        </span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-primary'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;

  // Choose hook based on role
  const allProjectsQuery = useAllProjects();
  const assignedProjectsQuery = useAssignedProjects();

  const { data: projects, isLoading } = isAdmin ? allProjectsQuery : assignedProjectsQuery;
  const { mutate: deleteProject } = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const handleEdit = (project: Project) => {
    setEditing(project);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project? This cannot be undone.')) {
      deleteProject(id);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setEditing(null);
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{isAdmin ? 'All Projects' : 'My Projects'}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{projects?.length ?? 0} {isAdmin ? 'total' : 'assigned'} projects</p>
        </div>
        {isAdmin && (
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </button>
        )}
      </div>

      {/* Table */}
      {!projects?.length ? (
        <EmptyState title="No projects yet" description={isAdmin ? 'Create your first project to get started.' : 'You have not been assigned to any projects yet.'} />
      ) : (
        <div className="bg-white rounded-2xl border border-blue-600 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="text-blac text-[16px] bg-white text-gray-600 uppercase tracking-wider font-bold border-b border-gray-200">
                <th className="px-5 py-3 w-[25%]">Project & Client</th>
                <th className="px-5 py-3 w-[25%] hidden md:table-cell">Description</th>
                <th className="px-5 py-3 w-[20%]">Timeline</th>
                <th className="px-5 py-3 w-[20%]">Progress</th>
                <th className="px-5 py-3">Status</th>
                {isAdmin && <th className="px-5 py-3">Assigned To</th>}
                {isAdmin && <th className="px-5 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {projects.map((project) => (
                <tr key={project._id} className="hover:bg-gray-50/60 transition-colors group">
                  <td className="px-5 py-4 text-[15px]">
                    <div className="font-semibold text-gray-900 truncate mb-0.5">{project.name}</div>
                    <div className="flex items-center gap-1 text-brand-600 font-medium text-[15px]">
                      <Building2 className="w-3 h-3" />
                      <span>{project.clientName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell">
                    <div className="text--[15px] text-black font-medium line-clamp-2 leading-relaxed">
                      {project.description || '—'}
                    </div>
                  </td>
                  <td className="px-5 py-4 w-fit">
                    <div className="flex items-center gap-1.5 text-[12px] text-black font-medium bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                      <Calendar className="w-3.5 h-3.5 text-black" />
                      <span>{formatAppDate(project.startDate)} - {formatAppDate(project.deadline)}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-black">
                    <ProjectRemaining projectId={project._id} />
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={project.status === ProjectStatus.Active ? 'success' : 'default'} className="text-[10px] uppercase px-2 py-0.5 whitespace-nowrap">
                      {project.status}
                    </Badge>
                  </td>
                  {isAdmin && (
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {project.assignedTo?.length ? (
                          project.assignedTo.map((u: any, idx) => (
                            <span key={idx} className="bg-gray-100/80 text-gray-700 font-medium text-[11px] px-2 py-1 rounded-md border border-gray-200 truncate max-w-[110px] inline-block" title={u?.name || u}>
                              {u?.name || u}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                  )}
                  {isAdmin && (
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(project)} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(project._id)} className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isAdmin && (
        <ProjectModal open={modalOpen} onClose={handleClose} project={editing} />
      )}
    </div>
  );
}
