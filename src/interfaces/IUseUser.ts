import { Auth, User } from 'firebase/auth';

export interface IUseUser {
  auth: Auth;
  user: User | null | undefined;
  displayName: string;
  photoURL: string;
}
