import { Auth, User } from 'firebase/auth';

import type { IUser } from '@/interfaces';

export interface IUseUser extends IUser {
  auth: Auth;
  user: User | null | undefined;
  loading: boolean;
}
