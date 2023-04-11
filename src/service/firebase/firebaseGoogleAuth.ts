import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import firebaseAuth from '@/service/firebase/firebaseAuth';

import { showError } from '@/helpers';

const googleProvider = new GoogleAuthProvider();

const firebaseGoogleAuth = () => {
  signInWithPopup(firebaseAuth, googleProvider).catch((error) => {
    showError(error);
  });
};

export default firebaseGoogleAuth;
