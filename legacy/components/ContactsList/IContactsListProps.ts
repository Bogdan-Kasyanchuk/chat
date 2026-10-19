import type { ITransformedContact } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactsListProps {
  contacts: ITransformedContact[];
  idActiveContact: string;
  setIdActiveContact: TSetIdActiveContact;
}
