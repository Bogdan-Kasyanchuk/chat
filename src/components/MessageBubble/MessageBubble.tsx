import { Text, UnstyledButton } from '@mantine/core';
import { IconCheck, IconChecks } from '@tabler/icons-react';
import { type FC, type KeyboardEvent, useId } from 'react';

import { emojiOnlyCount } from '@/lib/emoji';
import { formatClock } from '@/lib/formatTime';
import type { MessageView } from '@/types/chat';

import classes from './MessageBubble.module.css';

type MessageBubbleProps = {
    message: MessageView,
    partnerName: string,
    selected?: boolean,
    // Межі групи: first — більший відступ згори, last — «хвостик» (менший радіус кута з боку автора)
    first?: boolean,
    last?: boolean,
    // Режим вибору: клік перемикає вибір, цитата нікуди не веде
    onClick?: () => void,
    onDoubleClick?: () => void,
    onQuoteClick?: (messageId: MessageView[ 'id' ]) => void
};

const MessageBubble: FC<MessageBubbleProps> = ({ message, partnerName, selected = false, first = true, last = true, onClick, onDoubleClick, onQuoteClick }) => {
    const { authorIsMe, replyTo } = message;
    // id === null — оригінал видалено: цитата лишається, але нікуди не веде
    const quoteId = replyTo?.id ?? null;
    // Від 1 до 3 емодзі без тексту, цитати й пересилання — велика «наліпка» без бульбашки
    const emojiCount = emojiOnlyCount(message.body);
    const emojiOnly = emojiCount >= 1 && emojiCount <= 3 && !replyTo && !message.forwardedFrom;
    const quoteClick = onClick ? undefined : onQuoteClick;
    const bodyId = useId();

    // Кружечок вибору — checkbox для клавіатури й читача екрана: Space і Enter перемикають, як клік по рядку
    const toggleByKey = (event: KeyboardEvent) => {
        if (onClick && (event.key === ' ' || event.key === 'Enter')) {
            event.preventDefault();
            onClick();
        }
    };
    // span, а не p: цитата буває кнопкою, а в <button> блочним елементам не місце
    const quoteContent = replyTo && (
        <>
            { replyTo.authorName && (
                <Text
                    className={ classes.quoteAuthor }
                    component="span"
                    display="block"
                    size="sm"
                    truncate
                >
                    { replyTo.authorName }
                </Text>
            ) }
            <Text
                className={ classes.quoteBody }
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
            data-first={ first || undefined }
            data-message-id={ message.id }
            onClick={ onClick }
        >
            { /* Режим вибору: кружечок 22 ліворуч, з галочкою — вибране (артборди Selection, MobileSelection) */ }
            { onClick && (
                <span
                    className={ classes.check }
                    role="checkbox"
                    tabIndex={ 0 }
                    aria-checked={ selected }
                    aria-labelledby={ bodyId }
                    data-checked={ selected || undefined }
                    data-check
                    onKeyDown={ toggleByKey }
                >
                    { selected && (
                        <IconCheck
                            size={ 14 }
                            stroke={ 3 }
                            aria-hidden
                        />
                    ) }
                </span>
            ) }
            <div
                className={ classes.bubble }
                role="article"
                aria-label={ authorIsMe ? 'You' : partnerName }
                data-mine={ authorIsMe || undefined }
                data-emoji-only={ emojiOnly || undefined }
                data-first={ first || undefined }
                data-last={ last || undefined }
                onDoubleClick={ onDoubleClick }
            >
                { message.forwardedFrom && (
                    <Text
                        className={ classes.forwarded }
                        size="sm"
                        fw={ 600 }
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
                <Text
                    id={ bodyId }
                    className={ classes.body }
                >
                    { message.body }
                </Text>
                { /* У повідомлення з 1–3 емодзі бульбашки немає: час і галочки — на плашці під ними */ }
                <div
                    className={ classes.meta }
                    data-chip={ emojiOnly || undefined }
                >
                    { message.editedAt !== null && <span>edited</span> }
                    <time dateTime={ new Date(message.createdAt).toISOString() }>{ formatClock(message.createdAt) }</time>
                    { authorIsMe && (message.read
                        ? (
                            <IconChecks
                                className={ classes.read }
                                size={ 16 }
                                stroke={ 2.2 }
                                aria-label="Read"
                            />
                        )
                        : (
                            <IconCheck
                                size={ 16 }
                                stroke={ 2.2 }
                                aria-label="Sent"
                            />
                        )) }
                </div>
            </div>
        </div>
    );
};

export default MessageBubble;
