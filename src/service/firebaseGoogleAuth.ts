import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

import { notifications } from '@mantine/notifications';

import auth from '@/service/firebaseAuth';

const googleProvider = new GoogleAuthProvider();

export const userGoogleAuth = () => {
  signInWithPopup(auth, googleProvider)
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
