import type { IUseResultContacts } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactsListProps {
  contacts: IUseResultContacts[];
  setIdActiveContact: TSetIdActiveContact;
}
