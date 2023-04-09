import { TStatusUser } from '@/types';

export interface IUser {
  id: string | undefined;
  name: string | null | undefined;
  avatar: string | null | undefined;
  status: TStatusUser;
}
