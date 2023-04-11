import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import firebaseAuth from '@/service/firebase/firebaseAuth';

import { showError } from '@/helpers';

const gitHubProvider = new GithubAuthProvider();

const firebaseGitHubAuth = () => {
  signInWithPopup(firebaseAuth, gitHubProvider).catch((error) => {
    showError(error);
  });
};

export default firebaseGitHubAuth;
