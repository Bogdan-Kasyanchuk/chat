import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';

import { notifications } from '@mantine/notifications';

import auth from '@/service/firebaseAuth';

const gitHubProvider = new GithubAuthProvider();

export const userGitHubAuth = () => {
  signInWithPopup(auth, gitHubProvider)
    .then(() => {
      notifications.show({
        message: 'Login is successful!',
        color: 'green',
      });
    })
    .catch((error) => {
      notifications.show({
        message: `${error}`,
        color: 'red',
      });
    });
};
