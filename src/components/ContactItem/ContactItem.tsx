import type { FC } from 'react';

import { Avatar, Box, Flex, Indicator, Text } from '@mantine/core';

import { useClassStatus } from '@/hooks';

import type { IContactItemProps } from '@/interfaces';

import useStyles from './ContactItem.styles';

const ContactItem: FC<IContactItemProps> = ({ contact, setIdActiveContact }) => {
  const { classes: c } = useStyles();
  const { userStatus } = useClassStatus(contact.status);

  return (
    <li className={c.item} onClick={() => setIdActiveContact(contact.idContact)}>
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
          <Text lineClamp={1} component='p' fz={20} lh={1.3}>
            {contact.name}
          </Text>
          {contact.lastMessageBody && (
            <Text lineClamp={1} component='p' color='gray.6'>
              {contact.lastMessageBody}
            </Text>
          )}
        </Flex>
        <Box className={c.paramsBox}>
          <Text component='time' display='block' color='gray.6'>
            {contact.lastMessageDate}
          </Text>
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
