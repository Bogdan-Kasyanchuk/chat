import { FC } from 'react';

import type { IContactsList } from '@/interfaces';

import { ContactItem } from '@/components';

const ContactsList: FC<IContactsList> = ({ resultContacts, setIdActiveContact }) => {
  return (
    <ul>
      {resultContacts.map((el) => (
        <ContactItem key={el.id} el={el} setIdActiveContact={setIdActiveContact} />
      ))}
    </ul>
  );
};

export default ContactsList;
