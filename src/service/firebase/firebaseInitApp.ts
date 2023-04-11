import { initializeApp } from 'firebase/app';

import firebaseConfig from '@/service/firebase/firebaseConfig';

const firebaseInitApp = initializeApp(firebaseConfig);

export default firebaseInitApp;
