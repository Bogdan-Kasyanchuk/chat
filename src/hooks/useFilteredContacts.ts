import { useUser } from '@/hooks';

import type { IUser } from '@/interfaces';

const useFilteredContacts = (contacts: IUser[], value: string) => {
  const { id: idUser } = useUser();

  const normalizedContacts = contacts.filter((el) => {
    return el.id !== idUser;
  });

  const getFilterContacts = () => {
    return normalizedContacts.filter((el) =>
      el.name?.toLowerCase().includes(value.toLowerCase().trim()),
    );
  };

  const filteredContacts = value ? getFilterContacts() : normalizedContacts;

  return { filteredContacts };
};

export default useFilteredContacts;
