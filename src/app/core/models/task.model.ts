export interface Task {
  _id: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'new' | 'in_progress' | 'resolved' | 'rejected';
  createdAt?: string;
  removing?: boolean;
}
