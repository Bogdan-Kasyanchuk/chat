import { TStatusUser } from '@/types';

export interface IUser {
  id: string;
  name: string;
  avatar: string;
  status: TStatusUser;
}
