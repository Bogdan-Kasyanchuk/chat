import { Badge, Text } from '@mantine/core';
import { IconCheck, IconChecks, IconVolumeOff } from '@tabler/icons-react';
import type { FC } from 'react';
import { NavLink } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import { formatListTime } from '@/lib/formatTime';
import type { ChatSummary } from '@/types/chat';

import classes from './ChatListItem.module.css';

type ChatListItemProps = {
    chat: ChatSummary,
    active: boolean,
    now: number
};

const MAX_BADGE = 99;

const ChatListItem: FC<ChatListItemProps> = ({ chat, active, now }) => {
    const { partner, lastMessage, unread, muted } = chat;

    return (
        <NavLink
            to={ `/chat/${ chat.chatId }` }
            className={ classes.item }
            data-active={ active || undefined }
            data-muted={ muted || undefined }
        >
            <PresenceAvatar
                userId={ partner.userId }
                name={ partner.name }
                avatar={ partner.avatar }
                size={ 44 }
                online={ partner.online }
            />
            <div className={ classes.body }>
                <div className={ classes.row }>
                    <Text
                        className={ classes.name }
                        truncate
                    >
                        { partner.name }
                    </Text>
                    { muted && (
                        <IconVolumeOff
                            className={ classes.meta }
                            size={ 15 }
                            aria-label="Muted"
                        />
                    ) }
                    { lastMessage?.authorIsMe && (lastMessage.read
                        ? (
                            <IconChecks
                                className={ classes.read }
                                size={ 17 }
                                aria-label="Read"
                            />
                        )
                        : (
                            <IconCheck
                                className={ classes.meta }
                                size={ 17 }
                                aria-label="Sent"
                            />
                        )) }
                    { lastMessage && (
                        <Text
                            size="sm"
                            className={ classes.time }
                        >
                            { formatListTime(lastMessage.createdAt, now) }
                        </Text>
                    ) }
                </div>
                <div className={ classes.row }>
                    <Text
                        className={ classes.preview }
                        size="sm"
                        truncate
                    >
                        { lastMessage
                            ? `${ lastMessage.authorIsMe ? 'You: ' : '' }${ lastMessage.body }`
                            : 'No messages yet' }
                    </Text>
                    { unread > 0 && (
                        <Badge
                            className={ classes.badge }
                            color={ muted ? 'gray' : undefined }
                            data-muted={ muted || undefined }
                        >
                            { unread > MAX_BADGE ? `${ MAX_BADGE }+` : unread }
                        </Badge>
                    ) }
                </div>
            </div>
        </NavLink>
    );
};

export default ChatListItem;
