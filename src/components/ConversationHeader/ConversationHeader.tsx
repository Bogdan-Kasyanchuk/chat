import { ActionIcon, Text } from '@mantine/core';
import { IconArrowLeft } from '@tabler/icons-react';
import type { FC, ReactNode } from 'react';
import { Link } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import StatusText from '@/components/StatusText';
import useIsDesktop from '@/hooks/useIsDesktop';
import type { ChatView } from '@/types/chat';

import classes from './ConversationHeader.module.css';

type ConversationHeaderProps = {
    chat: ChatView,
    now: number,
    // Праворуч — меню налаштувань чату
    actions?: ReactNode
};

const ConversationHeader: FC<ConversationHeaderProps> = ({ chat, now, actions }) => {
    const isDesktop = useIsDesktop();
    const { partner } = chat;

    return (
        <header className={ classes.header }>
            { !isDesktop && (
                <ActionIcon
                    component={ Link }
                    to="/"
                    variant="subtle"
                    color="gray"
                    size="lg"
                    aria-label="Back to chats"
                >
                    <IconArrowLeft size={ 22 } />
                </ActionIcon>
            ) }
            <PresenceAvatar
                name={ partner.name }
                avatar={ partner.avatar }
                size={ 40 }
                online={ partner.online }
            />
            <div className={ classes.body }>
                <Text
                    fw={ 600 }
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
