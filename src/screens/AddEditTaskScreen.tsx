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
import {TextInput, Button, Title, HelperText} from 'react-native-paper';
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

          <TextInput
            label="Title"
            value={title}
            onChangeText={setTitle}
            mode="outlined"
            style={styles.input}
            maxLength={100}
            disabled={isSubmitting}
            error={!!error && !title.trim()}
          />

          <TextInput
            label="Description (Optional)"
            value={description}
            onChangeText={setDescription}
            mode="outlined"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.descriptionInput]}
            maxLength={500}
            disabled={isSubmitting}
          />

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
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
    borderColor: '#6200ee',
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
});

export default AddEditTaskScreen;
