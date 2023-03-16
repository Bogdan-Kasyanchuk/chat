import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';

import firebaseInitApp from '@/service/firebaseInitApp';

const provider = new GoogleAuthProvider();
export const auth = getAuth(firebaseInitApp);

export const userAuth = () => {
  signInWithPopup(auth, provider);
};
