import { FC } from 'react';

import { ContactItem } from '@/components';

const ContactsList: FC<{ resultContacts: any; setIdActiveContact: any }> = ({
  resultContacts,
  setIdActiveContact,
}) => {
  return (
    <ul>
      {resultContacts.map((el: any) => (
        <ContactItem key={el.id} el={el} setIdActiveContact={setIdActiveContact} />
      ))}
    </ul>
  );
};

export default ContactsList;
