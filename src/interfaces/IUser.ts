import type { TStatusUser } from '@/types';

export default interface IUser {
  idContact: string;
  name: string;
  avatar: string;
  status: TStatusUser;
}
