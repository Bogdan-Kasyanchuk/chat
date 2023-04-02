import { FC } from 'react';

import { List } from '@mantine/core';

// import useStyles from './MessagesList.styles';
import { MessageItem } from '@/components';

const MessagesList: FC<{ messages: any }> = ({ messages }) => {
  // const { classes: c } = useStyles();

  return (
    <List>
      {messages.map((el: any) => (
        <MessageItem key={el.id} el={el} />
      ))}
    </List>
  );
};

export default MessagesList;
