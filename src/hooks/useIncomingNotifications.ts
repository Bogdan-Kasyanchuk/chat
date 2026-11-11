import { rem } from '@mantine/core';
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

const TOAST_LIMIT = 120;

// Components → Toasts · more: ім'я 15 / 600, один рядок повідомлення з трикрапкою; аватар 40 замість іконки
const TOAST_STYLES = {
    title: { fontSize: rem(15), fontWeight: 600 },
    description: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }
} as const;

// Довге повідомлення в toast обрізаємо; за кодовими точками, щоб не розрізати емодзі навпіл
const clip = (text: string): string => {
    const chars = Array.from(text);

    return chars.length > TOAST_LIMIT ? `${ chars.slice(0, TOAST_LIMIT).join('') }…` : text;
};

const toastId = (chatId: string) => `incoming-${ chatId }`;

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

    // Відкритий чат свого toast-а більше не потребує: на телефоні той стоїть над композером і закривав би стрічку
    useEffect(() => {
        if (activeChatId !== null) {
            notifications.hide(toastId(activeChatId));
        }
    }, [ activeChatId ]);

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
            const id = toastId(chat.chatId);

            notifications.show({
                id,
                title: chat.partner.name,
                message: clip(chat.lastMessage?.body ?? ''),
                icon: createElement(PresenceAvatar, { userId: chat.partner.userId, name: chat.partner.name, avatar: chat.partner.avatar, size: 40 }),
                style: { cursor: 'pointer' },
                styles: TOAST_STYLES,
                onClick: () => {
                    notifications.hide(id);
                    void go(`/chat/${ chat.chatId }`);
                }
            });
        });
    }, [ chats ]);
};

export default useIncomingNotifications;
