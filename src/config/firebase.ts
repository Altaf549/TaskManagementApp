import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { AppRegistry } from 'react-native';

// Firebase is automatically initialized when you import from @react-native-firebase
// No need to manually initialize it in React Native

// Check if Firebase is initialized
console.log('Firebase initialized:', !!auth().app);

export { auth, firestore };
