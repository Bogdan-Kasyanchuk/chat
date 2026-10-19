import { Center, Loader } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery } from 'convex/react';
import { type FC, useEffect } from 'react';
import { Navigate, useParams } from 'react-router';

import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';
import { CHAT_NOT_FOUND } from '@convex/chatRules';

import ChatErrorBoundary from './ChatErrorBoundary';
import Conversation from './Conversation';

// Чату немає (видалений, чужий, зіпсована адреса): toast і на головну
const ChatNotFound: FC = () => {
    useEffect(() => {
        // id не дає показати toast двічі (StrictMode, повторний рендер до переходу)
        notifications.show({ id: 'chat-not-found', color: 'red', message: CHAT_NOT_FOUND });
    }, []);

    return (
        <Navigate
            to="/"
            replace
        />
    );
};

const ConversationLoader: FC<{ chatId: Id<'chats'> }> = ({ chatId }) => {
    const chat = useQuery(api.chats.get, { chatId });

    if (chat === undefined) {
        return (
            <Center h="100%">
                <Loader />
            </Center>
        );
    }

    if (chat === null) {
        return <ChatNotFound />;
    }

    return <Conversation chat={ chat } />;
};

const ConversationPage: FC = () => {
    const chatId = useParams().chatId as Id<'chats'>;

    // key: інший чат — новий стан (відповідь, знімок прочитаного, прокрутка, помилка)
    return (
        <ChatErrorBoundary
            key={ chatId }
            fallback={ <ChatNotFound /> }
        >
            <ConversationLoader chatId={ chatId } />
        </ChatErrorBoundary>
    );
};

export default ConversationPage;
