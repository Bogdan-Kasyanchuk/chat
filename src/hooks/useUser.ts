import { useAuthState } from 'react-firebase-hooks/auth';

import auth from '@/service/firebaseAuth';

import type { IUseUser } from '@/interfaces';

const useUser = (): IUseUser => {
  const [user, loading] = useAuthState(auth);

  const name: IUseUser['name'] = user?.displayName as string;
  const avatar: IUseUser['avatar'] = user?.photoURL as string;
  const id: IUseUser['id'] = user?.uid as string;
  const status: IUseUser['status'] = 'online';

  return { auth, user, loading, name, avatar, id, status };
};

export default useUser;
