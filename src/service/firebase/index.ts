import firebaseAuth from './firebaseAuth';
import firebaseConfig from './firebaseConfig';
import firebaseDB from './firebaseDB';
import { loginUserEmail, registerUserEmail } from './firebaseEmailAuth';
import firebaseGitHubAuth from './firebaseGitHubAuth';
import firebaseGoogleAuth from './firebaseGoogleAuth';
import firebaseInitApp from './firebaseInitApp';
import {
  checkUser,
  createMessage,
  createUser,
  deleteUser,
  updateReadMessage,
  updateStatusUser,
  updateUser,
} from './firebaseOperations';

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
  updateReadMessage,
  updateStatusUser,
  updateUser,
};
