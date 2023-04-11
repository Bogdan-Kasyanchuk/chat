import type { IUseResultContacts } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactsListProps {
  resultContacts: IUseResultContacts[];
  setIdActiveContact: TSetIdActiveContact;
}
