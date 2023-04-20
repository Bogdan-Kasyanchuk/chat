// import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// import { useCollectionData } from 'react-firebase-hooks/firestore';
// import { firebaseDB } from '@/service/firebase';
import { useUser } from '@/hooks';

import type { IContact } from '@/interfaces';

import contacts from '@/data/contacts.json';

const useNormalizedContacts = () => {
  const { idUser } = useUser();
  // const [contacts] = useCollectionData(collection(firebaseDB, 'contacts'));
  const [normalizedContacts, setNormalizedContacts] = useState<IContact[]>([]);

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
