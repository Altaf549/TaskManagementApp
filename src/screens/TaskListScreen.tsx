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
  const styles = getStyles(theme);
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
      item.isCompleted && styles.completedTask,
      { borderLeftWidth: 4, borderLeftColor: item.isCompleted ? theme.colors.primary : 'transparent' }
    ]}>
      <View style={styles.taskContent}>
        <MaterialIcons
          name={item.isCompleted ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={item.isCompleted ? theme.colors.primary : theme.colors.onSurfaceVariant}
          style={styles.checkbox}
          onPress={() => toggleTaskCompletion(item.id)}
        />
        <View style={styles.taskTextContainer} onTouchEnd={() => navigation.navigate('AddEditTask', {taskId: item.id})}>
          <Text 
            variant="bodyLarge"
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
              variant="bodyMedium"
              style={[
                styles.taskDescription,
                item.isCompleted && styles.completedDescription
              ]}
              numberOfLines={2}
            >
              {item.description}
            </Text>
          ) : null}
          <Text variant="labelSmall" style={styles.taskDate}>
            {format(new Date(item.updatedAt), 'MMM d, yyyy • h:mm a')}
          </Text>
        </View>
        <View style={styles.taskActions}>
          <IconButton
            icon={({ size, color }) => (
              <MaterialIcons 
                name="edit" 
                size={size + 4} 
                color={theme.colors.onSurfaceVariant} 
              />
            )}
            onPress={() => navigation.navigate('AddEditTask', {taskId: item.id})}
            style={styles.actionButton}
            size={20}
          />
          <IconButton
            icon={({ size, color }) => (
              <MaterialIcons 
                name="delete" 
                size={size + 4} 
                color={theme.colors.error} 
              />
            )}
            onPress={() => handleDeleteTask(item.id, item.title)}
            style={styles.actionButton}
            size={20}
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
              <MaterialIcons 
                name="check-circle-outline" 
                size={48} 
                color={theme.colors.onSurfaceVariant}
                style={{ opacity: 0.5, marginBottom: 16 }}
              />
              <Text variant="titleMedium" style={styles.emptyText}>
                No tasks yet
              </Text>
              <Text style={[styles.emptyText, { marginTop: 8, fontSize: 14 }]}>
                Tap the + button to add a new task
              </Text>
            </View>
          ) : null
        }
        style={styles.flatList}
      />
      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon={({ size, color }) => (
          <MaterialIcons name="add" size={size + 4} color={theme.colors.onPrimary} />
        )}
        onPress={() => navigation.navigate('AddEditTask')}
        color={theme.colors.onPrimary}
      />
    </View>
  );
};

const getStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginBottom: 50
  },
  taskCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: theme.colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  taskContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  taskTextContainer: {
    flex: 1,
    marginLeft: 16,
    marginRight: 8,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    marginBottom: 4,
  },
  taskDate: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
    marginTop: 2,
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
    backgroundColor: theme.colors.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    color: theme.colors.error,
    marginBottom: 20,
    textAlign: 'center',
  },
  appBar: {
    elevation: 0,
    backgroundColor: theme.colors.surface,
  },
  welcomeText: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 14,
  },
  emailText: {
    color: theme.colors.onSurface,
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 200,
  },
  avatar: {
    marginLeft: 8,
    backgroundColor: theme.colors.primaryContainer,
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: theme.colors.surfaceVariant,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
  },
  completedDescription: {
    textDecorationLine: 'line-through',
    color: theme.colors.onSurfaceVariant,
    opacity: 0.5,
  },
  flatList: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  taskActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.onSurfaceVariant,
    fontSize: 16,
    lineHeight: 24,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.onSurfaceVariant,
    opacity: 0.7,
    textAlign: 'center',
  },
  menuButton: {
    marginRight: 8,
  },
});

export default TaskListScreen;
