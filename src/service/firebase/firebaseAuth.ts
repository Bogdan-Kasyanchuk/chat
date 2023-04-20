import { getAuth } from 'firebase/auth';

import firebaseInitApp from './firebaseInitApp';

const firebaseAuth = getAuth(firebaseInitApp);

export default firebaseAuth;
