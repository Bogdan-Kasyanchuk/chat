import type { TStatusUser } from '@/types';

export default interface IContact {
  idContact: string;
  name: string;
  avatar: string;
  status: TStatusUser;
}
