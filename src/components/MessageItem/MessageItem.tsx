import type { FC } from 'react';

import { Avatar, Flex, Text } from '@mantine/core';

import { getLocaleDate } from '@/helpers';

import { IMessageItemProps } from '@/interfaces';

import useStyles from './MessageItem.styles';

const MessageItem: FC<IMessageItemProps> = ({ el, contact }) => {
  const { classes: c } = useStyles();

  return (
    <li className={c.item}>
      <Flex ml={el.idOwner === contact.id ? 0 : 'auto'} maw={500}>
        {el.idOwner === contact.id && (
          <Avatar mr={10} size={50} radius='xl' src={contact.avatar} alt={contact.name} />
        )}
        <Flex direction='column' align={el.idOwner === contact.id ? 'flex-start' : 'flex-end'}>
          <Text
            component='p'
            color={el.idOwner === contact.id ? 'white' : 'dark'}
            bg={el.idOwner === contact.id ? 'dark.5' : 'gray.2'}
            className={c.message}
          >
            {el.body}
          </Text>
          <Text component='time' fz={14} color='gray.6' px={15}>
            {getLocaleDate(el.date, {
              day: 'numeric',
              month: 'numeric',
              year: '2-digit',
              hour: 'numeric',
              minute: 'numeric',
            })}
          </Text>
        </Flex>
      </Flex>
    </li>
  );
};

export default MessageItem;
