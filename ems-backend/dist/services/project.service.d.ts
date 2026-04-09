import { IProject, ICreateProjectInput, IUpdateProjectInput } from '../interfaces';
export declare class ProjectService {
    /**
     * Helper to add business days (skipping weekends)
     */
    private addBusinessDays;
    /**
     * Creates a new project. createdBy is injected from the JWT payload in the controller.
     */
    createProject(input: ICreateProjectInput, createdBy: string): Promise<IProject>;
    /**
     * Returns all projects sorted by deadline ascending.
     * Populates creator name so the frontend doesn't need a second call.
     */
    getAllProjects(): Promise<IProject[]>;
    /**
     * Returns only Active projects — used in work-log dropdowns.
     */
    getActiveProjects(): Promise<IProject[]>;
    /**
     * Returns a single project with creator info.
     */
    getProjectById(id: string): Promise<IProject>;
    /**
     * Returns projects assigned to a specific user.
     */
    getAssignedProjects(userId: string): Promise<IProject[]>;
    /**
     * Calculates remaining hours for a project.
     */
    getProjectRemainingHours(projectId: string): Promise<{
        allocated: number;
        spent: number;
        remaining: number;
    }>;
    /**
     * Admin can update any project field, including marking it Completed.
     */
    updateProject(id: string, input: IUpdateProjectInput): Promise<IProject>;
    /**
     * Hard delete — only for Admin.
     * NOTE: deleting a project does NOT cascade-delete tasks/logs — handle separately or use soft-delete in production.
     */
    deleteProject(id: string): Promise<void>;
}
//# sourceMappingURL=project.service.d.ts.map