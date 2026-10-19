import type { FC } from 'react';

import { Avatar, Flex, Indicator, Text, useMantineTheme } from '@mantine/core';
import { useDidUpdate } from '@mantine/hooks';

import { IconChecks } from '@tabler/icons-react';

import { useClassStatus } from '@/hooks';

import { getLocaleDate } from '@/helpers';

import useStyles from './ContactItem.styles';
import type IContactItemProps from './IContactItemProps';

const ContactItem: FC<IContactItemProps> = ({ contact, idActiveContact, setIdActiveContact }) => {
  const theme = useMantineTheme();
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
      style={{ backgroundColor: idActiveContact === contact.idContact ? theme.colors.gray[2] : '' }}
    >
      <Flex justify='space-between'>
        <Indicator
          inline
          size={16}
          offset={8}
          position='bottom-end'
          withBorder
          classNames={{ indicator: userStatus }}
        >
          <Avatar size={48} radius='xl' src={contact.avatar} alt={contact.name} />
        </Indicator>
        <Flex direction='column' justify='center' mx={12}>
          <Text lineClamp={1} component='p' fz={18} lh={1.4} fw={500}>
            {contact.name}
          </Text>
          {contact.lastMessageBody && (
            <Text lineClamp={1} component='p' color='gray.6' lh={1.4}>
              {contact.lastMessageBody}
            </Text>
          )}
        </Flex>
        <Flex direction='column' justify='space-between' align='end' className={c.paramsBox}>
          {contact.lastMessageBody && (
            <Text component='time' display='block' color='gray.6'>
              {notmalizedDate}
            </Text>
          )}
          {!!contact.unreadCountMessages ? (
            <Text component='span' className={c.quantity}>
              {contact.unreadCountMessages}
            </Text>
          ) : (
            <IconChecks
              size={20}
              stroke={1.5}
              color={true ? theme.colors.red[7] : theme.colors.gray[6]}
            />
          )}
        </Flex>
      </Flex>
    </li>
  );
};

export default ContactItem;
