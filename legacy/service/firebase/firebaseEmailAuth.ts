import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { tryCatch } from '@/middlewares';

import type { ICredential } from '@/interfaces';

import firebaseAuth from './firebaseAuth';

export const registerUserEmail = async ({ email, password }: ICredential) => {
  tryCatch(createUserWithEmailAndPassword(firebaseAuth, email, password));
};

export const loginUserEmail = async ({ email, password }: ICredential) => {
  tryCatch(signInWithEmailAndPassword(firebaseAuth, email, password));
};
