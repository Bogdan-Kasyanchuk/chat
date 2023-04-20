import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { showError } from '@/lib';

import type { ICredential } from '@/interfaces';

import firebaseAuth from './firebaseAuth';

export const registerUserEmail = ({ email, password }: ICredential) => {
  createUserWithEmailAndPassword(firebaseAuth, email, password).catch((error) => {
    showError(error);
  });
};

export const loginUserEmail = ({ email, password }: ICredential) => {
  signInWithEmailAndPassword(firebaseAuth, email, password).catch((error) => {
    showError(error);
  });
};
