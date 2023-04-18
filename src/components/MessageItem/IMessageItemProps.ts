import type { IMessage, IUser } from '@/interfaces';

export default interface IMessageItemProps {
  message: IMessage;
  contact: IUser;
  idFirstNotReadMessage: string | undefined;
}
