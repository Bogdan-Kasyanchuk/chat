import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import auth from '@/service/firebaseAuth';

const gitHubProvider = new GithubAuthProvider();

export const userGitHubAuth = () => {
  signInWithPopup(auth, gitHubProvider);
};
