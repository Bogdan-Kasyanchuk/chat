import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

import showError from '@/helpers/showError';

export const registerUserEmail = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password).catch((error) => {
    showError(error);
  });
};

export const loginUserEmail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password).catch((error) => {
    showError(error);
  });
};
