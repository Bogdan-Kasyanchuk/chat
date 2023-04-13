import type { FC } from 'react';

import { Box, ScrollArea, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import { IconSearch } from '@tabler/icons-react';

import { useFilteredContacts, useNormalizedContacts, useStylesGlobal } from '@/hooks';

import { ContactsList } from '@/components';

import type { IContactsBoardProps } from '@/interfaces';

import useStyles from './ContactsBoard.styles';

const ContactsBoard: FC<IContactsBoardProps> = ({ setIdActiveContact }) => {
  const [value, setValue] = useInputState('');
  const { normalizedContacts } = useNormalizedContacts();
  const { filteredContacts } = useFilteredContacts(normalizedContacts, value);
  const { classes: cG } = useStylesGlobal();
  const { classes: c, cx } = useStyles();

  return (
    <Box className={cx(c.boardBox, cG.borderR)}>
      <Box bg='gray.2' p={15} className={cG.borderB}>
        <TextInput
          type='search'
          radius={16}
          size='lg'
          placeholder='Search chat'
          iconWidth={40}
          icon={<IconSearch size={18} stroke={1.5} />}
          value={value}
          onChange={setValue}
        />
      </Box>
      <ScrollArea h='calc(100% - 81px)'>
        <ContactsList contacts={filteredContacts} setIdActiveContact={setIdActiveContact} />
      </ScrollArea>
    </Box>
  );
};

export default ContactsBoard;
