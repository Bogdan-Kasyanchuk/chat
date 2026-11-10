import { notifications } from '@mantine/notifications';
import { useMutation } from 'convex/react';
import { useCallback } from 'react';
import { useNavigate } from 'react-router';

import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

// Відкриває чат з людиною і переходить у нього. Завжди через chats.open: чат може бути прихований для мене,
// і лише open повертає його в мій список. true — чат відкрито, false — помилку показано toast-ом
const useOpenChatWith = () => {
    const openChat = useMutation(api.chats.open);
    const navigate = useNavigate();

    return useCallback(async (userId: Id<'users'>): Promise<boolean> => {
        try {
            const chatId = await openChat({ userId });

            await navigate(`/chat/${ chatId }`);

            return true;
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });

            return false;
        }
    }, [ openChat, navigate ]);
};

export default useOpenChatWith;
