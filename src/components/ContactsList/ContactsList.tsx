import { FC } from 'react';

import { List } from '@mantine/core';

// import useStyles from './ContactsList.styles';
import { ContactItem } from '@/components';

const ContactsList: FC<{ resultContacts: any }> = ({ resultContacts }) => {
  // const { classes } = useStyles();

  return (
    <List>
      {resultContacts.map((el: any) => (
        <ContactItem key={el.id} el={el} />
      ))}
    </List>
  );
};

export default ContactsList;
