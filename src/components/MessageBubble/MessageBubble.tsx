import { Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChecks } from '@tabler/icons-react';
import type { FC, MouseEvent } from 'react';

import { formatClock } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

import classes from './MessageBubble.module.css';

type MessageBubbleProps = {
    message: MessageView,
    partnerName: string,
    selected?: boolean,
    onContextMenu?: (event: MouseEvent<HTMLDivElement>) => void,
    onDoubleClick?: () => void,
    onQuoteClick?: (messageId: MessageView[ 'id' ]) => void
};

const MessageBubble: FC<MessageBubbleProps> = ({ message, partnerName, selected = false, onContextMenu, onDoubleClick, onQuoteClick }) => {
    const { authorIsMe, replyTo } = message;
    // id === null — оригінал видалено: цитата лишається, але нікуди не веде
    const quoteId = replyTo?.id ?? null;
    const quoteContent = replyTo && (
        <>
            { replyTo.authorName && (
                <Text
                    className={ classes.quoteAuthor }
                    size="xs"
                    truncate
                >
                    { replyTo.authorName }
                </Text>
            ) }
            <Text
                size="sm"
                truncate
            >
                { replyTo.body }
            </Text>
        </>
    );

    return (
        <div
            className={ classes.row }
            data-mine={ authorIsMe || undefined }
            data-selected={ selected || undefined }
            data-message-id={ message.id }
        >
            <div
                className={ classes.bubble }
                role="article"
                aria-label={ authorIsMe ? 'You' : partnerName }
                data-mine={ authorIsMe || undefined }
                onContextMenu={ onContextMenu }
                onDoubleClick={ onDoubleClick }
            >
                { message.forwardedFrom && (
                    <Text
                        className={ classes.forwarded }
                        size="xs"
                    >
                        Forwarded from { message.forwardedFrom }
                    </Text>
                ) }
                { replyTo && (quoteId && onQuoteClick
                    ? (
                        <UnstyledButton
                            className={ classes.quote }
                            onClick={ () => {
                                onQuoteClick(quoteId);
                            } }
                        >
                            { quoteContent }
                        </UnstyledButton>
                    )
                    : <div className={ classes.quote }>{ quoteContent }</div>) }
                <Text className={ classes.body }>{ message.body }</Text>
                <div className={ classes.meta }>
                    { message.editedAt !== null && <span>edited</span> }
                    <time dateTime={ new Date(message.createdAt).toISOString() }>{ formatClock(message.createdAt) }</time>
                    { authorIsMe && (message.read
                        ? (
                            <IconChecks
                                size={ 14 }
                                aria-label="Read"
                            />
                        )
                        : (
                            <IconCheck
                                size={ 14 }
                                aria-label="Sent"
                            />
                        )) }
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
