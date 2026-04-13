import { User } from './user.model';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'new' | 'in_progress' | 'resolved' | 'rejected';

export interface Task {
  _id: string;
  title: string;
  description: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  createdAt?: string;
  updatedAt?: string;
  assignedTo?: string;
  removing?: boolean;
  user?: User;
}
