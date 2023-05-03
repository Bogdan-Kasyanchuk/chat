import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { tryCatch } from '@/middlewares';

import firebaseAuth from './firebaseAuth';

const googleProvider = new GoogleAuthProvider();

const firebaseGoogleAuth = async () => {
  tryCatch(signInWithPopup(firebaseAuth, googleProvider));
};

export default firebaseGoogleAuth;
