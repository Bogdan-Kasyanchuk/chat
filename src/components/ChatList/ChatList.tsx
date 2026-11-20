import { Button, Text } from '@mantine/core';
import { IconMessageCircle, IconSearch, IconUserPlus } from '@tabler/icons-react';
import { useQuery } from 'convex/react';
import type { FC, ReactNode } from 'react';
import { useMatch } from 'react-router';

import ChatListItem from '@/components/ChatListItem';
import ChatListSkeleton from '@/components/ChatListSkeleton';
import ContactItem from '@/components/ContactItem';
import EmptyState from '@/components/EmptyState';
import useNow from '@/hooks/useNow';
import useOpenChatWith from '@/hooks/useOpenChatWith';
import { api } from '@convex/_generated/api';

import classes from './ChatList.module.css';

type ChatListProps = {
    search: string,
    onAddContact: () => void,
    // Під непорожнім списком: «New chat» на десктопі
    footer?: ReactNode
};

const includes = (name: string, query: string) => name.toLowerCase().includes(query.toLowerCase());

// Артборди Chats, ChatsEmpty, SearchEmpty, Loading. Пошук шукає й серед контактів, з якими ще немає чату в списку
const ChatList: FC<ChatListProps> = ({ search, onAddContact, footer }) => {
    const chats = useQuery(api.chats.list);
    const contacts = useQuery(api.contacts.list);
    const activeChatId = useMatch('/chat/:chatId')?.params.chatId;
    const openChatWith = useOpenChatWith();
    const now = useNow();

    if (!chats) {
        return <ChatListSkeleton />;
    }

    const addContact = (
        <Button
            radius="xl"
            fz="md"
            leftSection={
                <IconUserPlus
                    size={ 18 }
                    aria-hidden
                />
            }
            onClick={ onAddContact }
        >
            Add contact
        </Button>
    );

    const query = search.trim();

    if (chats.length === 0 && !query) {
        return (
            <div className={ classes.center }>
                <EmptyState
                    icon={
                        <IconMessageCircle
                            size={ 36 }
                            stroke={ 1.6 }
                            aria-hidden
                        />
                    }
                    title="No chats yet"
                    text="Add people by email to start a conversation."
                    action={ addContact }
                />
            </div>
        );
    }

    const visible = chats.filter(chat => includes(chat.partner.name, query));
    const partners = new Set(visible.map(chat => chat.partner.userId));
    const people = query
        ? (contacts ?? []).filter(contact => !partners.has(contact.userId) && includes(contact.name, query))
        : [];

    // Без чатів, що підійшли, «No results» правдивий лише після відповіді контактів
    if (query && visible.length === 0 && contacts === undefined) {
        return <ChatListSkeleton />;
    }

    if (visible.length === 0 && people.length === 0) {
        return (
            <div className={ classes.center }>
                <EmptyState
                    icon={
                        <IconSearch
                            size={ 36 }
                            stroke={ 1.8 }
                            color="var(--chat-muted)"
                            aria-hidden
                        />
                    }
                    title="No results"
                    text={ `No chats or contacts match “${ query }”. To start a chat with someone new, add them by email.` }
                    action={ addContact }
                />
            </div>
        );
    }

    return (
        <>
            <nav
                aria-label="Chats"
                className={ classes.list }
                data-footer={ footer ? true : undefined }
            >
                { visible.map(chat => (
                    <ChatListItem
                        key={ chat.chatId }
                        chat={ chat }
                        active={ chat.chatId === activeChatId }
                        now={ now }
                    />
                )) }
                { people.length > 0 && (
                    <>
                        <Text
                            className={ classes.heading }
                            size="sm"
                            fw={ 600 }
                            c="dimmed"
                        >
                            Contacts
                        </Text>
                        { people.map(contact => (
                            <ContactItem
                                key={ contact.userId }
                                contact={ contact }
                                now={ now }
                                onOpen={ item => {
                                    void openChatWith(item.userId);
                                } }
                            />
                        )) }
                    </>
                ) }
            </nav>
            { footer }
        </>
    );
};

export default ChatList;
