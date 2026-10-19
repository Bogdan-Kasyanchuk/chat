import type { ITransformedContact } from '@/interfaces';

import type { TSetIdActiveContact } from '@/types';

export default interface IMessagesBoardProps {
  transformedContacts: ITransformedContact[];
  idActiveContact: string;
  setIdActiveContact: TSetIdActiveContact;
}
