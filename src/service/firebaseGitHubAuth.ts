import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

import showError from '@/helpers/showError';

const gitHubProvider = new GithubAuthProvider();

export const userGitHubAuth = () => {
  signInWithPopup(auth, gitHubProvider).catch((error) => {
    showError(error);
  });
};
