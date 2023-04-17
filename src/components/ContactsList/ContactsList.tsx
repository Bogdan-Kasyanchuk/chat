import type { FC } from 'react';

import { ContactItem } from '@/components';

import type { IContactsListProps } from '@/interfaces';

const ContactsList: FC<IContactsListProps> = ({ contacts, setIdActiveContact }) => {
  return (
    <ul>
      {contacts.map((contact) => (
        <ContactItem
          key={contact.idContact}
          contact={contact}
          setIdActiveContact={setIdActiveContact}
        />
      ))}
    </ul>
  );
};

export default ContactsList;
