import { useDocumentVisibility } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { useQuery } from 'convex/react';
import { createElement, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import findIncoming from '@/lib/incoming';
import { playSound } from '@/lib/sounds';
import type { ChatSummary } from '@/types/chat';
import { api } from '@convex/_generated/api';

const useIncomingNotifications = (chats: ChatSummary[] | undefined, activeChatId: string | null): void => {
    const me = useQuery(api.users.me);
    const navigate = useNavigate();
    const visibility = useDocumentVisibility();
    const previous = useRef<ChatSummary[] | undefined>(undefined);
    // Значення читаються в момент порівняння, а не потрапляють у залежності ефекту
    const latest = useRef({ sound: me?.sound, pageVisible: visibility === 'visible', activeChatId, navigate });

    // Оголошений раніше за ефект зі списком, тож той бачить свіжі значення
    useEffect(() => {
        latest.current = { sound: me?.sound, pageVisible: visibility === 'visible', activeChatId, navigate };
    });

    useEffect(() => {
        if (!chats) {
            return;
        }

        const { sound, pageVisible, activeChatId: active, navigate: go } = latest.current;
        const incoming = findIncoming(previous.current, chats, { activeChatId: active, pageVisible });

        previous.current = chats;

        if (incoming.length === 0) {
            return;
        }

        if (sound) {
            void playSound(sound);
        }

        incoming.forEach(chat => {
            const id = `incoming-${ chat.chatId }`;

            notifications.show({
                id,
                title: chat.partner.name,
                message: chat.lastMessage?.body,
                icon: createElement(PresenceAvatar, { name: chat.partner.name, avatar: chat.partner.avatar, size: 32 }),
                style: { cursor: 'pointer' },
                onClick: () => {
                    notifications.hide(id);
                    void go(`/chat/${ chat.chatId }`);
                }
            });
        });
    }, [ chats ]);
};

export default useIncomingNotifications;
