import { Button, Center, Loader, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery } from 'convex/react';
import { type FC, useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';

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

// Непередбачена помилка: чесно кажемо, що щось зламалось, і даємо шлях назад
const ChatFailed: FC = () => (
    <Center h="100%">
        <Stack align="center">
            <Text>Something went wrong</Text>
            <Button
                component={ Link }
                to="/"
                variant="default"
            >
                Back to chats
            </Button>
        </Stack>
    </Center>
);

const ConversationLoader: FC<{ chatId: Id<'chats'> }> = ({ chatId }) => {
    const chat = useQuery(api.chats.get, { chatId });
    // Чат видаляю я сам: його зникнення — не «Chat not found», перехід на «/» уже йде
    const [ leaving, setLeaving ] = useState(false);

    if (chat === undefined) {
        return (
            <Center h="100%">
                <Loader />
            </Center>
        );
    }

    if (chat === null) {
        return leaving
            ? (
                <Navigate
                    to="/"
                    replace
                />
            )
            : <ChatNotFound />;
    }

    return (
        <Conversation
            chat={ chat }
            onLeave={ () => {
                setLeaving(true);
            } }
        />
    );
};

const ConversationPage: FC = () => {
    const chatId = useParams().chatId as Id<'chats'>;

    // key: інший чат — новий стан (відповідь, знімок прочитаного, прокрутка, помилка)
    return (
        <ChatErrorBoundary
            key={ chatId }
            notFound={ <ChatNotFound /> }
            fallback={ <ChatFailed /> }
        >
            <ConversationLoader chatId={ chatId } />
        </ChatErrorBoundary>
    );
};

export default ConversationPage;
