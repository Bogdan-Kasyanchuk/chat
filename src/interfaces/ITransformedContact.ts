import type { IContact, IMessage } from '@/interfaces';

export default interface ITransformedContact extends IContact {
  messages: IMessage[];
  unreadCountMessages: number;
  lastMessageBody: string;
  lastMessageDate: string;
}
