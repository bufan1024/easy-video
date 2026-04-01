export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Task {
  id: string;
  videoPath: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
  createdAt: number;
}

export interface CreateTaskRequest {
  videoPath: string;
}

export interface TaskProgressResponse {
  taskId: string;
  status: TaskStatus;
  progress: number;
  currentStep: string;
}