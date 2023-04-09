import { IconSearch } from '@tabler/icons-react';
import { FC } from 'react';

import { Box, ScrollArea, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import useFilter from '@/hooks/useFilter';
import useResultContacts from '@/hooks/useResultContacts';
import useStylesGlobal from '@/hooks/useStylesGlobal';
import useUser from '@/hooks/useUser';

import type { IUser } from '@/interfaces';

import contacts from '@/data/contacts.json';
import messages from '@/data/messages.json';

import useStyles from './ContactsBoard.styles';
import { ContactsList } from '@/components';

const ContactsBoard: FC<{ setIdActiveContact: any }> = ({ setIdActiveContact }) => {
  const { id } = useUser();
  const [value, setValue] = useInputState('');
  const { filteredContacts } = useFilter(contacts.filter((el) => el.id !== id) as IUser[], value);
  const { resultContacts } = useResultContacts(filteredContacts, messages);
  const { classes: cG } = useStylesGlobal();
  const { classes: c, cx } = useStyles();

  return (
    <Box className={cx(c.boardBox, cG.borderR)}>
      <Box bg='gray.2' p={15} className={cG.borderB}>
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
      <ScrollArea h='calc(100% - 81px)'>
        <ContactsList resultContacts={resultContacts} setIdActiveContact={setIdActiveContact} />
      </ScrollArea>
    </Box>
  );
};

export default ContactsBoard;
