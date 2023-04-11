import firebaseAuth from '@/service/firebase/firebaseAuth';
import firebaseConfig from '@/service/firebase/firebaseConfig';
import firebaseDB from '@/service/firebase/firebaseDB';
import { loginUserEmail, registerUserEmail } from '@/service/firebase/firebaseEmailAuth';
import firebaseGitHubAuth from '@/service/firebase/firebaseGitHubAuth';
import firebaseGoogleAuth from '@/service/firebase/firebaseGoogleAuth';
import firebaseInitApp from '@/service/firebase/firebaseInitApp';

export {
  firebaseAuth,
  firebaseConfig,
  firebaseDB,
  loginUserEmail,
  registerUserEmail,
  firebaseGitHubAuth,
  firebaseGoogleAuth,
  firebaseInitApp,
};
