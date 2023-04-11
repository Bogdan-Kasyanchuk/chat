import { getFirestore } from 'firebase/firestore';

import firebaseInitApp from '@/service/firebase/firebaseInitApp';

const firebaseDB = getFirestore(firebaseInitApp);

export default firebaseDB;
