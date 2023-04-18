import type { IMessage, IUser } from '@/interfaces';

export default interface INormalizedContact extends IUser {
  messages: IMessage[];
  unreadCountMessages: number;
  lastMessageBody: string;
  lastMessageDate: string;
}
