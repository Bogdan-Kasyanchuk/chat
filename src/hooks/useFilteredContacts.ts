import type { INormalizedContact } from '@/interfaces';

const useFilteredContacts = (contacts: INormalizedContact[], value: string) => {
  const filteredContacts = value
    ? contacts.filter((el) => el.name?.toLowerCase().includes(value.toLowerCase().trim()))
    : contacts;

  return { filteredContacts };
};

export default useFilteredContacts;
