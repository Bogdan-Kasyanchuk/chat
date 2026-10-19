import { Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChecks } from '@tabler/icons-react';
import type { FC } from 'react';

import { formatClock } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

import classes from './MessageBubble.module.css';

type MessageBubbleProps = {
    message: MessageView,
    partnerName: string,
    selected?: boolean,
    // Режим вибору: клік перемикає вибір, цитата нікуди не веде
    onClick?: () => void,
    onDoubleClick?: () => void,
    onQuoteClick?: (messageId: MessageView[ 'id' ]) => void
};

const MessageBubble: FC<MessageBubbleProps> = ({ message, partnerName, selected = false, onClick, onDoubleClick, onQuoteClick }) => {
    const { authorIsMe, replyTo } = message;
    // id === null — оригінал видалено: цитата лишається, але нікуди не веде
    const quoteId = replyTo?.id ?? null;
    const quoteClick = onClick ? undefined : onQuoteClick;
    // span, а не p: цитата буває кнопкою, а в <button> блочним елементам не місце
    const quoteContent = replyTo && (
        <>
            { replyTo.authorName && (
                <Text
                    className={ classes.quoteAuthor }
                    component="span"
                    display="block"
                    size="xs"
                    truncate
                >
                    { replyTo.authorName }
                </Text>
            ) }
            <Text
                component="span"
                display="block"
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
            data-selectable={ onClick ? true : undefined }
            data-message-id={ message.id }
            onClick={ onClick }
        >
            <div
                className={ classes.bubble }
                role="article"
                aria-label={ authorIsMe ? 'You' : partnerName }
                data-mine={ authorIsMe || undefined }
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
                { replyTo && (quoteId && quoteClick
                    ? (
                        <UnstyledButton
                            className={ classes.quote }
                            onClick={ () => {
                                quoteClick(quoteId);
                            } }
                            // Подвійний клік по цитаті — це два переходи до оригіналу, а не відповідь
                            onDoubleClick={ event => {
                                event.stopPropagation();
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
