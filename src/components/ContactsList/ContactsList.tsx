import { FC } from 'react';

import { ContactItem } from '@/components';

const ContactsList: FC<{ resultContacts: any }> = ({ resultContacts }) => {
  return (
    <ul>
      {resultContacts.map((el: any) => (
        <ContactItem key={el.id} el={el} />
      ))}
    </ul>
  );
};

export default ContactsList;
