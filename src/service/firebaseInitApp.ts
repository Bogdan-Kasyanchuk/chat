import { initializeApp } from 'firebase/app';

import firebaseConfig from '@/service/firebaseConfig';

const firebaseInitApp = initializeApp(firebaseConfig);

export default firebaseInitApp;
