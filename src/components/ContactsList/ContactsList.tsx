import { FC } from 'react';

import { List } from '@mantine/core';

import useStyles from './ContactsList.styles';
import { ContactsItem } from '@/components';

const ContactsList: FC<{ resultContacts: any }> = ({ resultContacts }) => {
  const { classes } = useStyles();

  return (
    <List>
      {resultContacts.map((el: any) => (
        <ContactsItem key={el.id} el={el} />
      ))}
    </List>
  );
};

export default ContactsList;
