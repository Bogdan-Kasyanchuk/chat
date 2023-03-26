const useFilter = (contacts: any, value: string) => {
  const getFilterContacts = () => {
    return contacts.filter((el: any) => el.name.toLowerCase().includes(value.toLowerCase().trim()));
  };

  const filteredContacts = value ? getFilterContacts() : contacts;

  return { filteredContacts };
};

export default useFilter;
