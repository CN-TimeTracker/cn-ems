
'use client';

import { useState, useMemo } from 'react';
import { 
  useAllProjects, 
  useAssignedProjects, 
  useDeleteProject, 
  useProjectRemainingHours,
  useActiveEmployees 
} from '@/hooks';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/authSlice';
import { UserRole, ProjectStatus, Project } from '@/types';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Calendar, 
  Building2, 
  Clock, 
  Search, 
  Filter,
  Users,
  X,
  ChevronDown
} from 'lucide-react';
import Spinner from '@/components/ui/Spinner';
import EmptyState from '@/components/ui/EmptyState';
import Badge from '@/components/ui/Badge';
import ProjectModal from '@/components/projects/ProjectModal';
import ProjectDetailsModal from '@/components/projects/ProjectDetailsModal';
import { formatAppDate, formatDecimalHours } from '@/lib/dateUtils';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

function ProjectRemaining({ projectId }: { projectId: string }) {
  const { data: remaining, isLoading } = useProjectRemainingHours(projectId);

  if (isLoading || !remaining) return <div className="w-24 h-4 bg-gray-100 animate-pulse rounded" />;

  const percentage = remaining.allocated > 0 ? (remaining.spent / remaining.allocated) * 100 : 0;
  const isOver = remaining.remaining < 0;

  return (
    <div className="w-full min-w-[160px] max-w-[220px]">
      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50 mb-2 shadow-inner">
        <div
          className={`h-full transition-all duration-700 ${isOver ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]' : 'bg-brand-500 shadow-[0_0_8px_rgba(37,99,235,0.2)]'}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase tracking-widest">
        <div className="flex flex-col">
          <span className="text-gray-400">Logged</span>
          <span className="text-gray-900">{formatDecimalHours(remaining.spent)} / {formatDecimalHours(remaining.allocated)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className={isOver ? 'text-red-400' : 'text-brand-400'}>{isOver ? 'Over' : 'Remaining'}</span>
          <span className={isOver ? 'text-red-600' : 'text-brand-600'}>
            {formatDecimalHours(Math.abs(remaining.remaining))}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const user = useAppSelector(selectCurrentUser);
  const isAdmin = user?.role === UserRole.Admin;

  // Choose hook based on role
  const allProjectsQuery = useAllProjects(isAdmin);
  const assignedProjectsQuery = useAssignedProjects(!isAdmin);
  const { data: employees } = useActiveEmployees(isAdmin);

  const { data: projects, isLoading } = isAdmin ? allProjectsQuery : assignedProjectsQuery;
  const { mutate: deleteProject } = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [viewing, setViewing] = useState<Project | null>(null);

  // Filter States
  const [filters, setFilters] = useState({
    search: '',
    project: '',
    status: '' as ProjectStatus | '',
    employee: '',
    startDate: '',
    endDate: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    return projects.filter(p => {
      const matchesSearch = !filters.search || 
        p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        p.clientName.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesProject = !filters.project || p._id === filters.project;
      const matchesStatus = !filters.status || p.status === filters.status;
      
      const matchesEmployee = !filters.employee || 
        (p.assignedTo as any[]).some(u => (typeof u === 'string' ? u : u._id) === filters.employee);

      const matchesStart = !filters.startDate || new Date(p.startDate) >= new Date(filters.startDate);
      const matchesEnd = !filters.endDate || new Date(p.deadline) <= new Date(filters.endDate);

      return matchesSearch && matchesProject && matchesStatus && matchesEmployee && matchesStart && matchesEnd;
    });
  }, [projects, filters]);

  const handleEdit = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setEditing(project);
    setModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('Delete this project? This cannot be undone.')) {
      deleteProject(id);
    }
  };

  const handleRowClick = (project: Project) => {
    setViewing(project);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      project: '',
      status: '',
      employee: '',
      startDate: '',
      endDate: ''
    });
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#1A2B48] tracking-tight">{isAdmin ? 'Project Management' : 'My Assignments'}</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            {filteredProjects.length} projects found
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-gray-100' : ''}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(filters.status || filters.employee || filters.startDate || filters.endDate) && (
              <span className="w-2 h-2 rounded-full bg-brand-500" />
            )}
          </button>
          {isAdmin && (
            <button onClick={() => setModalOpen(true)} className="btn-primary shadow-lg shadow-blue-900/10">
              <Plus className="w-4 h-4" /> New Project
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-8 shadow-sm animate-in slide-in-from-top-4 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <div>
              <Input 
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
                className="bg-gray-50/50"
              />
            </div>
            
            <Select 
              value={filters.project}
              onChange={(e) => setFilters(f => ({ ...f, project: e.target.value }))}
              options={[
                { value: '', label: 'All Projects' },
                ...(projects?.map(p => ({ value: p._id, label: p.name })) || [])
              ]}
              className="bg-gray-50/50"
            />

            <Select 
              value={filters.status}
              onChange={(e) => setFilters(f => ({ ...f, status: e.target.value as any }))}
              options={[
                { value: '', label: 'All Status' },
                { value: ProjectStatus.Active, label: 'Active' },
                { value: ProjectStatus.Completed, label: 'Completed' },
              ]}
              className="bg-gray-50/50"
            />

            {isAdmin && (
              <Select 
                value={filters.employee}
                onChange={(e) => setFilters(f => ({ ...f, employee: e.target.value }))}
                options={[
                  { value: '', label: 'All Employees' },
                  ...(employees?.map(emp => ({ value: emp._id, label: emp.name })) || [])
                ]}
                className="bg-gray-50/50"
              />
            )}

            <Input 
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
              className="bg-gray-50/50"
              placeholder="From Date"
            />

            <Input 
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
              className="bg-gray-50/50"
              placeholder="To Date"
            />
          </div>
          
          <div className="flex justify-end mt-4">
            <button 
              onClick={resetFilters}
              className="text-xs font-black text-gray-400 hover:text-red-500 uppercase tracking-widest flex items-center gap-1 transition-colors"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {!filteredProjects.length ? (
        <EmptyState 
          title="No projects match" 
          description="Try adjusting your filters to find what you're looking for." 
          icon={Search}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 uppercase text-[10px] font-black tracking-[0.1em] border-b border-gray-100">
                  <th className="px-6 py-5">Project & Client</th>
                  <th className="px-6 py-5 hidden md:table-cell">Details</th>
                  <th className="px-6 py-5">Timeline</th>
                  <th className="px-6 py-5">Progress</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Team</th>
                  {isAdmin && <th className="px-6 py-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredProjects.map((project) => (
                  <tr 
                    key={project._id} 
                    onClick={() => handleRowClick(project)}
                    className="hover:bg-brand-50/20 transition-all cursor-pointer group"
                  >
                    <td className="px-6 py-5">
                      <div className="font-black text-gray-900 text-base mb-1 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{project.name}</div>
                      <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs uppercase tracking-widest">
                        <Building2 className="w-3 h-3 text-brand-500" />
                        <span>{project.clientName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 hidden md:table-cell max-w-[200px]">
                      <div className="text-xs text-gray-500 font-medium line-clamp-2 leading-relaxed">
                        {project.description || <span className="italic opacity-50">No description</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="inline-flex items-center gap-2 bg-white border border-gray-100 px-3 py-1.5 rounded-xl shadow-sm text-[11px] font-black text-gray-700">
                        <Calendar className="w-3.5 h-3.5 text-brand-500" />
                        <span>{formatAppDate(project.startDate)} - {formatAppDate(project.deadline)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <ProjectRemaining projectId={project._id} />
                    </td>
                    <td className="px-6 py-5">
                      <Badge 
                        variant={project.status === ProjectStatus.Active ? 'success' : 'default'} 
                        className="text-[9px] uppercase font-black tracking-widest px-2.5 py-1"
                      >
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex -space-x-2">
                        {project.assignedTo?.slice(0, 3).map((u: any, idx) => (
                          <div 
                            key={idx} 
                            className="w-8 h-8 rounded-full bg-white border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-brand-700 ring-1 ring-gray-100"
                            title={u?.name || u}
                          >
                            <span className="bg-brand-50 w-full h-full rounded-full flex items-center justify-center">
                              {(u?.name || u).charAt(0)}
                            </span>
                          </div>
                        ))}
                        {project.assignedTo && project.assignedTo.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-gray-400 ring-1 ring-gray-100">
                            +{project.assignedTo.length - 3}
                          </div>
                        )}
                        {!project.assignedTo?.length && (
                          <span className="text-[10px] font-bold text-gray-300 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={(e) => handleEdit(e, project)} 
                            className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-brand-600 hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, project._id)} 
                            className="p-2 rounded-xl text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-sm border border-transparent hover:border-gray-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAdmin && (
        <ProjectModal 
          open={modalOpen} 
          onClose={() => { setModalOpen(false); setEditing(null); }} 
          project={editing} 
        />
      )}

      <ProjectDetailsModal 
        open={!!viewing} 
        onClose={() => setViewing(null)} 
        project={viewing} 
      />
    </div>
  );
}
