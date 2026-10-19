import { useQuery } from 'convex/react';
import type { FC } from 'react';
import { Outlet, useMatch } from 'react-router';

import EmptyChat from '@/components/EmptyChat';
import Sidebar from '@/components/Sidebar';
import useIncomingNotifications from '@/hooks/useIncomingNotifications';
import useIsDesktop from '@/hooks/useIsDesktop';
import usePresenceHeartbeat from '@/hooks/usePresenceHeartbeat';
import { api } from '@convex/_generated/api';

import classes from './ChatLayout.module.css';

const ChatLayout: FC = () => {
    usePresenceHeartbeat();

    const isDesktop = useIsDesktop();
    const chatMatch = useMatch('/chat/:chatId');
    const inChat = chatMatch !== null;
    // Той самий запит, що й у ChatList: Convex-клієнт зводить однакові підписки в одну
    const chats = useQuery(api.chats.list);

    useIncomingNotifications(chats, chatMatch?.params.chatId ?? null);

    // Телефон: або список на «/», або чат; десктоп: список і чат поруч
    if (!isDesktop) {
        return inChat
            ? <main className={ classes.main }><Outlet /></main>
            : <div className={ classes.sidebar }><Sidebar /></div>;
    }

    return (
        <div className={ classes.layout }>
            <div className={ classes.sidebar }>
                <Sidebar />
            </div>
            <main className={ classes.main }>
                { inChat ? <Outlet /> : <EmptyChat /> }
            </main>
        </div>
    );
};

export default ChatLayout;
