import { getAuth } from 'firebase/auth';

import firebaseInitApp from '@/service/firebase/firebaseInitApp';

const firebaseAuth = getAuth(firebaseInitApp);

export default firebaseAuth;
