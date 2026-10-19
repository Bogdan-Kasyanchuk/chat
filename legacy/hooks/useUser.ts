import { collection } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseAuth, firebaseDB } from '@/service/firebase';

import { COLECTIONS, STATUS } from '@/helpers';

import dataUser from '@/data/dataUser.json';

const useUser = () => {
  const [user, loading] = useAuthState(firebaseAuth);
  const [contacts] = useCollectionData(collection(firebaseDB, COLECTIONS.CONTACTS));

  const name = user?.displayName ?? dataUser.name;
  const avatar = user?.photoURL ?? dataUser.image;
  const idUser = user?.uid as string;
  const status = contacts?.find((el) => el.idContact === idUser)?.status ?? STATUS.ONLINE;

  return { user, loading, name, avatar, idUser, status };
};

export default useUser;
