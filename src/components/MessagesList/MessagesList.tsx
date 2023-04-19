import { forwardRef } from 'react';

import { MessageItem } from '@/components';

import type IMessagesListProps from './IMessagesListProps';

const MessagesList = forwardRef<HTMLLIElement, IMessagesListProps>(
  ({ messages, contact, idFirstNotReadMessage }, ref) => {
    return (
      <ul>
        {messages?.map((message) => (
          <MessageItem
            key={message.id}
            message={message}
            contact={contact}
            idFirstNotReadMessage={idFirstNotReadMessage}
            ref={ref}
          />
        ))}
      </ul>
    );
  },
);

export default MessagesList;
