import { Text, UnstyledButton, VisuallyHidden } from '@mantine/core';
import { IconChevronLeft } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import StatusText from '@/components/StatusText';
import useIsDesktop from '@/hooks/useIsDesktop';
import { badgeText, unreadTotal } from '@/lib/unread';
import type { ChatView } from '@/types/chat';
import { api } from '@convex/_generated/api';

import classes from './ConversationHeader.module.css';

type ConversationHeaderProps = {
    chat: ChatView,
    now: number,
    // Праворуч — меню налаштувань чату
    actions?: ReactNode
};

// На телефоні «назад» несе лічильник непрочитаних в інших чатах (Components → Headers · Phone · conversation)
const BackToChats: FC<{ chatId: string }> = ({ chatId }) => {
    // Той самий запит, що й у ChatLayout: Convex-клієнт зводить однакові підписки в одну
    const unread = unreadTotal(useQuery(api.chats.list), chatId);

    return (
        <UnstyledButton
            className={ classes.back }
            component={ Link }
            to="/"
        >
            <IconChevronLeft
                size={ 24 }
                stroke={ 2.2 }
                aria-hidden
            />
            <VisuallyHidden>Back to chats</VisuallyHidden>
            { unread > 0 && (
                <>
                    <span
                        className={ classes.badge }
                        aria-hidden
                    >
                        { badgeText(unread) }
                    </span>
                    <VisuallyHidden>{ `, ${ unread } unread` }</VisuallyHidden>
                </>
            ) }
        </UnstyledButton>
    );
};

const ConversationHeader: FC<ConversationHeaderProps> = ({ chat, now, actions }) => {
    const isDesktop = useIsDesktop();
    const { partner } = chat;

    return (
        <header className={ classes.header }>
            { !isDesktop && <BackToChats chatId={ chat.chatId } /> }
            <PresenceAvatar
                userId={ partner.userId }
                name={ partner.name }
                avatar={ partner.avatar }
                size={ 44 }
                online={ partner.online }
            />
            <div className={ classes.body }>
                <Text
                    className={ classes.name }
                    truncate
                >
                    { partner.name }
                </Text>
                { /* У видаленого акаунта немає статусу */ }
                { partner.userId !== null && (
                    <StatusText
                        lastSeenAt={ partner.lastSeenAt }
                        now={ now }
                        online={ partner.online }
                    />
                ) }
            </div>
            { actions }
        </header>
    );
};

export default ConversationHeader;
