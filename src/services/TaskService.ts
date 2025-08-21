import {BSON} from 'realm';
import {Task} from '../models/Task';
import {auth, firestore} from '../config/firebase';
import {TaskSchema} from '../models/TaskRealm';

class TaskService {
  private realm: Realm;
  private firestore = firestore();
  private tasksCollection = this.firestore.collection('tasks');

  constructor(realm: Realm) {
    this.realm = realm;
  }

  private getCurrentUserId(): string {
    const user = auth().currentUser;
    if (!user) throw new Error('User not authenticated');
    return user.uid;
  }

  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>): Promise<Task> {
    const userId = this.getCurrentUserId();
    const now = new Date();
    
    try {
      console.log('=== FIREBASE DEBUG ===');
      console.log('Current user ID:', userId);
      console.log('Firebase app initialized:', !!auth().app);
      console.log('Firebase auth current user:', auth().currentUser?.uid);
      console.log('Task data to save:', JSON.stringify(taskData, null, 2));
      
      // Check Firebase connection
      try {
        await auth().currentUser?.getIdToken(true);
        console.log('Firebase auth token refresh successful');
      } catch (authError) {
        console.error('Firebase auth token refresh failed:', authError);
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      // Create in Firestore
      console.log('Attempting to save to Firestore...');
      const docRef = await this.tasksCollection.add({
        ...taskData,
        userId,
        createdAt: now,
        updatedAt: now,
      });
      
      console.log('✅ Task successfully saved to Firestore with ID:', docRef.id);
      console.log('=== END FIREBASE DEBUG ===');

      // Create in Realm
      const task: Task = {
        ...taskData,
        id: docRef.id,
        createdAt: now,
        updatedAt: now,
        userId,
        isSynced: true,
      };

      this.realm.write(() => {
        this.realm.create('Task', {
          ...task,
          _id: new BSON.ObjectId(),
          firestoreId: docRef.id,
        });
      });

      return task;
    } catch (error) {
      console.error('Error creating task in Firestore:', error);
      console.log('Falling back to local storage...');
      
      // If Firestore fails, save locally with isSynced: false
      const localId = new BSON.ObjectId().toHexString();
      const localTask: Task = {
        ...taskData,
        id: localId,
        createdAt: now,
        updatedAt: now,
        userId,
        isSynced: false,
      };

      this.realm.write(() => {
        this.realm.create('Task', {
          ...localTask,
          _id: new BSON.ObjectId(localId),
        });
      });

      return localTask;
    }
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const userId = this.getCurrentUserId();
    const now = new Date();
    
    // Cast the task to any to access Realm properties
    const task = this.realm.objectForPrimaryKey<TaskSchema & { firestoreId?: string }>('Task', new BSON.ObjectId(taskId));
    if (!task) throw new Error('Task not found');

    try {
      // Update in Firestore if synced
      if (task.firestoreId && typeof task.firestoreId === 'string' && task.firestoreId.trim() !== '') {
        await this.tasksCollection.doc(task.firestoreId).update({
          ...updates,
          updatedAt: now,
        });
      }

      // Update in Realm
      this.realm.write(() => {
        // Update each property individually for Realm objects
        for (const [key, value] of Object.entries(updates)) {
          if (value !== undefined) {
            (task as any)[key] = value;
          }
        }
        task.updatedAt = now;
        task.isSynced = true;
      });
    } catch (error) {
      // Mark as not synced if Firestore update fails
      this.realm.write(() => {
        task.isSynced = false;
        task.updatedAt = now;
      });
      throw error;
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = this.realm.objectForPrimaryKey('Task', taskId);
    if (!task) return;

    try {
      // Delete from Firestore if synced
      if (task.firestoreId && typeof task.firestoreId === 'string' && task.firestoreId.trim() !== '') {
        await this.tasksCollection.doc(task.firestoreId).delete();
      }

      // Delete from Realm
      this.realm.write(() => {
        this.realm.delete(task);
      });
    } catch (error) {
      // If Firestore delete fails, mark for deletion
      this.realm.write(() => {
        task.isDeleted = true;
        task.isSynced = false;
      });
      throw error;
    }
  }

  async toggleTaskCompletion(taskId: string): Promise<void> {
    const task = this.realm.objectForPrimaryKey('Task', new BSON.ObjectId(taskId));
    if (!task) return;

    const updates = {
      isCompleted: !task.isCompleted,
      updatedAt: new Date(),
    };

    await this.updateTask(taskId, updates);
  }

  // Sync local changes with Firestore
  async syncTasks(): Promise<void> {
    const userId = this.getCurrentUserId();
    const unsyncedTasks = this.realm
      .objects('Task')
      .filtered('isSynced == false');

    for (const task of unsyncedTasks) {
      try {
        if (task.isDeleted) {
          if (task.firestoreId && typeof task.firestoreId === 'string' && task.firestoreId.trim() !== '') {
            await this.tasksCollection.doc(task.firestoreId).delete();
          }
          this.realm.write(() => {
            this.realm.delete(task);
          });
        } if (task.firestoreId && typeof task.firestoreId === 'string' && task.firestoreId.trim() !== '') {
          // Update existing task
          await this.tasksCollection.doc(task.firestoreId).update({
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted,
            updatedAt: new Date(),
          });
          this.realm.write(() => {
            task.isSynced = true;
          });
        } else {
          // Create new task
          const docRef = await this.tasksCollection.add({
            title: task.title,
            description: task.description,
            isCompleted: task.isCompleted,
            userId,
            createdAt: task.createdAt,
            updatedAt: new Date(),
          });
          this.realm.write(() => {
            task.firestoreId = docRef.id;
            task.isSynced = true;
          });
        }
      } catch (error) {
        console.error('Error syncing task:', error);
      }
    }
  }
}

export default TaskService;
