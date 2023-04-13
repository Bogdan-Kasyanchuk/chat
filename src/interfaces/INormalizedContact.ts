import type { IMessages, IUser } from '@/interfaces';

export default interface INormalizedContact extends IUser {
  messages: IMessages[];
  unreadCountMessages: number;
  lastMessageBody: string;
  lastMessageDate: string;
}
