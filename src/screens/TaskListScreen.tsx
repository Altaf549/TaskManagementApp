import React, {useState, useCallback} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {AppStackParamList} from '../types/navigation';
import {useTasks} from '../hooks/useTasks';
import {Task} from '../models/Task';
import {FAB, List, IconButton, Menu, Button, Appbar, Avatar, Text, useTheme} from 'react-native-paper';
import {format} from 'date-fns';
import {useAuth} from '../contexts/AuthContext';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const TaskListScreen = () => {
  const theme = useTheme();
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
    <View style={[
      styles.taskCard,
      item.isCompleted && styles.completedTask
    ]}>
      <View style={styles.taskContent}>
      <MaterialIcons
        name={item.isCompleted ? 'check-box' : 'check-box-outline-blank'}
        size={24}
        color={item.isCompleted ? '#4CAF50' : '#757575'}
        style={styles.checkbox}
        onPress={() => toggleTaskCompletion(item.id)}
      />
        <View style={styles.taskTextContainer}>
          <Text 
            style={[
              styles.taskTitle,
              item.isCompleted && styles.completedTitle
            ]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {item.description ? (
            <Text 
              style={[
                styles.taskDescription,
                item.isCompleted && styles.completedDescription
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
          <Text style={styles.taskDate}>
            {format(new Date(item.updatedAt), 'MMM d, yyyy • h:mm a')}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <IconButton
            icon={({ size, color }) => (
              <MaterialIcons name="edit" size={size + 4} color="#B8860B" />
            )}
            onPress={() => navigation.navigate('AddEditTask', {taskId: item.id})}
            style={styles.actionButton}
          />
          <IconButton
            icon={({ size, color }) => (
              <MaterialIcons name="delete" size={size + 4} color="red" />
            )}
            onPress={() => handleDeleteTask(item.id, item.title)}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
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

  const getUserInitials = (email?: string) => {
    return email ? email.charAt(0).toUpperCase() : 'U';
  };

  return (
    <View style={styles.container}>
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
        icon={({ size, color }) => (
          <MaterialIcons name="add" size={size + 4} color="white" />
        )}
        onPress={() => navigation.navigate('AddEditTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  taskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 4,
  },
  actionButton: {
    margin: 0,
  },
  checkbox: {
    margin: 0,
    marginRight: 0,
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
    elevation: 0,
    paddingRight: 8,
  },
  welcomeText: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  emailText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  avatar: {
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  taskItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#9e9e9e',
    fontWeight: '400',
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: '#bdbdbd',
  },
  flatList: {
    flex: 1,
    paddingBottom: 80, // Add padding to account for bottom navigation and FAB
  },
  listContent: {
    padding: 16,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  taskDate: {
    fontSize: 12,
    color: '#9e9e9e',
    marginRight: 4,
    fontStyle: 'italic',
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
    bottom: 70, // Raise FAB to be above the bottom navigation
    backgroundColor: '#6200ee',
    elevation: 4,
  },
  menuButton: {
    marginRight: 8,
  },
});

export default TaskListScreen;
