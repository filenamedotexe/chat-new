import { UserRole } from '@chat/shared-types';

export type RequirementType = 
  | 'project_has_tasks'
  | 'project_has_organization'
  | 'task_has_assignee'
  | 'task_has_due_date'
  | 'file_has_description'
  | 'all_tasks_completed'
  | 'user_has_profile'
  | 'project_has_description';

export interface Requirement {
  type: RequirementType;
  message: string;
  helpText?: string;
  action?: string;
  actionUrl?: string;
}

export interface RequirementCheck {
  passed: boolean;
  requirement?: Requirement;
}

// Project-related requirements
export function checkProjectCanBeCompleted(project: any): RequirementCheck {
  // Project must have at least one task
  if (!project.taskCount || project.taskCount === 0) {
    return {
      passed: false,
      requirement: {
        type: 'project_has_tasks',
        message: 'Project must have at least one task',
        helpText: 'A project needs tasks to track work progress',
        action: 'Add Task',
        actionUrl: `/projects/${project.id}/tasks`
      }
    };
  }

  // All tasks must be completed
  if (project.progress?.percentage !== 100) {
    return {
      passed: false,
      requirement: {
        type: 'all_tasks_completed',
        message: 'All tasks must be completed',
        helpText: `${project.progress?.notStarted + project.progress?.inProgress + project.progress?.inReview} tasks are not done yet`,
        action: 'View Tasks',
        actionUrl: `/projects/${project.id}/tasks`
      }
    };
  }

  return { passed: true };
}

// Task-related requirements
export function checkTaskCanBeCreated(projectId?: string): RequirementCheck {
  if (!projectId) {
    return {
      passed: false,
      requirement: {
        type: 'project_has_organization',
        message: 'Please select a project first',
        helpText: 'Tasks must belong to a project',
        action: 'Select Project',
      }
    };
  }

  return { passed: true };
}

export function checkTaskCanBeCompleted(task: any): RequirementCheck {
  // Task must have an assignee
  if (!task.assignedToId) {
    return {
      passed: false,
      requirement: {
        type: 'task_has_assignee',
        message: 'Task must be assigned to someone',
        helpText: 'Assign this task to a team member before marking it complete',
        action: 'Assign Task',
      }
    };
  }

  return { passed: true };
}

// File-related requirements
export function checkFileCanBeShared(file: any): RequirementCheck {
  if (!file.description || file.description.trim() === '') {
    return {
      passed: false,
      requirement: {
        type: 'file_has_description',
        message: 'File must have a description',
        helpText: 'Add a description to help others understand this file',
        action: 'Add Description',
      }
    };
  }

  return { passed: true };
}

// User-related requirements
export function checkUserCanCreateProject(user: any): RequirementCheck {
  if (!user.name || user.name.trim() === '') {
    return {
      passed: false,
      requirement: {
        type: 'user_has_profile',
        message: 'Please complete your profile first',
        helpText: 'Add your name to your profile before creating projects',
        action: 'Update Profile',
        actionUrl: '/settings'
      }
    };
  }

  return { passed: true };
}

// Role-based requirement checks
export function checkRoleCanPerformAction(
  role: UserRole,
  action: 'create_project' | 'delete_task' | 'edit_organization' | 'view_all_files'
): RequirementCheck {
  const rolePermissions: Record<UserRole, string[]> = {
    admin: ['create_project', 'delete_task', 'edit_organization', 'view_all_files'],
    team_member: ['create_project', 'delete_task'],
    client: [],
    user: []
  };

  const allowed = rolePermissions[role]?.includes(action) ?? false;

  if (!allowed) {
    const actionMessages: Record<string, string> = {
      create_project: 'Only admins and team members can create projects',
      delete_task: 'Only admins and team members can delete tasks',
      edit_organization: 'Only admins can edit organizations',
      view_all_files: 'Only admins can view all files'
    };

    return {
      passed: false,
      requirement: {
        type: 'user_has_profile',
        message: actionMessages[action] || 'You do not have permission to perform this action',
        helpText: 'Contact an administrator if you need access',
      }
    };
  }

  return { passed: true };
}

// Batch requirement checking
export function checkMultipleRequirements(
  checks: (() => RequirementCheck)[]
): RequirementCheck[] {
  return checks.map(check => check());
}

// Helper to get the first failed requirement
export function getFirstFailedRequirement(
  checks: RequirementCheck[]
): Requirement | null {
  const failed = checks.find(check => !check.passed);
  return failed?.requirement ?? null;
}