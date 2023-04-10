import type { IUseResultContacts } from '@/interfaces';

import { TSetIdActiveContact } from '@/types';

export interface IContactsList {
  resultContacts: IUseResultContacts[];
  setIdActiveContact: TSetIdActiveContact;
}
