import type { IMessage, ITransformedContact } from '@/interfaces';

export default interface IMessagesListProps {
  messages: IMessage[];
  contact: ITransformedContact;
  idFirstNotReadMessage: string | undefined;
}
