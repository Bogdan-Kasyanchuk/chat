import type { ITransformedContact } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IContactItemProps {
  contact: ITransformedContact;
  idActiveContact: string;
  setIdActiveContact: TSetIdActiveContact;
}
