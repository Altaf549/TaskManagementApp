import {useEffect, useMemo, useState} from 'react';
import {useRealm} from '../config/realm';
import {Task} from '../models/Task';
import TaskService from '../services/TaskService';
import {BSON, Results, Object as RealmObject, ObjectSchema} from 'realm';

// Define the Realm Task type
type RealmTask = {
  _id: BSON.ObjectId;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  isSynced: boolean;
  firestoreId?: string;
  isDeleted?: boolean;
};

export const useTasks = () => {
  const realm = useRealm();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);

  const taskService = useMemo(() => new TaskService(realm), [realm]);

  // Helper function to map Realm tasks to Task objects
  const mapRealmTasks = (realmTasks: any[]): Task[] => {
    return Array.from(realmTasks).map(task => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      isCompleted: task.isCompleted,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
      userId: task.userId,
      isSynced: task.isSynced,
    }));
  };

  // Load tasks from Realm
  useEffect(() => {
    try {
      // Get initial tasks
      const realmTasks = Array.from(realm.objects('Task').sorted('createdAt', true));
      setTasks(mapRealmTasks(realmTasks));
      
      // Add change listener
      const onChange = () => {
        const updatedTasks = Array.from(realm.objects('Task').sorted('createdAt', true));
        setTasks(mapRealmTasks(updatedTasks));
      };
      
      realm.addListener('change', onChange);
      
      // Initial sync
      const sync = async () => {
        try {
          await taskService.syncTasks();
          // Force update after sync
          const updatedTasks = Array.from(realm.objects('Task').sorted('createdAt', true));
          setTasks(mapRealmTasks(updatedTasks));
        } catch (err) {
          console.error('Sync error:', err);
        }
      };
      
      sync();
      
      // Set up periodic sync (every 30 seconds)
      const syncInterval = setInterval(sync, 30000);
      
      return () => {
        clearInterval(syncInterval);
        realm.removeListener('change', onChange);
      };
    } catch (err) {
      console.error('Error in useTasks:', err);
      setError(err instanceof Error ? err : new Error('Failed to load tasks'));
    } finally {
      setIsLoading(false);
    }
  }, [realm, taskService]);

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>) => {
    try {
      return await taskService.createTask(taskData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create task'));
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await taskService.updateTask(taskId, updates);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update task'));
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete task'));
      throw err;
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      await taskService.toggleTaskCompletion(taskId);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle task completion'));
      throw err;
    }
  };

  const syncTasks = async () => {
    try {
      await taskService.syncTasks();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sync tasks'));
      throw err;
    }
  };

  return {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    syncTasks,
  };
};
