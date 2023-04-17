import type { INormalizedContact } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactsListProps {
  contacts: INormalizedContact[];
  setIdActiveContact: TSetIdActiveContact;
}
