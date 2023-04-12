import { forwardRef } from 'react';

import { MessageItem } from '@/components';

import { IMessagesListProps } from '@/interfaces';

const MessagesList = forwardRef<HTMLLIElement, IMessagesListProps>(
  ({ messages, contact, idFirstNotReadMessage }, ref) => {
    return (
      <ul>
        {messages.map((el) => (
          <MessageItem
            key={el.id}
            el={el}
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
