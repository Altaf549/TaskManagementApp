export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
};

export type AppStackParamList = {
  Home: undefined;
} & AuthStackParamList;

export type RootStackParamList = AppStackParamList;
