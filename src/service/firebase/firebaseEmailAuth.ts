import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import firebaseAuth from '@/service/firebase/firebaseAuth';

import { showError } from '@/helpers';

import type { ICredential } from '@/interfaces';

export const registerUserEmail = (email: ICredential['email'], password: ICredential['email']) => {
  createUserWithEmailAndPassword(firebaseAuth, email, password).catch((error) => {
    showError(error);
  });
};

export const loginUserEmail = (email: ICredential['email'], password: ICredential['email']) => {
  signInWithEmailAndPassword(firebaseAuth, email, password).catch((error) => {
    showError(error);
  });
};
