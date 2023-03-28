import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import useFilter from '@/hooks/useFilter';
import useStylesGlobal from '@/hooks/useStylesGlobal';

import getLocaleDate from '@/helpers/getLocaleDate';
import getTime from '@/helpers/getTime';

import contacts from '@/data/contacts.json';
import messages from '@/data/messages.json';

// import useStyles from './ContactsBoard.styles';
import { ContactsList } from '@/components';

const ContactsBoard: FC = () => {
  const [value, setValue] = useInputState('');
  const { filteredContacts } = useFilter(contacts, value);
  const { classes: classesGlobal } = useStylesGlobal();
  // const { classes } = useStyles();

  const resultContacts = filteredContacts
    .map((elem: any) => {
      const arrayMessages = messages.filter((el) => el.idOwner === elem.id);
      const arrayDateMessages = arrayMessages.map((el) => getTime(el.date));
      const arrayNotReadMessages = arrayMessages.filter((el) => el.read === false);
      const maxDateMessages = arrayMessages.find(
        (el) => getTime(el.date) === Math.max(...arrayDateMessages),
      );
      return {
        id: elem.id,
        name: elem.name,
        avatar: elem.avatar,
        status: elem.status,
        notRead: arrayNotReadMessages.length,
        message: maxDateMessages?.body,
        messageDate: getLocaleDate(maxDateMessages?.date as string, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      };
    })
    .sort((a: any, b: any) => getTime(b.messageDate) - getTime(a.messageDate));

  return (
    <Box w='35%' miw={360} className={classesGlobal.borderR}>
      <Box bg='gray.2' p={20} className={classesGlobal.borderB}>
        <TextInput
          type='search'
          size='lg'
          placeholder='Search chat'
          iconWidth={40}
          icon={<IconSearch size={18} stroke={1.5} />}
          value={value}
          onChange={setValue}
        />
      </Box>
      <ContactsList resultContacts={resultContacts} />
    </Box>
  );
};

export default ContactsBoard;
