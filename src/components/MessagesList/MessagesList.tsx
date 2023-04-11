import type { FC } from 'react';

import { MessageItem } from '@/components';

import { IMessagesListProps } from '@/interfaces';

const MessagesList: FC<IMessagesListProps> = ({ messages, contact }) => {
  return (
    <ul>
      {messages.map((el: any) => (
        <MessageItem key={el.id} el={el} contact={contact} />
      ))}
    </ul>
  );
};

export default MessagesList;
