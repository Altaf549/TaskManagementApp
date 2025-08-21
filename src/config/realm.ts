import {createRealmContext} from '@realm/react';
import Realm from 'realm';
import {TaskSchema} from '../models/TaskRealm';

const realmConfig: Realm.Configuration = {
  schema: [TaskSchema],
  schemaVersion: 1,
};

export const {RealmProvider, useRealm, useQuery, useObject} =
  createRealmContext(realmConfig);
