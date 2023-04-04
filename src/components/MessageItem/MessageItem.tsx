import { FC } from 'react';

import { Avatar, Box, Flex, Text } from '@mantine/core';

import getLocaleDate from '@/helpers/getLocaleDate';

import useStyles from './MessageItem.styles';

const MessageItem: FC<{ el: any }> = ({ el }) => {
  const { classes: c } = useStyles();

  return (
    <li className={c.item}>
      <Flex
        ml={el.id.startsWith('user') ? 'auto' : 0}
        maw={500}
        justify={el.id.startsWith('user') ? 'flex-end' : 'flex-start'}
      >
        {!el.id.startsWith('user') && (
          <Avatar
            mr={10}
            size={50}
            radius='xl'
            src='https://lh3.googleusercontent.com/a/AGNmyxYVYM2tRUxhS3shuKbRV58EFy3N14MFixvTe2I=s96-c'
            alt='dsf'
          />
        )}
        <Flex direction='column' align={el.id.startsWith('user') ? 'flex-end' : 'flex-start'}>
          <Text
            component='p'
            color={el.id.startsWith('user') ? 'black' : 'white'}
            bg={el.id.startsWith('user') ? 'gray.2' : '#3c4252'}
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
