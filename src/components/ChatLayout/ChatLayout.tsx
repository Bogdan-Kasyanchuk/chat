import type { FC } from 'react';
import { Outlet, useMatch } from 'react-router';

import EmptyChat from '@/components/EmptyChat';
import Sidebar from '@/components/Sidebar';
import useIsDesktop from '@/hooks/useIsDesktop';
import usePresenceHeartbeat from '@/hooks/usePresenceHeartbeat';

import classes from './ChatLayout.module.css';

const ChatLayout: FC = () => {
    usePresenceHeartbeat();

    const isDesktop = useIsDesktop();
    const inChat = useMatch('/chat/:chatId') !== null;

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
