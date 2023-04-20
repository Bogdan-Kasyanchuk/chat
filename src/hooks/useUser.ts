import { collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseAuth, firebaseDB } from '@/service/firebase';

import type { IContact } from '@/interfaces';

import dataUser from '@/data/dataUser.json';

const useUser = () => {
  const [user, loading] = useAuthState(firebaseAuth);
  const [contacts] = useCollectionData(collection(firebaseDB, 'contacts'));

  const name = user?.displayName ?? dataUser.name;
  const avatar = user?.photoURL ?? dataUser.image;
  const idUser = user?.uid as IContact['idContact'];
  const status = (contacts?.find((el) => el.idContact === idUser)?.status ??
    'online') as IContact['status'];

  return { user, loading, name, avatar, idUser, status };
};

export default useUser;
