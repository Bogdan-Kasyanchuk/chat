import type { IMessages, IUser } from '@/interfaces';

export default interface IMessageItemProps {
  el: IMessages;
  contact: IUser;
  idFirstNotReadMessage: string;
}
