import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

const googleProvider = new GoogleAuthProvider();

export const userGoogleAuth = () => {
  signInWithPopup(auth, googleProvider);
};
