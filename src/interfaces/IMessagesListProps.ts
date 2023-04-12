import type { IMessages, IUser } from '@/interfaces';

export default interface IMessagesListProps {
  messages: IMessages[];
  contact: IUser;
  idFirstNotReadMessage: string;
}
