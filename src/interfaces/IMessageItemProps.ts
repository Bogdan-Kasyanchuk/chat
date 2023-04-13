import type { IMessages, IUser } from '@/interfaces';

export default interface IMessageItemProps {
  message: IMessages;
  contact: IUser;
  idFirstNotReadMessage: string | undefined;
}
