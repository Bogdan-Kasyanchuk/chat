import type { FC } from 'react';

import { ContactItem } from '@/components';

import type IContactsListProps from './IContactsListProps';

const ContactsList: FC<IContactsListProps> = ({
  contacts,
  idActiveContact,
  setIdActiveContact,
}) => {
  return (
    <ul>
      {contacts.map((contact) => (
        <ContactItem
          key={contact.idContact}
          contact={contact}
          idActiveContact={idActiveContact}
          setIdActiveContact={setIdActiveContact}
        />
      ))}
    </ul>
  );
};

export default ContactsList;
