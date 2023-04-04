import { FC } from 'react';

// import useStyles from './ContactsList.styles';
import { ContactItem } from '@/components';

const ContactsList: FC<{ resultContacts: any }> = ({ resultContacts }) => {
  // const { classes } = useStyles();

  return (
    <ul>
      {resultContacts.map((el: any) => (
        <ContactItem key={el.id} el={el} />
      ))}
    </ul>
  );
};

export default ContactsList;
