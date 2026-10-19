import { forwardRef, memo } from 'react';

import { Avatar, Flex, Group, Text, Transition, useMantineTheme } from '@mantine/core';

import { IconChecks } from '@tabler/icons-react';

import { getLocaleDate } from '@/helpers';

import type IMessageItemProps from './IMessageItemProps';
import useStyles from './MessageItem.styles';

const MessageItem = forwardRef<HTMLDivElement, IMessageItemProps>(
  ({ message, contact, idFirstNotReadMessage }, ref) => {
    const theme = useMantineTheme();
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
              top={-12}
              left={0}
              right={0}
              style={{ ...styles }}
            >
              Unread messages
            </Text>
          )}
        </Transition>
        <Flex ml={checkId ? 0 : 'auto'} maw={400} justify={checkId ? 'flex-start' : 'flex-end'}>
          {checkId && (
            <Avatar mr={10} size={40} radius='xl' src={contact.avatar} alt={contact.name} />
          )}
          <Flex
            bg={checkId ? 'gray.2' : 'dark.5'}
            py={5}
            px={10}
            direction='column'
            align={checkId ? 'flex-start' : 'flex-end'}
          >
            <Text component='p' mb={5} fz={18} lh={1.3} color={checkId ? 'dark.5' : 'white'}>
              {message.body}
            </Text>
            <Group spacing={5} ml='auto'>
              <Text component='time' fz={11} color='gray.6'>
                {normalizedDate}
              </Text>
              {!checkId && (
                <IconChecks
                  size={12}
                  stroke={1.5}
                  color={true ? theme.colors.red[7] : theme.colors.gray[6]}
                />
              )}
            </Group>
          </Flex>
        </Flex>
      </li>
    );
  }
);

export default memo(MessageItem);
