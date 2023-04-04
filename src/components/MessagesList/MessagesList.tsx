import { FC } from 'react';

// import useStyles from './MessagesList.styles';
import { MessageItem } from '@/components';

const MessagesList: FC<{ messages: any }> = ({ messages }) => {
  // const { classes: c } = useStyles();

  return (
    <ul>
      {messages.map((el: any) => (
        <MessageItem key={el.id} el={el} />
      ))}
    </ul>
  );
};

export default MessagesList;
