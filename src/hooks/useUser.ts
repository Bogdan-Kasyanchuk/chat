import { useAuthState } from 'react-firebase-hooks/auth';

import { firebaseAuth } from '@/service/firebase';

import type { IUseUser } from '@/interfaces';

const useUser = (): IUseUser => {
  const [user, loading] = useAuthState(firebaseAuth);

  const name: IUseUser['name'] = user?.displayName as string;
  const avatar: IUseUser['avatar'] = user?.photoURL as string;
  const id: IUseUser['id'] = user?.uid as string;
  const status: IUseUser['status'] = 'online';

  return { firebaseAuth, user, loading, name, avatar, id, status };
};

export default useUser;
