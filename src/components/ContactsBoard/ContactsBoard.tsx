import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import { Avatar, Box, Indicator, Text, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import useFilter from '@/hooks/useFilter';

import getLocaleDate from '@/helpers/getLocaleDate';
import getTime from '@/helpers/getTime';

import contacts from '@/data/contacts.json';
import messages from '@/data/messages.json';

import useStyles from './ContactsBoard.styles';

const ContactsBoard: FC = () => {
  const [value, setValue] = useInputState('');
  const { filteredContacts } = useFilter(contacts, value);
  const { classes } = useStyles();

  const sortFilteredContacts = filteredContacts
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
        message: maxDateMessages,
      };
    })
    .sort((a: any, b: any) => getTime(b.message.date) - getTime(a.message.date));

  const lastMessagesDate = getLocaleDate(sortFilteredContacts.message?.date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Box w='35%' miw={360} className={classes.contactsBoard}>
      <Box bg='gray.2' p={20} className={classes.search}>
        <TextInput
          type='search'
          aria-label='Search chat'
          size='lg'
          placeholder='Search chat'
          iconWidth={40}
          icon={<IconSearch size={18} stroke={1.5} />}
          value={value}
          onChange={setValue}
        />
      </Box>
      <ul>
        {sortFilteredContacts.map((el: any) => (
          <li key={el.id}>
            <Indicator
              inline
              size={20}
              offset={5}
              position='bottom-end'
              withBorder
              classNames={{ indicator: 'bg-red-500' }}
            >
              <Avatar size={40} radius='xl' src={el.avatar} alt={el.name} />
            </Indicator>
            <Text>{el.name}</Text>
            <Text>{el.message.body}</Text>
            <Text>{lastMessagesDate}</Text>
            <Text>{el.notRead}</Text>
          </li>
        ))}
      </ul>
    </Box>
  );
};

export default ContactsBoard;
