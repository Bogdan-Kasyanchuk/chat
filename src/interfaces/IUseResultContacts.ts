import type { IUser } from '@/interfaces';

export interface IUseResultContacts extends IUser {
  notRead: number;
  message: string;
  messageDate: string;
}
