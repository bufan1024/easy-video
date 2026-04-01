import { useState, useEffect } from 'react';
import { getTaskProgress } from '../services/api';

export interface TaskState {
  status: string;
  progress: number;
  currentStep: string;
}

export function useTask(taskId: string | null) {
  const [taskState, setTaskState] = useState<TaskState>({
    status: 'pending',
    progress: 0,
    currentStep: '',
  });

  useEffect(() => {
    if (!taskId) return;

    const pollInterval = setInterval(async () => {
      try {
        const state = await getTaskProgress(taskId);
        setTaskState(state);

        // 如果完成或失败，停止轮询
        if (state.status === 'completed' || state.status === 'failed') {
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Failed to get task progress:', error);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [taskId]);

  return taskState;
}