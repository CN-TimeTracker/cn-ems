import { ITask, ICreateTaskInput, IUpdateTaskInput, ITaskFilters } from '../interfaces';
export declare class TaskService {
    /**
     * Creates and assigns a task.
     * Validates that the referenced project and user both exist before creating.
     */
    createTask(input: ICreateTaskInput, createdBy: string): Promise<ITask>;
    /**
     * Filtered task list — supports combinations of projectId, assignedTo, status.
     */
    getTasks(filters: ITaskFilters): Promise<ITask[]>;
    /**
     * Returns tasks assigned to a specific user — used on the employee dashboard.
     */
    getTasksForUser(userId: string): Promise<ITask[]>;
    /**
     * Returns today's pending/in-progress tasks for a user.
     */
    getTodaysTasksForUser(userId: string): Promise<ITask[]>;
    /**
     * Returns a single task with full population.
     */
    getTaskById(id: string): Promise<ITask>;
    /**
     * Updates task fields. Employees can only update status; Admins can update anything.
     * The role enforcement happens in the controller/middleware layer.
     */
    updateTask(id: string, input: IUpdateTaskInput): Promise<ITask>;
    /**
     * Deletes a task — Admin only. Controller enforces the role.
     */
    deleteTask(id: string): Promise<void>;
    /**
     * Returns all overdue tasks (past deadline, not Done).
     * Used by the accountability engine on the Admin dashboard.
     */
    getOverdueTasks(): Promise<ITask[]>;
    /**
     * Returns user IDs that have NO tasks assigned (accountability engine).
     */
    getUsersWithNoTasks(allUserIds: string[]): Promise<string[]>;
    /** Centralized population to keep it DRY across all task queries */
    private _populate;
}
//# sourceMappingURL=task.service.d.ts.map