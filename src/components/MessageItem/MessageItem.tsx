import { forwardRef } from 'react';

import { Avatar, Flex, Text } from '@mantine/core';

import { getLocaleDate } from '@/helpers';

import type { IMessageItemProps } from '@/interfaces';

import useStyles from './MessageItem.styles';

const MessageItem = forwardRef<HTMLLIElement, IMessageItemProps>(
  ({ message, contact, idFirstNotReadMessage }, ref) => {
    const { classes: c } = useStyles();
    const checkId = message.idOwner === contact.id;

    return (
      <>
        {message.id === idFirstNotReadMessage && (
          <li ref={ref}>
            <Text component='p' color='white' bg='dark.1' align='center'>
              Unread messages
            </Text>
          </li>
        )}
        <li className={c.item}>
          <Flex ml={checkId ? 0 : 'auto'} maw={500}>
            {checkId && (
              <Avatar mr={10} size={50} radius='xl' src={contact.avatar} alt={contact.name} />
            )}
            <Flex direction='column' align={checkId ? 'flex-start' : 'flex-end'}>
              <Text
                component='p'
                color={checkId ? 'white' : 'dark.5'}
                bg={checkId ? 'dark.5' : 'gray.2'}
                className={c.message}
              >
                {message.body}
              </Text>
              <Text component='time' fz={14} color='gray.6' px={15}>
                {getLocaleDate(message.date, {
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
      </>
    );
  },
);

export default MessageItem;
