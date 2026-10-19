import type { FC } from 'react';
import { useRef, useState } from 'react';

import { Box, Flex, ScrollArea, Text, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';

import { IconSearch } from '@tabler/icons-react';

import { useButtonScroll, useFilteredContacts } from '@/hooks';

import { ButtonScroll, ContactsList, UserMenu } from '@/components';

import useStyles from './ContactsBoard.styles';
import type IContactsBoardProps from './IContactsBoardProps';

const ContactsBoard: FC<IContactsBoardProps> = ({
  transformedContacts,
  idActiveContact,
  setIdActiveContact,
}) => {
  const [value, setValue] = useInputState('');
  const { filteredContacts } = useFilteredContacts(transformedContacts, value);
  const viewport = useRef<HTMLDivElement>(null);
  const [scrollPosition, onScrollPositionChange] = useState({ x: 0, y: 0 });
  const { isButtonShow } = useButtonScroll(viewport, scrollPosition.y, 'top');
  const { classes: c, cx } = useStyles();

  const scrollToTop = () => viewport.current?.scrollTo({ top: 0 });

  return (
    <Flex
      sx={{ flexShrink: 0 }}
      direction='column'
      gap={{
        base: 10,
        md: 20,
      }}
      miw={340}
      w={{
        base: '100%',
        md: '35%',
      }}
    >
      <UserMenu />
      <Box sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}>
        <TextInput
          type='search'
          size='lg'
          placeholder='Search chat'
          iconWidth={50}
          icon={<IconSearch size={24} stroke={1.5} />}
          value={value}
          onChange={setValue}
        />
      </Box>
      <Box
        bg='white'
        h={{
          base: 'calc(100% - 152px)',
          md: 'calc(100% - 172px)',
        }}
        sx={{ boxShadow: '0px 4px 5px 2px rgba(18, 18, 18, 0.35)' }}
      >
        <Text
          component='p'
          p={15}
          fz={18}
          fw={600}
          lh={1}
          sx={{ borderBottom: '2px solid #2C2E33' }}
        >
          PEOPLE
        </Text>
        <ScrollArea
          h='calc(100% - 50px)'
          viewportRef={viewport}
          onScrollPositionChange={onScrollPositionChange}
        >
          <ContactsList
            contacts={filteredContacts}
            idActiveContact={idActiveContact}
            setIdActiveContact={setIdActiveContact}
          />
          <ButtonScroll isShow={isButtonShow} scrollTo={scrollToTop} buttonDirection='top' />
        </ScrollArea>
      </Box>
    </Flex>
  );
};

export default ContactsBoard;
