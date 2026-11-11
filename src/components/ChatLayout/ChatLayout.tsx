import { Transition } from '@mantine/core';
import { useQuery } from 'convex/react';
import { type FC, type ReactNode, useState } from 'react';
import { useMatch, useOutlet } from 'react-router';

import ChatWallpaper from '@/components/ChatWallpaper';
import EmptyChat from '@/components/EmptyChat';
import Sidebar from '@/components/Sidebar';
import useIncomingNotifications from '@/hooks/useIncomingNotifications';
import useIsDesktop from '@/hooks/useIsDesktop';
import usePresenceHeartbeat from '@/hooks/usePresenceHeartbeat';
import { api } from '@convex/_generated/api';

import classes from './ChatLayout.module.css';

// Виїзд розмови на телефоні (рішення «Розкладка телефона»); з prefers-reduced-motion тема робить його миттєвим
const SLIDE_MS = 200;

const ChatLayout: FC = () => {
    usePresenceHeartbeat();

    const isDesktop = useIsDesktop();
    const outlet = useOutlet();
    const chatMatch = useMatch('/chat/:chatId');
    const chatId = chatMatch?.params.chatId ?? null;
    // Той самий запит, що й у ChatList: Convex-клієнт зводить однакові підписки в одну
    const chats = useQuery(api.chats.list);
    // Розмова, що від'їжджає: адреса вже «/», а вміст має лишатися на місці до кінця анімації
    const [ leaving, setLeaving ] = useState<{ chatId: string, content: ReactNode } | null>(null);

    if (chatId !== null && leaving?.chatId !== chatId) {
        setLeaving({ chatId, content: outlet });
    }

    useIncomingNotifications(chats, chatId);

    if (isDesktop) {
        return (
            <div className={ classes.layout }>
                <div className={ classes.sidebar }>
                    <Sidebar />
                </div>
                <ChatWallpaper className={ classes.main }>
                    { chatId !== null ? outlet : <EmptyChat /> }
                </ChatWallpaper>
            </div>
        );
    }

    // Телефон: список на весь екран, розмова виїжджає справа поверх нього; список під нею недоступний
    return (
        <div className={ classes.phone }>
            <div
                className={ classes.sidebar }
                inert={ chatId !== null }
                data-chat-list
            >
                <Sidebar />
            </div>
            <Transition
                mounted={ chatId !== null }
                transition="slide-left"
                duration={ SLIDE_MS }
                timingFunction="ease"
                onExited={ () => {
                    setLeaving(null);
                } }
            >
                { styles => (
                    <ChatWallpaper
                        className={ classes.overlay }
                        style={ styles }
                    >
                        { chatId !== null ? outlet : leaving?.content }
                    </ChatWallpaper>
                ) }
            </Transition>
        </div>
    );
};

export default ChatLayout;
