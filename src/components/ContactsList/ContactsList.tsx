import type { FC } from 'react';

import { ContactItem } from '@/components';

import type { IContactsListProps } from '@/interfaces';

const ContactsList: FC<IContactsListProps> = ({ resultContacts, setIdActiveContact }) => {
  return (
    <ul>
      {resultContacts.map((el) => (
        <ContactItem key={el.id} el={el} setIdActiveContact={setIdActiveContact} />
      ))}
    </ul>
  );
};

export default ContactsList;
