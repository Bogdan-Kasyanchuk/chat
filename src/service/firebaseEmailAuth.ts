import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

export const registerUserEmail = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password);
};

export const loginUserEmail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password);
};
