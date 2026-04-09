import Project from '../models/Project.model';
import {
  IProject,
  ICreateProjectInput,
  IUpdateProjectInput,
  ProjectStatus,
} from '../interfaces';

// ─────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────

export class ProjectService {
  /**
   * Helper to add business days (skipping weekends)
   */
  private addBusinessDays(startDate: Date, days: number): Date {
    const date = new Date(startDate);
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        added++;
      }
    }
    return date;
  }

  /**
   * Creates a new project. createdBy is injected from the JWT payload in the controller.
   */
  async createProject(
    input: ICreateProjectInput,
    createdBy: string
  ): Promise<IProject> {
    const { startDate, allocatedHours } = input;
    
    // Auto-calculate deadline if not provided or force calculate according to 8h/day rule
    const daysRequired = Math.ceil((allocatedHours || 0) / 8);
    const calculatedDeadline = this.addBusinessDays(new Date(startDate), Math.max(0, daysRequired - 1));

    const project = await Project.create({ 
      ...input, 
      deadline: calculatedDeadline,
      createdBy 
    });
    return project.populate('createdBy', 'name email role').then(p => p.populate('assignedTo', 'name email'));
  }

  /**
   * Returns all projects sorted by deadline ascending.
   * Populates creator name so the frontend doesn't need a second call.
   */
  async getAllProjects(): Promise<IProject[]> {
    return Project.find()
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });
  }

  /**
   * Returns only Active projects — used in work-log dropdowns.
   */
  async getActiveProjects(): Promise<IProject[]> {
    return Project.find({ status: ProjectStatus.Active })
      .populate('createdBy', 'name')
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });
  }

  /**
   * Returns a single project with creator info.
   */
  async getProjectById(id: string): Promise<IProject> {
    const project = await Project.findById(id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!project) throw new Error('Project not found');
    return project;
  }

  /**
   * Returns projects assigned to a specific user.
   */
  async getAssignedProjects(userId: string): Promise<IProject[]> {
    return Project.find({ 
      assignedTo: new (await import('mongoose')).default.Types.ObjectId(userId),
      status: ProjectStatus.Active 
    })
      .populate('assignedTo', 'name email')
      .sort({ deadline: 1 });
  }

  /**
   * Calculates remaining hours for a project.
   */
  async getProjectRemainingHours(projectId: string): Promise<{
    allocated: number;
    spent: number;
    remaining: number;
  }> {
    const project = await Project.findById(projectId);
    if (!project) throw new Error('Project not found');

    const Task = (await import('../models/Task.model')).default;
    const tasks = await Task.find({ projectId });
    
    const totalMinutesSpent = tasks.reduce((sum, t) => sum + (t.totalMinutesSpent || 0), 0);
    const totalHoursSpent = totalMinutesSpent / 60;
    
    return {
      allocated: project.allocatedHours || 0,
      spent: parseFloat(totalHoursSpent.toFixed(2)),
      remaining: parseFloat(((project.allocatedHours || 0) - totalHoursSpent).toFixed(2))
    };
  }

  /**
   * Admin can update any project field, including marking it Completed.
   */
  async updateProject(
    id: string,
    input: IUpdateProjectInput
  ): Promise<IProject> {
    const existing = await Project.findById(id);
    if (!existing) throw new Error('Project not found');

    const updateData: any = { ...input };

    // Recalculate deadline if startDate or allocatedHours change
    if (input.startDate || input.allocatedHours !== undefined) {
      const start = input.startDate ? new Date(input.startDate) : existing.startDate;
      const hours = input.allocatedHours !== undefined ? input.allocatedHours : existing.allocatedHours;
      const daysRequired = Math.ceil(hours / 8);
      updateData.deadline = this.addBusinessDays(start, Math.max(0, daysRequired - 1));
    }

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email');
    return project!;
  }

  /**
   * Hard delete — only for Admin.
   * NOTE: deleting a project does NOT cascade-delete tasks/logs — handle separately or use soft-delete in production.
   */
  async deleteProject(id: string): Promise<void> {
    const project = await Project.findByIdAndDelete(id);
    if (!project) throw new Error('Project not found');
  }
}
