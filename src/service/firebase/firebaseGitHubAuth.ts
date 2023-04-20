import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import { showError } from '@/lib';

import firebaseAuth from './firebaseAuth';

const gitHubProvider = new GithubAuthProvider();

const firebaseGitHubAuth = () => {
  signInWithPopup(firebaseAuth, gitHubProvider).catch((error) => {
    showError(error);
  });
};

export default firebaseGitHubAuth;
