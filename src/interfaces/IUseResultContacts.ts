import type { IUser } from '@/interfaces';

export default interface IUseResultContacts extends IUser {
  notRead: number;
  message: string;
  messageDate: string;
}
