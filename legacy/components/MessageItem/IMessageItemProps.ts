import type { IContact, IMessage } from '@/interfaces';

export default interface IMessageItemProps {
  message: IMessage;
  contact: IContact;
  idFirstNotReadMessage: string | undefined;
}
