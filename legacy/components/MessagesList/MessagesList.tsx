import { forwardRef, memo } from 'react';

import { MessageItem } from '@/components';

import type IMessagesListProps from './IMessagesListProps';

const MessagesList = forwardRef<HTMLDivElement, IMessagesListProps>(
  ({ messages, contact, idFirstNotReadMessage }, ref) => {
    return (
      <ul style={{ paddingTop: messages.length === 1 && idFirstNotReadMessage ? '15px' : '0' }}>
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
  }
);

export default memo(MessagesList);
