import { FC } from 'react';

import { Avatar, Box, List, Text } from '@mantine/core';

import getLocaleDate from '@/helpers/getLocaleDate';

// import useStyles from './MessageItem.styles';

const MessageItem: FC<{ el: any }> = ({ el }) => {
  // const { classes: c } = useStyles();

  return (
    <List.Item>
      <Avatar
        size={50}
        radius='xl'
        src='https://lh3.googleusercontent.com/a/AGNmyxYVYM2tRUxhS3shuKbRV58EFy3N14MFixvTe2I=s96-c'
        alt='dsf'
      />
      <Box>
        <Text component='p'>{el.body}</Text>
        <Text component='time'>
          {getLocaleDate(el.date, {
            day: 'numeric',
            month: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Text>
      </Box>
    </List.Item>
  );
};

export default MessageItem;
