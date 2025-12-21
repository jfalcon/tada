export interface Task {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description?: string;
  due_date?: Date;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Pending' | 'In Progress' | 'Completed';
  created_at: Date;
  updated_at: Date;
}

export type NewTask = Omit<Task, 'id' | 'created_at' | 'updated_at'>;

export type UpdateTask = Partial<NewTask>;
