import type { IMessages, INormalizedContact } from '@/interfaces';

export default interface IMessagesListProps {
  messages: IMessages[];
  contact: INormalizedContact;
  idFirstNotReadMessage: string | undefined;
}
