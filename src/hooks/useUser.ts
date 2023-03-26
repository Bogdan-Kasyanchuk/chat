import { useAuthState } from 'react-firebase-hooks/auth';

import auth from '@/service/firebaseAuth';

import type { IUseUser } from '@/interfaces';

const useUser = (): IUseUser => {
  const [user] = useAuthState(auth);

  const displayName: IUseUser['displayName'] = user?.displayName as string;
  const photoURL: IUseUser['photoURL'] = user?.photoURL as string;

  return { auth, user, displayName, photoURL };
};

export default useUser;
