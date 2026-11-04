import { Center, Loader, Text } from '@mantine/core';
import { useQuery } from 'convex/react';
import type { FC } from 'react';
import { useMatch } from 'react-router';

import ChatListItem from '@/components/ChatListItem';
import useNow from '@/hooks/useNow';
import { api } from '@convex/_generated/api';

type ChatListProps = {
    search: string
};

const ChatList: FC<ChatListProps> = ({ search }) => {
    const chats = useQuery(api.chats.list);
    const activeChatId = useMatch('/chat/:chatId')?.params.chatId;
    const now = useNow();

    if (!chats) {
        return (
            <Center p="md">
                <Loader size="sm" />
            </Center>
        );
    }

    const query = search.trim().toLowerCase();
    const visible = chats.filter(chat => chat.partner.name.toLowerCase().includes(query));

    if (visible.length === 0) {
        return (
            <Text
                c="dimmed"
                ta="center"
                p="md"
            >
                { query ? 'No chats found' : 'No chats yet. Add a contact to start one.' }
            </Text>
        );
    }

    return visible.map(chat => (
        <ChatListItem
            key={ chat.chatId }
            chat={ chat }
            active={ chat.chatId === activeChatId }
            now={ now }
        />
    ));
};

export default ChatList;
