import { collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseDB } from '@/service/firebase';

import { getTime } from '@/helpers';

import type { IMessage } from '@/interfaces';

// import messages from '@/data/messages.json';

const useNormalizedMessages = () => {
  const [messages] = useCollectionData(collection(firebaseDB, 'messages'));
  const [normalizedMessages, setNormalizedMessages] = useState<IMessage[]>([]);

  console.log('useNormalizedMessages');

  useEffect(() => {
    if (!messages) {
      return;
    }

    setNormalizedMessages(messages.sort((a, b) => getTime(a.date) - getTime(b.date)) as IMessage[]);
  }, [messages]);

  return { normalizedMessages };
};

export default useNormalizedMessages;
