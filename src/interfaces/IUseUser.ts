import type { Auth, User } from 'firebase/auth';

import type { IUser } from '@/interfaces';

export default interface IUseUser extends IUser {
  firebaseAuth: Auth;
  user: User | null | undefined;
  loading: boolean;
}
