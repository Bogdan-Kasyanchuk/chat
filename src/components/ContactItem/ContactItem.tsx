import type { FC } from 'react';

import { Avatar, Box, Flex, Indicator, Text } from '@mantine/core';
import { useDidUpdate } from '@mantine/hooks';

import { useClassStatus } from '@/hooks';

import { getLocaleDate } from '@/helpers';

import useStyles from './ContactItem.styles';
import type IContactItemProps from './IContactItemProps';

const ContactItem: FC<IContactItemProps> = ({ contact, idActiveContact, setIdActiveContact }) => {
  const { classes: c } = useStyles();
  const { userStatus, setUserStatus } = useClassStatus(contact.status);

  useDidUpdate(() => {
    if (!contact.status) {
    }

    setUserStatus(contact.status);
  }, [contact.status]);

  const notmalizedDate = getLocaleDate(contact.lastMessageDate, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <li
      className={c.item}
      onClick={() => {
        setIdActiveContact(contact.idContact);
      }}
      style={{ backgroundColor: idActiveContact === contact.idContact ? '#f1f3f5' : '' }}
    >
      <Flex justify='space-between'>
        <Indicator
          inline
          size={20}
          offset={7}
          position='bottom-end'
          withBorder
          classNames={{ indicator: userStatus }}
        >
          <Avatar size={50} radius='xl' src={contact.avatar} alt={contact.name} />
        </Indicator>
        <Flex direction='column' justify='center' mx={12}>
          <Text lineClamp={1} component='p' fz={20} lh={1.5}>
            {contact.name}
          </Text>
          {contact.lastMessageBody && (
            <Text lineClamp={1} component='p' color='gray.6'>
              {contact.lastMessageBody}
            </Text>
          )}
        </Flex>
        <Box className={c.paramsBox}>
          {contact.lastMessageBody && (
            <Text component='time' display='block' color='gray.6'>
              {notmalizedDate}
            </Text>
          )}
          {!!contact.unreadCountMessages && (
            <Text component='span' className={c.quantity}>
              {contact.unreadCountMessages}
            </Text>
          )}
        </Box>
      </Flex>
    </li>
  );
};

export default ContactItem;
