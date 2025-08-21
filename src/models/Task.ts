export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isSynced: boolean;
}

export interface TaskDocument extends Omit<Task, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: any; // Using any to avoid FirebaseFirestore type dependency
  updatedAt: any;
}
