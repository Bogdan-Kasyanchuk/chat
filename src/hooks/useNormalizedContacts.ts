import { collection } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseDB } from '@/service/firebase';

import type { IContact } from '@/interfaces';

// import contacts from '@/data/contacts.json';

const useNormalizedContacts = (idUser: string) => {
  const [contacts] = useCollectionData(collection(firebaseDB, 'contacts'), { initialValue: [] });

  const normalizedContacts = contacts?.filter((el) => {
    return el.idContact !== idUser;
  }) as IContact[];

  return { normalizedContacts };
};

export default useNormalizedContacts;
