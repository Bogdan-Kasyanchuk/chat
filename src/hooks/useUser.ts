import { useAuthState } from 'react-firebase-hooks/auth';

import { firebaseAuth } from '@/service/firebase';

import { useData } from '@/hooks';

import type { IUser } from '@/interfaces';

import dataUser from '@/data/dataUser.json';

const useUser = () => {
  const [user, loading] = useAuthState(firebaseAuth);
  const { data: contacts } = useData('contacts');

  const name = (user?.displayName ?? dataUser.name) as IUser['name'];
  const avatar = (user?.photoURL ?? dataUser.image) as IUser['avatar'];
  const idUser = user?.uid as IUser['idContact'];
  const status = (contacts?.find((el) => el.idContact === idUser)?.status ??
    'online') as IUser['status'];

  return { user, loading, name, avatar, idUser, status };
};

export default useUser;
