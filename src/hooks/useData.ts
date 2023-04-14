import { collection } from 'firebase/firestore';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { firebaseDB } from '@/service/firebase';

const useData = (value: string) => {
  const [data] = useCollectionData(collection(firebaseDB, value));
  return { data };
};

export default useData;
