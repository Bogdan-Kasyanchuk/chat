import { getFirestore } from 'firebase/firestore';

import firebaseInitApp from './firebaseInitApp';

const firebaseDB = getFirestore(firebaseInitApp);

export default firebaseDB;
