export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  TaskList: undefined;
  AddEditTask: { taskId?: string } | undefined;
} & AuthStackParamList;

export type RootStackParamList = AppStackParamList;
