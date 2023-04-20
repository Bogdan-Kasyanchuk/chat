import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { showError } from '@/lib';

import firebaseAuth from './firebaseAuth';

const googleProvider = new GoogleAuthProvider();

const firebaseGoogleAuth = () => {
  signInWithPopup(firebaseAuth, googleProvider).catch((error) => {
    showError(error);
  });
};

export default firebaseGoogleAuth;
