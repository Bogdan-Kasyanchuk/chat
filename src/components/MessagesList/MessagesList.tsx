import { FC } from 'react';

import { MessageItem } from '@/components';

const MessagesList: FC<{ messages: any }> = ({ messages }) => {
  return (
    <ul>
      {messages.map((el: any) => (
        <MessageItem key={el.id} el={el} />
      ))}
    </ul>
  );
};

export default MessagesList;
