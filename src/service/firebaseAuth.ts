import { getAuth } from 'firebase/auth';

import firebaseInitApp from '@/service/firebaseInitApp';

const auth = getAuth(firebaseInitApp);

export default auth;
