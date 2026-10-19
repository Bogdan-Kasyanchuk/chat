import { Center, Loader, Modal, ScrollArea, Text, TextInput, UnstyledButton } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { useMutation, useQuery } from 'convex/react';
import { type FC, useState } from 'react';
import { useNavigate } from 'react-router';

import PresenceAvatar from '@/components/PresenceAvatar';
import errorMessage from '@/lib/errorMessage';
import { api } from '@convex/_generated/api';
import type { Id } from '@convex/_generated/dataModel';

import classes from './ForwardModal.module.css';

type ForwardModalProps = {
    messageIds: Id<'messages'>[],
    // true — переслано (і вже йде перехід у цільовий чат), false — закрито без пересилання
    onDone: (forwarded: boolean) => void
};

type Target = {
    key: string,
    // null — контакт без чату: чат спершу відкривається
    chatId: Id<'chats'> | null,
    userId: Id<'users'>,
    name: string,
    avatar: string | null,
    online: boolean
};

const ForwardModal: FC<ForwardModalProps> = ({ messageIds, onDone }) => {
    const chats = useQuery(api.chats.list);
    const contacts = useQuery(api.contacts.list);
    const openChat = useMutation(api.chats.open);
    const forward = useMutation(api.messages.forward);
    const navigate = useNavigate();
    const [ search, setSearch ] = useState('');
    const [ busy, setBusy ] = useState(false);

    const loading = chats === undefined || contacts === undefined;
    const targets: Target[] = [];

    if (!loading) {
        // Видаленому акаунту не написати; контакт, з яким уже є чат, показуємо раз — як чат
        for (const { chatId, partner } of chats) {
            if (partner.userId !== null) {
                targets.push({ key: chatId, chatId, userId: partner.userId, name: partner.name, avatar: partner.avatar, online: partner.online });
            }
        }

        const inChats = new Set(targets.map(target => target.userId));

        for (const contact of contacts) {
            if (!inChats.has(contact.userId)) {
                targets.push({ key: contact.userId, chatId: null, userId: contact.userId, name: contact.name, avatar: contact.avatar, online: contact.online });
            }
        }
    }

    const query = search.trim().toLowerCase();
    const visible = targets.filter(target => target.name.toLowerCase().includes(query));

    const send = async (target: Target) => {
        if (busy) {
            return;
        }

        setBusy(true);

        try {
            const toChatId = target.chatId ?? await openChat({ userId: target.userId });

            await forward({ messageIds, toChatId });
            onDone(true);
            await navigate(`/chat/${ toChatId }`);
        } catch (error) {
            notifications.show({ color: 'red', message: errorMessage(error) });
            setBusy(false);
        }
    };

    return (
        <Modal
            title="Forward to"
            closeOnClickOutside={ !busy }
            closeOnEscape={ !busy }
            withCloseButton={ !busy }
            opened
            centered
            onClose={ () => {
                onDone(false);
            } }
        >
            <TextInput
                aria-label="Search"
                placeholder="Search"
                leftSection={ <IconSearch size={ 16 } /> }
                value={ search }
                data-autofocus
                onChange={ event => {
                    setSearch(event.currentTarget.value);
                } }
            />
            <ScrollArea.Autosize
                mah={ 360 }
                mt="sm"
            >
                { loading && (
                    <Center p="md">
                        <Loader size="sm" />
                    </Center>
                ) }
                { !loading && visible.length === 0 && (
                    <Text
                        c="dimmed"
                        ta="center"
                        p="md"
                    >
                        { query ? 'Nothing found' : 'No chats or contacts yet' }
                    </Text>
                ) }
                { visible.map(target => (
                    <UnstyledButton
                        key={ target.key }
                        className={ classes.item }
                        disabled={ busy }
                        onClick={ () => {
                            void send(target);
                        } }
                    >
                        <PresenceAvatar
                            name={ target.name }
                            avatar={ target.avatar }
                            size={ 40 }
                            online={ target.online }
                        />
                        <Text
                            fw={ 600 }
                            truncate
                        >
                            { target.name }
                        </Text>
                    </UnstyledButton>
                )) }
            </ScrollArea.Autosize>
        </Modal>
    );
};

export default ForwardModal;
