import { forwardRef, memo } from 'react';

import { Avatar, Flex, Text, Transition } from '@mantine/core';

import { getLocaleDate } from '@/helpers';

import type IMessageItemProps from './IMessageItemProps';
import useStyles from './MessageItem.styles';

const MessageItem = forwardRef<HTMLDivElement, IMessageItemProps>(
  ({ message, contact, idFirstNotReadMessage }, ref) => {
    const { classes: c } = useStyles();

    const checkId = message.idOwner === contact.idContact;
    const normalizedDate = getLocaleDate(message.date, {
      day: 'numeric',
      month: 'numeric',
      year: '2-digit',
      hour: 'numeric',
      minute: 'numeric',
    });

    return (
      <li className={c.item}>
        {message.id === idFirstNotReadMessage && <div ref={ref}></div>}
        <Transition mounted={message.id === idFirstNotReadMessage} transition='fade' duration={150}>
          {(styles) => (
            <Text
              component='p'
              color='white'
              bg='dark.1'
              align='center'
              pos='absolute'
              top={-15}
              left={0}
              right={0}
              style={{ ...styles }}
            >
              Unread messages
            </Text>
          )}
        </Transition>
        <Flex ml={checkId ? 0 : 'auto'} maw={500} justify={checkId ? 'flex-start' : 'flex-end'}>
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
              {normalizedDate}
            </Text>
          </Flex>
        </Flex>
      </li>
    );
  },
);

export default memo(MessageItem);
