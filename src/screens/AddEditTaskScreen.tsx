import React, {useState, useEffect} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {TextInput, Button, Title, HelperText, useTheme} from 'react-native-paper';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type {MD3Theme} from 'react-native-paper/lib/typescript/types';
import {useThemeContext} from '../theme/ThemeContext';
import auth from '@react-native-firebase/auth';
import {useTasks} from '../hooks/useTasks';
import {Task} from '../models/Task';

type RootStackParamList = {
  AddEditTask: {taskId?: string} | undefined;
};

type AddEditTaskScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'AddEditTask'
>;

const AddEditTaskScreen = () => {
  const navigation = useNavigation<AddEditTaskScreenNavigationProp>();
  const route = useRoute();
  const {taskId} = (route.params || {}) as {taskId?: string};
  const paperTheme = useTheme();
  const {theme, isDark} = useThemeContext();
  
  const {tasks, createTask, updateTask} = useTasks();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load task data if in edit mode
  useEffect(() => {
    if (taskId) {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
      }
    }
  }, [taskId, tasks]);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      if (taskId) {
        // Update existing task
        await updateTask(taskId, {
          title: title.trim(),
          description: description.trim(),
        });
      } else {
        // Create new task
        const userId = auth().currentUser?.uid;
        if (!userId) {
          throw new Error('User not authenticated');
        }
        await createTask({
          title: title.trim(),
          description: description.trim(),
          isCompleted: false,
          userId,
        });
      }
      navigation.goBack();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save task. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = getStyles(isDark, paperTheme);
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Title style={styles.title}>
            {taskId ? 'Edit Task' : 'Add New Task'}
          </Title>

          <View style={styles.inputContainer}>
            <TextInput
              label="Title"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              maxLength={100}
              disabled={isSubmitting}
              error={!!error && !title.trim()}
              left={
                <TextInput.Icon 
                  icon={({ size, color }) => (
                    <MaterialIcons name="title" size={size + 4} color={theme.colors.onSurfaceVariant} />
                  )} 
                />
              }
              style={[styles.input, { backgroundColor: theme.colors.surface }]}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant,
                  background: theme.colors.surface,
                  surface: theme.colors.surface,
                  onSurfaceVariant: theme.colors.onSurfaceVariant,
                  outline: theme.colors.outline,
                },
                roundness: 8,
              }}
              outlineStyle={{ borderColor: theme.colors.outline }}
            />
            {error && !title.trim() && (
              <HelperText type="error" visible={!!error && !title.trim()}>
                Title is required
              </HelperText>
            )}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              mode="outlined"
              multiline
              numberOfLines={4}
              maxLength={500}
              disabled={isSubmitting}
              left={
                <TextInput.Icon 
                  icon={({ size, color }) => (
                    <MaterialIcons name="description" size={size + 4} color={theme.colors.onSurfaceVariant} />
                  )} 
                />
              }
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                minHeight: 100,
                textAlignVertical: 'top',
              }]}
              theme={{
                colors: {
                  primary: theme.colors.primary,
                  text: theme.colors.onSurface,
                  placeholder: theme.colors.onSurfaceVariant,
                  background: theme.colors.surface,
                  surface: theme.colors.surface,
                  onSurfaceVariant: theme.colors.onSurfaceVariant,
                  outline: theme.colors.outline,
                },
                roundness: 8,
              }}
              outlineStyle={{ borderColor: theme.colors.outline }}
            />
          </View>

          {error && (
            <HelperText type="error" visible={!!error} style={styles.errorText}>
              {error}
            </HelperText>
          )}

          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={[styles.button, styles.cancelButton]}
              disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !title.trim()}
              style={[styles.button, styles.submitButton]}>
              {isSubmitting
                ? 'Saving...'
                : taskId
                ? 'Update Task'
                : 'Add Task'}
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const getStyles = (isDark: boolean, theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    backgroundColor: isDark ? theme.colors.surfaceVariant : theme.colors.surface,
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
    color: theme.colors.onSurface,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  descriptionInput: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  errorText: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: theme.colors.primary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
  },
});

export default AddEditTaskScreen;
