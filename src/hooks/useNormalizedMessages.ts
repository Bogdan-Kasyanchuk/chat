import { collection } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseDB } from '@/service/firebase';

import { getTime } from '@/helpers';

import type { IMessage } from '@/interfaces';

// import messages from '@/data/messages.json';

const useNormalizedMessages = () => {
  const [messages] = useCollectionData(collection(firebaseDB, 'messages'), { initialValue: [] });

  const normalizedMessages = messages?.sort(
    (a, b) => getTime(a.date) - getTime(b.date),
  ) as IMessage[];

  return { normalizedMessages };
};

export default useNormalizedMessages;
