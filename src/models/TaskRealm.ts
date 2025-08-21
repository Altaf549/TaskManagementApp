import Realm from 'realm';
import {BSON} from 'realm';
import {Task} from './Task';

export class TaskSchema extends Realm.Object {
  _id!: BSON.ObjectId;
  title!: string;
  description?: string;
  isCompleted!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  userId!: string;
  isSynced!: boolean;
  firestoreId?: string;

  static schema: Realm.ObjectSchema = {
    name: 'Task',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: () => new BSON.ObjectId()},
      title: 'string',
      description: 'string?',
      isCompleted: {type: 'bool', default: false},
      createdAt: {type: 'date', default: () => new Date()},
      updatedAt: 'date',
      userId: 'string',
      isSynced: {type: 'bool', default: false},
      firestoreId: 'string?',
    },
  };
}
