import type { TStatusUser } from '@/types';

export default interface IUser {
  id: string;
  name: string;
  avatar: string;
  status: TStatusUser;
}
