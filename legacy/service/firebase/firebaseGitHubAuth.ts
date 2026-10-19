import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import { tryCatch } from '@/middlewares';

import firebaseAuth from './firebaseAuth';

const gitHubProvider = new GithubAuthProvider();

const firebaseGitHubAuth = async () => {
  tryCatch(signInWithPopup(firebaseAuth, gitHubProvider));
};

export default firebaseGitHubAuth;
