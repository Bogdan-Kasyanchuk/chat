import type { IUseResultContacts } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactItemProps {
  contact: IUseResultContacts;
  setIdActiveContact: TSetIdActiveContact;
}
