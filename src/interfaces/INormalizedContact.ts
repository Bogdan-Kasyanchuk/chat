import type { IMessage, IUser } from '@/interfaces';

export default interface INormalizedContact extends IUser {
  messages: IMessage[];
  unreadCountMessages: number;
  lastMessageOwner: string;
  lastMessageBody: string;
  lastMessageDate: string;
}
