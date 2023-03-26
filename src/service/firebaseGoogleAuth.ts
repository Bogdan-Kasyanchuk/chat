import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

import showError from '@/helpers/showError';

const googleProvider = new GoogleAuthProvider();

export const userGoogleAuth = () => {
  signInWithPopup(auth, googleProvider).catch((error) => {
    showError(error);
  });
};
