import React, {useState, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AppStackParamList} from '../types/navigation';
import {useTasks} from '../hooks/useTasks';
import {Task} from '../models/Task';
import {FAB, List, IconButton, Menu, Button, Appbar} from 'react-native-paper';
import {format} from 'date-fns';
import {useAuth} from '../contexts/AuthContext';

const TaskListScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {signOut, user} = useAuth();
  const {
    tasks,
    isLoading,
    error,
    deleteTask,
    toggleTaskCompletion,
    syncTasks,
  } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      navigation.reset({
        index: 0,
        routes: [{name: 'SignIn' as never}],
      });
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  }, [signOut, navigation]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await syncTasks();
    } catch (err) {
      Alert.alert('Error', 'Failed to refresh tasks');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeleteTask = useCallback((taskId: string, taskTitle: string) => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${taskTitle}"?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteTask(taskId).catch(console.error),
        },
      ],
    );
  }, [deleteTask]);

  const renderTaskItem = ({item}: {item: Task}) => (
    <List.Item
      title={item.title}
      description={item.description}
      left={props => (
        <IconButton
          icon={item.isCompleted ? 'check-circle' : 'circle-outline'}
          iconColor={item.isCompleted ? '#4CAF50' : '#757575'}
          onPress={() => toggleTaskCompletion(item.id)}
          {...props}
        />
      )}
      right={props => (
        <View style={styles.taskActions}>
          <Text style={styles.taskDate}>
            {format(new Date(item.updatedAt), 'MMM d, yyyy')}
          </Text>
          <IconButton
            {...props}
            icon="pencil"
            onPress={() =>
              navigation.navigate('AddEditTask', {taskId: item.id})
            }
          />
          <IconButton
            {...props}
            icon="delete"
            onPress={() => handleDeleteTask(item.id, item.title)}
          />
        </View>
      )}
      style={[
        styles.taskItem,
        item.isCompleted && styles.completedTask,
      ]}
      titleStyle={item.isCompleted ? styles.completedTitle : null}
      descriptionStyle={item.isCompleted ? styles.completedDescription : null}
    />
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          Error loading tasks: {error.message}
        </Text>
        <Button mode="contained" onPress={handleRefresh}>
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header mode="small" style={styles.appBar}>
        <Appbar.Content title="My Tasks" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }>
          <Menu.Item
            leadingIcon="logout"
            onPress={handleSignOut}
            title="Sign Out"
          />
        </Menu>
      </Appbar.Header>
      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        renderItem={renderTaskItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No tasks yet. Add one to get started!</Text>
            </View>
          ) : null
        }
        style={styles.flatList}
      />
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddEditTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  appBar: {
    backgroundColor: '#fff',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  taskItem: {
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  completedTask: {
    opacity: 0.7,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: '#bdbdbd',
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDate: {
    fontSize: 12,
    color: '#757575',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#757575',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6200ee',
  },
  menuButton: {
    marginRight: 8,
  },
});

export default TaskListScreen;
