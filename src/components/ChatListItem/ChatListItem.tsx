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
                name={ partner.name }
                avatar={ partner.avatar }
                size={ 48 }
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
                    { lastMessage && (
                        <Text
                            size="xs"
                            className={ classes.time }
                            c="dimmed"
                        >
                            { formatListTime(lastMessage.createdAt, now) }
                        </Text>
                    ) }
                </div>
                <div className={ classes.row }>
                    <Text
                        className={ classes.preview }
                        size="sm"
                        c="dimmed"
                        truncate
                    >
                        { lastMessage
                            ? `${ lastMessage.authorIsMe ? 'You: ' : '' }${ lastMessage.body }`
                            : 'No messages yet' }
                    </Text>
                    <div className={ classes.row }>
                        { lastMessage?.authorIsMe && (lastMessage.read
                            ? (
                                <IconChecks
                                    size={ 16 }
                                    aria-label="Read"
                                />
                            )
                            : (
                                <IconCheck
                                    size={ 16 }
                                    aria-label="Sent"
                                />
                            )) }
                        { muted && (
                            <IconVolumeOff
                                size={ 16 }
                                aria-label="Muted"
                            />
                        ) }
                        { unread > 0 && (
                            <Badge
                                circle={ unread < 10 }
                                color={ muted ? 'gray' : 'dark' }
                                data-muted={ muted || undefined }
                            >
                                { unread > MAX_BADGE ? `${ MAX_BADGE }+` : unread }
                            </Badge>
                        ) }
                    </div>
                </div>
            </div>
        </NavLink>
    );
};

export default ChatListItem;
