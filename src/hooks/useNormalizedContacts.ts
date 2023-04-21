import { collection, orderBy, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseDB } from '@/service/firebase';

import { useUser } from '@/hooks';

import type { IContact } from '@/interfaces';

const useNormalizedContacts = () => {
  const { idUser } = useUser();
  console.log(idUser);

  const queryMessages = query(
    collection(firebaseDB, 'contacts'),
    where('status', '==', 'offline'),
    // orderBy('name', 'asc'),
  );
  const [contacts] = useCollectionData(queryMessages, { initialValue: [] });
  const [normalizedContacts, setNormalizedContacts] = useState<IContact[]>([]);

  console.log('--contacts--', contacts);

  useEffect(() => {
    if (!contacts) {
      return;
    }

    setNormalizedContacts(
      contacts.filter((el) => {
        return el.idContact !== idUser;
      }) as IContact[],
    );
  }, [contacts]);

  return { normalizedContacts };
};

export default useNormalizedContacts;
