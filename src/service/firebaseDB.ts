import { getFirestore } from 'firebase/firestore';

import firebaseInitApp from '@/service/firebaseInitApp';

const db = getFirestore(firebaseInitApp);

export default db;
