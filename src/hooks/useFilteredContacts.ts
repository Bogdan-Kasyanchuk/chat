import { filteredDataByName } from '@/helpers';

import type { INormalizedContact } from '@/interfaces';

const useFilteredContacts = (contacts: INormalizedContact[], value: string) => {
  const filteredContacts = value ? filteredDataByName(contacts, value) : contacts;

  return { filteredContacts };
};

export default useFilteredContacts;
