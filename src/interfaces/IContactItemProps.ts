import type { INormalizedContact } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactItemProps {
  contact: INormalizedContact;
  setIdActiveContact: TSetIdActiveContact;
}
