import firebaseAuth from '@/service/firebase/firebaseAuth';
import firebaseConfig from '@/service/firebase/firebaseConfig';
import firebaseDB from '@/service/firebase/firebaseDB';
import { loginUserEmail, registerUserEmail } from '@/service/firebase/firebaseEmailAuth';
import firebaseGitHubAuth from '@/service/firebase/firebaseGitHubAuth';
import firebaseGoogleAuth from '@/service/firebase/firebaseGoogleAuth';
import firebaseInitApp from '@/service/firebase/firebaseInitApp';
import {
  checkUser,
  createMessage,
  createUser,
  deleteUser,
  updateStatusUser,
  updateUser,
} from '@/service/firebase/firebaseOperations';

export {
  firebaseAuth,
  firebaseConfig,
  firebaseDB,
  loginUserEmail,
  registerUserEmail,
  firebaseGitHubAuth,
  firebaseGoogleAuth,
  firebaseInitApp,
  checkUser,
  createMessage,
  createUser,
  deleteUser,
  updateStatusUser,
  updateUser,
};
