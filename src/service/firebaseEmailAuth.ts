import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

import { notifications } from '@mantine/notifications';

import auth from '@/service/firebaseAuth';

export const registerUserEmail = (email: string, password: string) => {
  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      notifications.show({
        message: 'Registration is successful!',
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

export const loginUserEmail = (email: string, password: string) => {
  signInWithEmailAndPassword(auth, email, password)
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
