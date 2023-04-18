import type { IMessage, INormalizedContact } from '@/interfaces';

export default interface IMessagesListProps {
  messages: IMessage[];
  contact: INormalizedContact;
  idFirstNotReadMessage: string | undefined;
}
