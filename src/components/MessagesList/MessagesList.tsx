import { FC } from 'react';

import { MessageItem } from '@/components';

const MessagesList: FC<{ messages: any; contact: any }> = ({ messages, contact }) => {
  return (
    <ul>
      {messages.map((el: any) => (
        <MessageItem key={el.id} el={el} contact={contact} />
      ))}
    </ul>
  );
};

export default MessagesList;
