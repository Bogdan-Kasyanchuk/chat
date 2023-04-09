import type { IUser } from '@/interfaces';

const useFilter = (contacts: IUser[], value: string) => {
  const getFilterContacts = () => {
    return contacts.filter((el) => el.name?.toLowerCase().includes(value.toLowerCase().trim()));
  };

  const filteredContacts = value ? getFilterContacts() : contacts;

  return { filteredContacts };
};

export default useFilter;
