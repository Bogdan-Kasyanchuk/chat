import { useAuthState } from 'react-firebase-hooks/auth';

import { firebaseAuth } from '@/service/firebase';

import type { IUser } from '@/interfaces';

import contacts from '@/data/contacts.json';

const useUser = () => {
  const [user, loading] = useAuthState(firebaseAuth);

  const name = user?.displayName as IUser['name'];
  const avatar = user?.photoURL as IUser['avatar'];
  const id = user?.uid as IUser['id'];
  const status = contacts.find((el) => el.id === id)?.status as IUser['status'];

  return { firebaseAuth, user, loading, name, avatar, id, status };
};

export default useUser;
