import { initializeApp } from 'firebase/app';

import firebaseConfig from './firebaseConfig';

const firebaseInitApp = initializeApp(firebaseConfig);

export default firebaseInitApp;
