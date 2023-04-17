import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import firebaseAuth from '@/service/firebase/firebaseAuth';

import { showError } from '@/helpers';

import type { ICredential } from '@/interfaces';

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
